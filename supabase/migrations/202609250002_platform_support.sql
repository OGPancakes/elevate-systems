-- Requires the existing inquiries schema and Feather support migration first.
begin;
alter table public.inquiries
  add column platform_business_id uuid references public.platform_businesses(id),
  add column platform_environment text check (platform_environment in ('local','staging','production')),
  add column platform_request_id uuid,
  add column platform_payload_hash text,
  add column platform_version integer not null default 1;
create unique index platform_inquiry_receipt on public.inquiries(platform_business_id,platform_environment,platform_request_id);
alter table public.inquiries add constraint platform_inquiry_context check (
  (platform_business_id is null and platform_environment is null and platform_request_id is null)
  or (platform_business_id is not null and platform_environment is not null and platform_request_id is not null)
);
alter table public.inquiries drop constraint if exists inquiries_status_check;
alter table public.inquiries add constraint inquiries_status_check check (status in (
  'New','Contacted','Closed','Spam','Submitted','Reviewing','Approved','In Progress','Needs Information','Ready for Review','Completed','Declined','Cancelled'
));
alter table public.inquiries enable row level security;
-- Portal users never receive legacy internal notes or attachment storage keys.
revoke all on public.inquiries from authenticated,anon;
grant select(id,platform_business_id,platform_environment,platform_version,request_title,message,priority,affected_area,status,created_at,updated_at) on public.inquiries to authenticated;
create policy platform_inquiry_read on public.inquiries for select to authenticated using (
  public.platform_can_access(platform_business_id) and platform_environment=public.platform_environment()
);

create function public.platform_create_request(p_business uuid,p_environment text,p_request uuid,p_hash text,p_title text,p_description text,p_priority text,p_area text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare request_uuid uuid; prior public.inquiries; member_role text;
begin
  select role into member_role from public.platform_memberships where business_id=p_business and user_id=auth.uid() and active;
  if not public.platform_can_access(p_business) or member_role not in ('elevate_owner','elevate_admin','business_owner','business_admin') or p_environment is distinct from public.platform_environment() then
    raise exception 'access denied' using errcode='42501'; end if;
  if coalesce(length(trim(p_title)),0) not between 1 and 160 or coalesce(length(trim(p_description)),0) not between 1 and 8000
    or p_priority not in ('Low','Normal','High','Urgent') or length(coalesce(p_area,''))>500 or p_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid request' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_business::text||p_request::text,0));
  select * into prior from public.inquiries where platform_business_id=p_business and platform_environment=p_environment and platform_request_id=p_request;
  if found then
    if prior.platform_payload_hash<>p_hash then raise exception 'idempotency conflict' using errcode='23505'; end if;
    return jsonb_build_object('id',prior.id,'status',prior.status,'createdAt',prior.created_at,'duplicate',true);
  end if;
  insert into public.inquiries(name,email,message,source,status,request_title,priority,affected_area,platform_business_id,platform_environment,platform_request_id,platform_payload_hash)
    values('Portal member',null,p_description,'Client Portal','Submitted',p_title,p_priority,p_area,p_business,p_environment,p_request,p_hash) returning id into request_uuid;
  insert into public.platform_activity(business_id,environment,actor_type,actor_id,event_type,resource_id)
    values(p_business,p_environment,'user',auth.uid()::text,'change_request.created',request_uuid);
  return jsonb_build_object('id',request_uuid,'status','Submitted','createdAt',now(),'duplicate',false);
end;
$$;
create function public.platform_update_request(p_business uuid,p_environment text,p_request uuid,p_status text,p_version integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare next_version integer;
begin
  if not public.platform_can_access(p_business) or p_environment is distinct from public.platform_environment()
    or not exists(select 1 from public.platform_memberships where business_id=p_business and user_id=auth.uid() and active and role in ('elevate_owner','elevate_admin')) then
    raise exception 'access denied' using errcode='42501'; end if;
  if p_status not in ('Submitted','Reviewing','Approved','In Progress','Needs Information','Ready for Review','Completed','Declined','Cancelled') then raise exception 'invalid status' using errcode='22023'; end if;
  update public.inquiries set status=p_status,platform_version=platform_version+1,updated_at=now()
    where id=p_request and platform_business_id=p_business and platform_environment=p_environment and platform_version=p_version returning platform_version into next_version;
  if not found then raise exception 'version conflict or missing request' using errcode='23505'; end if;
  insert into public.platform_activity(business_id,environment,actor_type,actor_id,event_type,resource_id,metadata)
    values(p_business,p_environment,'user',auth.uid()::text,'change_request.updated',p_request,jsonb_build_object('status',p_status));
  return jsonb_build_object('id',p_request,'status',p_status,'version',next_version);
end;
$$;
revoke all on function public.platform_create_request(uuid,text,uuid,text,text,text,text,text),public.platform_update_request(uuid,text,uuid,text,integer) from public,anon,service_role;
grant execute on function public.platform_create_request(uuid,text,uuid,text,text,text,text,text),public.platform_update_request(uuid,text,uuid,text,integer) to authenticated;
commit;
