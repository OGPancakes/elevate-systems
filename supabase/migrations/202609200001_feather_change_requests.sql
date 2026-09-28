create table if not exists integration_clients (
  slug text primary key,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into integration_clients (slug, display_name, is_active)
values ('feather-by-hanna', 'Feather by Hanna', true)
on conflict (slug) do update set display_name = excluded.display_name;

alter table inquiries
  alter column email drop not null,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists ticket_id text,
  add column if not exists external_client_id text references integration_clients(slug),
  add column if not exists external_site_id text,
  add column if not exists external_request_id text,
  add column if not exists request_title text,
  add column if not exists category text,
  add column if not exists priority text,
  add column if not exists affected_area text,
  add column if not exists requester_identity jsonb,
  add column if not exists external_created_at timestamptz,
  add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table inquiries drop constraint if exists inquiries_status_check;
alter table inquiries add constraint inquiries_status_check check (
  status in (
    'New', 'Contacted', 'Closed', 'Spam', 'Submitted', 'In Progress',
    'Needs Information', 'Completed', 'Cancelled'
  )
);

create unique index if not exists inquiries_ticket_id_idx
  on inquiries (ticket_id) where ticket_id is not null;
create unique index if not exists inquiries_external_request_idx
  on inquiries (external_client_id, external_request_id)
  where external_client_id is not null and external_request_id is not null;

create or replace function set_inquiry_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inquiries_updated_at_trigger on inquiries;
create trigger inquiries_updated_at_trigger
before update on inquiries
for each row execute function set_inquiry_updated_at();

create table if not exists integration_request_events (
  id bigint generated always as identity primary key,
  client_id text not null references integration_clients(slug),
  created_at timestamptz not null default now()
);

create index if not exists integration_request_events_client_time_idx
  on integration_request_events (client_id, created_at desc);

create or replace function check_integration_rate_limit(
  p_client_id text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_client_id));
  delete from integration_request_events where created_at < now() - interval '1 day';
  select count(*) into recent_count
  from integration_request_events
  where client_id = p_client_id
    and created_at >= now() - make_interval(secs => p_window_seconds);
  if recent_count >= p_limit then
    return false;
  end if;
  insert into integration_request_events (client_id) values (p_client_id);
  return true;
end;
$$;

revoke all on function check_integration_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function check_integration_rate_limit(text, integer, integer) to service_role;

insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', false)
on conflict (id) do update set public = false;

alter table integration_clients enable row level security;
alter table integration_request_events enable row level security;
