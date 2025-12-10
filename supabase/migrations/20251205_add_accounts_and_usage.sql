create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  jobber_account_id text unique,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table if not exists usage_metrics (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  metric text not null,
  value numeric not null default 0,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_usage_metrics_account_metric
on usage_metrics(account_id, metric);
