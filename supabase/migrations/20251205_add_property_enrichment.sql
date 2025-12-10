create table if not exists property_enrichment (
  id uuid primary key default uuid_generate_v4(),
  jobber_request_id text,
  address text,
  latitude double precision,
  longitude double precision,
  bedrooms integer,
  bathrooms integer,
  square_feet integer,
  rent_estimate numeric,
  source text,
  refreshed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_property_enrichment_request_id
on property_enrichment(jobber_request_id);
