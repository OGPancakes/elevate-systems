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
