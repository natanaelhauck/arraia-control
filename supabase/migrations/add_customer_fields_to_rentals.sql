alter table public.rentals
add column if not exists customer_cpf text,
add column if not exists customer_street text,
add column if not exists customer_number text,
add column if not exists customer_address_complement text,
add column if not exists customer_neighborhood text,
add column if not exists customer_city text;
