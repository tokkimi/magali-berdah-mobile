-- Modèle de référence PostgreSQL. À adapter au fournisseur retenu et à auditer avant production.
create extension if not exists pgcrypto;

create type auction_status as enum ('draft','scheduled','live','closed','cancelled');
create type bid_status as enum ('accepted','outbid','winning','won','rejected','cancelled');
create type order_status as enum ('pending_payment','paid','preparing','shipped','delivered','cancelled','refunded');

create table profiles (
  id uuid primary key,
  email text not null unique,
  phone text,
  display_name text,
  birthdate date,
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  created_at timestamptz not null default now(),
  deletion_requested_at timestamptz,
  deleted_at timestamptz
);

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  description text not null,
  condition text not null,
  currency char(3) not null default 'EUR',
  fixed_price_cents integer check (fixed_price_cents >= 0),
  authentication_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table auctions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  status auction_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  starting_price_cents integer not null check (starting_price_cents >= 0),
  current_price_cents integer not null check (current_price_cents >= 0),
  bid_increment_cents integer not null check (bid_increment_cents > 0),
  version bigint not null default 0,
  winner_id uuid references profiles(id),
  check (ends_at > starts_at)
);

create table bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references auctions(id),
  bidder_id uuid not null references profiles(id),
  amount_cents integer not null check (amount_cents > 0),
  status bid_status not null,
  idempotency_key text not null unique,
  server_received_at timestamptz not null default now()
);
create index bids_auction_time_idx on bids(auction_id, server_received_at desc);
create index bids_bidder_idx on bids(bidder_id, server_received_at desc);

create table payment_customers (
  profile_id uuid primary key references profiles(id),
  provider text not null,
  provider_customer_id text not null unique,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id),
  product_id uuid not null references products(id),
  auction_id uuid references auctions(id),
  status order_status not null default 'pending_payment',
  subtotal_cents integer not null,
  buyer_fee_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  currency char(3) not null default 'EUR',
  payment_reference text unique,
  created_at timestamptz not null default now()
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  anonymous_id text,
  purpose text not null,
  document_version text not null,
  granted boolean not null,
  recorded_at timestamptz not null default now(),
  check (profile_id is not null or anonymous_id is not null)
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null,
  actor_id uuid references profiles(id),
  event_type text not null,
  resource_type text not null,
  resource_id uuid,
  outcome text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_resource_idx on audit_events(resource_type, resource_id, created_at desc);

-- La fonction de placement d'une mise doit être une transaction serveur verrouillant
-- la ligne auctions, contrôlant status/ends_at/pas/version, écrivant bids puis incrémentant version.
-- Ne jamais autoriser le client mobile à écrire directement dans bids, auctions, orders ou audit_events.
