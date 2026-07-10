-- Bucket público para documentos por inmueble (Word, PDF, etc.)
-- Los links públicos se comparten por WhatsApp con posibles inquilinos

insert into storage.buckets (id, name, public) values ('documentos', 'documentos', true)
on conflict (id) do nothing;

do $$
begin
  create policy "public read documentos" on storage.objects
    for select to public using (bucket_id = 'documentos');
exception when duplicate_object then null;
end;
$$;

do $$
begin
  create policy "auth insert documentos" on storage.objects
    for insert to authenticated with check (bucket_id = 'documentos');
exception when duplicate_object then null;
end;
$$;

do $$
begin
  create policy "auth delete documentos" on storage.objects
    for delete to authenticated using (bucket_id = 'documentos');
exception when duplicate_object then null;
end;
$$;
