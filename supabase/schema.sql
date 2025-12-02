-- Property Insights core schema
-- Notes: includes provenance fields (enrichment_*), score_version, and additive cashflow metrics.
create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  jobber_client_id text unique,
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  jobber_property_id text unique,
  address_line1 text not null,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country text,
  beds int,
  baths int,
  sqft int,
  lot_size_sqft int,
  year_built int,
  images text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  jobber_request_id text unique,
  client_id uuid references public.clients(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  title text,
  description text,
  status text,
  requested_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.property_insights (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  score numeric,
  breakdown jsonb,
  summary text,
  risk_flags jsonb,
  recommendations text[],
  valuation jsonb,
  rent_estimate jsonb,
  source text,
  last_updated timestamptz default now(),
  created_at timestamptz default now(),
  score_version text,
  enrichment_sources jsonb,
  enrichment_errors jsonb,
  enrichment_meta jsonb,
  price_to_rent numeric,
  cashflow_risk numeric
);

create table if not exists public.jobber_tokens (
  id uuid primary key default gen_random_uuid(),
  jobber_account_id text,
  access_token text not null,
  refresh_token text,
  expires_at numeric,
  created_at timestamptz default now()
);

create table if not exists public.ingestion_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null,
  platform text,
  detail jsonb,
  created_at timestamptz default now()
);

-- Safe additive updates
alter table if exists public.properties
  add column if not exists updated_at timestamptz default now();
alter table if exists public.properties
  add column if not exists lot_shape text,
  add column if not exists renovated_at timestamptz;

alter table if exists public.service_requests
  add column if not exists updated_at timestamptz default now();

alter table if exists public.property_insights
  add column if not exists updated_at timestamptz default now();

alter table if exists public.property_insights
  add column if not exists cashflow_risk numeric,
  add column if not exists price_to_rent numeric;
-- NOTE: updated_at columns are defaulted on insert; add triggers separately if automatic update tracking is required.

-- Recommended indexes (safe, idempotent)
create index if not exists idx_ingestion_events_created_at on public.ingestion_events (created_at);
create index if not exists idx_property_insights_property_id on public.property_insights (property_id);
