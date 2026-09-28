create table if not exists website_audit_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text not null,
  email text not null,
  website_url text not null,
  logo_url text,
  logo_storage_path text,
  audit_result jsonb not null,
  website_snapshot text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists booking_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business_name text not null,
  website_url text,
  message text not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists website_audit_leads_submitted_at_idx
  on website_audit_leads (submitted_at desc);

create index if not exists booking_leads_submitted_at_idx
  on booking_leads (submitted_at desc);

-- Optional storage bucket for uploaded logos.
insert into storage.buckets (id, name, public)
values ('lead-assets', 'lead-assets', false)
on conflict (id) do nothing;

-- Public generated concepts are displayed in the audit comparison slider.
insert into storage.buckets (id, name, public)
values ('audit-previews', 'audit-previews', true)
on conflict (id) do update set public = true;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text not null,
  email text not null,
  phone text,
  website_url text not null,
  logo_url text,
  logo_storage_path text,
  audit_result jsonb not null default '{}'::jsonb,
  redesign_preview jsonb,
  website_snapshot text,
  source text not null default 'Audit Tool',
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Booked', 'Closed', 'Lost')),
  notes text not null default '',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business_name text,
  message text not null,
  service_interest text,
  source text not null default 'Contact Form',
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Closed', 'Spam')),
  notes text not null default '',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

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

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  business_name text not null,
  website_url text,
  selected_datetime timestamptz,
  reason text not null,
  service_interest text,
  source text not null default 'Book a Call',
  status text not null default 'Upcoming'
    check (status in ('Upcoming', 'Completed', 'Cancelled', 'No-show')),
  notes text not null default '',
  booked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table bookings
  add column if not exists duration_minutes integer not null default 30,
  add column if not exists timezone text not null default 'America/New_York';

create table if not exists bot_conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  session_id text not null unique,
  messages jsonb not null default '[]'::jsonb,
  captured_name text,
  captured_email text,
  captured_phone text,
  captured_business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  business_name text,
  tier_id text not null,
  tier_name text not null,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  source text not null default 'AI Solutions',
  status text not null default 'Pending'
    check (status in ('Pending', 'Paid', 'Failed', 'Refunded')),
  notes text not null default '',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  role text not null default 'User'
    check (role in ('Admin', 'User', 'Independent Contractor')),
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists notification_recipients (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_email_idx on leads (lower(email));
create index if not exists inquiries_created_at_idx on inquiries (created_at desc);
create index if not exists inquiries_status_idx on inquiries (status);
create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_status_idx on bookings (status);
create unique index if not exists bookings_unique_upcoming_slot_idx
  on bookings (selected_datetime)
  where status = 'Upcoming' and selected_datetime is not null;
create index if not exists bot_conversations_lead_id_idx on bot_conversations (lead_id);
create index if not exists purchases_created_at_idx on purchases (created_at desc);
create index if not exists purchases_status_idx on purchases (status);
create index if not exists purchases_customer_email_idx on purchases (lower(customer_email));
create index if not exists admin_users_username_idx on admin_users (lower(username));
create unique index if not exists notification_recipients_email_idx
  on notification_recipients (lower(email));

alter table leads enable row level security;
alter table inquiries enable row level security;
alter table bookings enable row level security;
alter table bot_conversations enable row level security;
alter table purchases enable row level security;
alter table admin_users enable row level security;
alter table notification_recipients enable row level security;
alter table integration_clients enable row level security;
alter table integration_request_events enable row level security;

-- Optional durable storage for Elevate Orders phone activity. The live demo
-- works without this table; production can persist the same events here.
create table if not exists elevate_order_call_events (
  id uuid primary key default gen_random_uuid(),
  call_sid text not null,
  caller text,
  status text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists elevate_order_call_events_created_at_idx
  on elevate_order_call_events (created_at desc);

create index if not exists elevate_order_call_events_call_sid_idx
  on elevate_order_call_events (call_sid);

alter table elevate_order_call_events enable row level security;

insert into leads (
  id, name, business_name, email, website_url, logo_url, logo_storage_path,
  audit_result, website_snapshot, source, status, submitted_at, created_at
)
select
  id, name, business_name, email, website_url, logo_url, logo_storage_path,
  audit_result, website_snapshot, 'Audit Tool', 'New', submitted_at, created_at
from website_audit_leads
on conflict (id) do nothing;

insert into bookings (
  id, name, email, phone, business_name, website_url, reason, source,
  status, booked_at, created_at
)
select
  id, name, email, phone, business_name, website_url, message, 'Book a Call',
  'Upcoming', submitted_at, created_at
from booking_leads
on conflict (id) do nothing;
