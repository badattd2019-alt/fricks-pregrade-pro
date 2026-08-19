create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  seller_id text not null,
  seller_name text default 'Verified Collector',
  title text not null,
  company text default 'PSA PRE-GRADE',
  grade text not null,
  price numeric not null,
  image_url text not null,
  centering_score text,
  corners_score text,
  edges_score text,
  surface_score text,
  status text default 'active' check (status in ('active', 'pending_escrow', 'sold', 'canceled'))
);

create table if not exists escrow_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references marketplace_listings(id),
  buyer_email text not null,
  amount numeric not null,
  stripe_payment_intent text,
  shipping_status text default 'awaiting_shipment' check (shipping_status in ('awaiting_shipment', 'in_transit', 'delivered', 'funds_released', 'disputed'))
);
