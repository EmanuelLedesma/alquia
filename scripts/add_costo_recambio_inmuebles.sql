ALTER TABLE inmuebles
  ADD COLUMN IF NOT EXISTS costo_recambio numeric DEFAULT 0;

COMMENT ON COLUMN inmuebles.costo_recambio IS
  'Costo fijo del recambio para este inmueble. Se autocompleta en reservas.';
