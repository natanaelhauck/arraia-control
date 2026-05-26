create index if not exists rentals_dress_id_idx on public.rentals(dress_id);
create index if not exists rentals_status_idx on public.rentals(status);
create index if not exists rentals_party_date_idx on public.rentals(party_date);
create index if not exists rentals_expected_return_date_idx on public.rentals(expected_return_date);
