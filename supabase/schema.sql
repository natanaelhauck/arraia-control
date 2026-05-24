create extension if not exists "pgcrypto";

create table if not exists public.dresses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  size text,
  color text,
  status text not null default 'disponivel',
  notes text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint dresses_status_check check (status in ('disponivel', 'alugado', 'reservado'))
);

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  dress_id uuid not null references public.dresses(id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  customer_address text,
  party_date date not null,
  pickup_date date,
  expected_return_date date,
  actual_return_date date,
  total_amount numeric(10,2),
  deposit_amount numeric(10,2),
  notes text,
  status text not null default 'ativo',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint rentals_status_check check (status in ('ativo', 'devolvido', 'cancelado'))
);

create index if not exists rentals_dress_id_idx on public.rentals(dress_id);
create index if not exists rentals_status_idx on public.rentals(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_dresses_updated_at on public.dresses;
create trigger set_dresses_updated_at
before update on public.dresses
for each row
execute function public.set_updated_at();

drop trigger if exists set_rentals_updated_at on public.rentals;
create trigger set_rentals_updated_at
before update on public.rentals
for each row
execute function public.set_updated_at();

alter table public.dresses enable row level security;
alter table public.rentals enable row level security;

-- Políticas temporárias para desenvolvimento interno sem login.
-- Antes de produção, substitua por políticas baseadas em auth.uid().
drop policy if exists "dev_select_dresses" on public.dresses;
create policy "dev_select_dresses" on public.dresses for select using (true);

drop policy if exists "dev_insert_dresses" on public.dresses;
create policy "dev_insert_dresses" on public.dresses for insert with check (true);

drop policy if exists "dev_update_dresses" on public.dresses;
create policy "dev_update_dresses" on public.dresses for update using (true) with check (true);

drop policy if exists "dev_delete_dresses" on public.dresses;
create policy "dev_delete_dresses" on public.dresses for delete using (true);

drop policy if exists "dev_select_rentals" on public.rentals;
create policy "dev_select_rentals" on public.rentals for select using (true);

drop policy if exists "dev_insert_rentals" on public.rentals;
create policy "dev_insert_rentals" on public.rentals for insert with check (true);

drop policy if exists "dev_update_rentals" on public.rentals;
create policy "dev_update_rentals" on public.rentals for update using (true) with check (true);

drop policy if exists "dev_delete_rentals" on public.rentals;
create policy "dev_delete_rentals" on public.rentals for delete using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dress-photos',
  'dress-photos',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dev_select_dress_photos" on storage.objects;
create policy "dev_select_dress_photos" on storage.objects
for select using (bucket_id = 'dress-photos');

drop policy if exists "dev_insert_dress_photos" on storage.objects;
create policy "dev_insert_dress_photos" on storage.objects
for insert with check (bucket_id = 'dress-photos');

drop policy if exists "dev_update_dress_photos" on storage.objects;
create policy "dev_update_dress_photos" on storage.objects
for update using (bucket_id = 'dress-photos') with check (bucket_id = 'dress-photos');

drop policy if exists "dev_delete_dress_photos" on storage.objects;
create policy "dev_delete_dress_photos" on storage.objects
for delete using (bucket_id = 'dress-photos');
