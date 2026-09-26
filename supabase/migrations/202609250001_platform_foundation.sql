-- Apply only to a dedicated platform project. Production migration requires review.
begin;
create table public.platform_settings (
  singleton boolean primary key default true check (singleton),
  environment text not null check (environment in ('local','staging','production'))
);
insert into public.platform_settings values (true, 'staging');
create table public.platform_businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.platform_memberships (
  business_id uuid not null references public.platform_businesses(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('elevate_owner','elevate_admin','business_owner','business_admin','business_member')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index platform_memberships_user on public.platform_memberships(user_id);
create table public.platform_credentials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.platform_businesses(id),
  environment text not null check (environment in ('local','staging','production')),
  name text not null,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  scopes text[] not null check (cardinality(scopes) > 0),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.platform_customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.platform_businesses(id),
  environment text not null check (environment in ('local','staging','production')),
  external_id text not null,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  unique (business_id, environment, external_id),
  unique (business_id, environment, id)
);
create table public.platform_submissions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.platform_businesses(id),
  environment text not null check (environment in ('local','staging','production')),
  customer_id uuid not null,
  external_id text not null,
  schema_name text not null,
  kind text not null,
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (business_id, environment, external_id),
  unique (business_id, environment, id),
  foreign key (business_id, environment, customer_id) references public.platform_customers(business_id, environment, id)
);
create table public.platform_leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.platform_businesses(id),
  environment text not null check (environment in ('local','staging','production')),
  customer_id uuid not null,
  submission_id uuid not null,
  status text not null default 'new' check (status in ('new','contacted','closed','lost')),
  created_at timestamptz not null default now(),
  unique (business_id, environment, submission_id),
  foreign key (business_id, environment, customer_id) references public.platform_customers(business_id, environment, id),
  foreign key (business_id, environment, submission_id) references public.platform_submissions(business_id, environment, id)
);
create table public.platform_activity (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.platform_businesses(id),
  environment text not null check (environment in ('local','staging','production')),
  actor_type text not null check (actor_type in ('user','credential','system')),
  actor_id text not null,
  event_type text not null,
  resource_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.platform_billing_accounts (
  business_id uuid not null references public.platform_businesses(id),
  environment text not null check (environment in ('local','staging','production')),
  provider text not null,
  provider_customer_id text not null,
  created_at timestamptz not null default now(),
  primary key (business_id, environment, provider)
);
create table public.platform_rate_windows (
  actor text not null,
  window_start timestamptz not null,
  hits integer not null,
  primary key (actor, window_start)
);

create function public.platform_can_access(p_business uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.platform_memberships m join public.platform_businesses b on b.id=m.business_id
    where m.user_id=auth.uid() and m.business_id=p_business and m.active and b.active);
$$;
create function public.platform_environment() returns text
language sql stable security definer set search_path = '' as $$
  select environment from public.platform_settings where singleton;
$$;
revoke all on function public.platform_can_access(uuid), public.platform_environment() from public, anon;
grant execute on function public.platform_can_access(uuid), public.platform_environment() to authenticated, service_role;

alter table public.platform_settings enable row level security;
alter table public.platform_businesses enable row level security;
alter table public.platform_memberships enable row level security;
alter table public.platform_credentials enable row level security;
alter table public.platform_customers enable row level security;
alter table public.platform_submissions enable row level security;
alter table public.platform_leads enable row level security;
alter table public.platform_activity enable row level security;
alter table public.platform_billing_accounts enable row level security;
alter table public.platform_rate_windows enable row level security;

revoke all on public.platform_settings, public.platform_businesses, public.platform_memberships, public.platform_credentials,
  public.platform_customers, public.platform_submissions, public.platform_leads, public.platform_activity,
  public.platform_billing_accounts, public.platform_rate_windows from anon, authenticated;
grant select on public.platform_businesses, public.platform_memberships, public.platform_customers,
  public.platform_submissions, public.platform_leads, public.platform_activity to authenticated;
create policy business_read on public.platform_businesses for select to authenticated using (public.platform_can_access(id));
create policy own_membership_read on public.platform_memberships for select to authenticated using (user_id=auth.uid() and public.platform_can_access(business_id));
create policy customer_read on public.platform_customers for select to authenticated using (public.platform_can_access(business_id) and environment=public.platform_environment());
create policy submission_read on public.platform_submissions for select to authenticated using (public.platform_can_access(business_id) and environment=public.platform_environment());
create policy lead_read on public.platform_leads for select to authenticated using (public.platform_can_access(business_id) and environment=public.platform_environment());
create policy activity_read on public.platform_activity for select to authenticated using (public.platform_can_access(business_id) and environment=public.platform_environment());

create index platform_customer_recent on public.platform_customers(business_id,environment,created_at desc,id);
create index platform_submission_recent on public.platform_submissions(business_id,environment,created_at desc,id);
create index platform_lead_recent on public.platform_leads(business_id,environment,created_at desc,id);
create index platform_activity_recent on public.platform_activity(business_id,environment,created_at desc,id);

create function public.platform_rate_limit(p_actor text, p_limit integer default 60) returns boolean
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if p_limit < 1 or p_limit > 1000 then raise exception 'invalid limit'; end if;
  insert into public.platform_rate_windows(actor,window_start,hits) values (p_actor,date_trunc('minute',now()),1)
  on conflict (actor,window_start) do update set hits=public.platform_rate_windows.hits+1 returning hits into n;
  delete from public.platform_rate_windows where window_start < now()-interval '1 day';
  return n<=p_limit;
end;
$$;

-- One transaction owns the receipt, customer association, lead and activity.
create function public.platform_accept_submission(p_credential uuid, p_business uuid, p_environment text, p_payload jsonb, p_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare prior public.platform_submissions; customer_uuid uuid; submission_uuid uuid; lead_uuid uuid; new_customer boolean := false;
begin
  if p_environment is distinct from public.platform_environment() then raise exception 'environment mismatch' using errcode='42501'; end if;
  if not exists(select 1 from public.platform_credentials c join public.platform_businesses b on b.id=c.business_id
    where c.id=p_credential and c.business_id=p_business and c.environment=p_environment and c.revoked_at is null
      and c.expires_at>now() and b.active and 'create:submission'=any(c.scopes)) then
    raise exception 'access denied' using errcode='42501';
  end if;
  if p_payload->>'schema' is distinct from 'consultation.v1' or p_payload->>'kind' not in ('virtual','in-person')
    or coalesce(length(p_payload->>'externalId'),0) not between 1 and 128
    or coalesce(length(p_payload->>'externalCustomerId'),0) not between 1 and 128
    or coalesce(length(p_payload#>>'{customer,name}'),0) not between 1 and 160
    or coalesce(length(p_payload#>>'{customer,email}'),0) not between 3 and 254
    or p_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid payload' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_business::text||p_environment||(p_payload->>'externalId'),0));
  select * into prior from public.platform_submissions where business_id=p_business and environment=p_environment and external_id=p_payload->>'externalId';
  if found then
    if prior.payload_hash<>p_hash then raise exception 'idempotency conflict' using errcode='23505'; end if;
    return jsonb_build_object('id',prior.id,'customerId',prior.customer_id,'createdAt',prior.created_at,'duplicate',true);
  end if;
  insert into public.platform_customers(business_id,environment,external_id,name,email,phone)
    values(p_business,p_environment,p_payload->>'externalCustomerId',p_payload#>>'{customer,name}',p_payload#>>'{customer,email}',p_payload#>>'{customer,phone}')
    on conflict(business_id,environment,external_id) do nothing returning id into customer_uuid;
  new_customer := customer_uuid is not null;
  if customer_uuid is null then
    select id into customer_uuid from public.platform_customers where business_id=p_business and environment=p_environment and external_id=p_payload->>'externalCustomerId';
  end if;
  insert into public.platform_submissions(business_id,environment,customer_id,external_id,schema_name,kind,payload_hash,submitted_at)
    values(p_business,p_environment,customer_uuid,p_payload->>'externalId',p_payload->>'schema',p_payload->>'kind',p_hash,(p_payload->>'createdAt')::timestamptz)
    returning id into submission_uuid;
  insert into public.platform_leads(business_id,environment,customer_id,submission_id) values(p_business,p_environment,customer_uuid,submission_uuid) returning id into lead_uuid;
  insert into public.platform_activity(business_id,environment,actor_type,actor_id,event_type,resource_id)
    values(p_business,p_environment,'credential',p_credential::text,'submission.created',submission_uuid),
      (p_business,p_environment,'credential',p_credential::text,'lead.created',lead_uuid);
  if new_customer then
    insert into public.platform_activity(business_id,environment,actor_type,actor_id,event_type,resource_id)
      values(p_business,p_environment,'credential',p_credential::text,'customer.created',customer_uuid);
  end if;
  return jsonb_build_object('id',submission_uuid,'customerId',customer_uuid,'createdAt',now(),'duplicate',false);
end;
$$;
revoke all on function public.platform_rate_limit(text,integer), public.platform_accept_submission(uuid,uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.platform_rate_limit(text,integer), public.platform_accept_submission(uuid,uuid,text,jsonb,text) to service_role;
grant all on public.platform_settings,public.platform_businesses,public.platform_memberships,public.platform_credentials,
  public.platform_customers,public.platform_submissions,public.platform_leads,public.platform_activity,
  public.platform_billing_accounts,public.platform_rate_windows to service_role;

-- Creates a business, not a login or a membership. Never invent Hanna's identity.
insert into public.platform_businesses(id,slug,name) values('81c437f5-f64e-47c0-a71a-cc84da8914db','feather-by-hanna','Feather by Hanna');
commit;
