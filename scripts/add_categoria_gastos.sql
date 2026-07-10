-- Agrega columna categoria a la tabla gastos para clasificar gastos

alter table public.gastos add column if not exists categoria text default 'Otros' not null;
