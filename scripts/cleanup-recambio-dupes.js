// run: node scripts/cleanup-recambio-dupes.js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

var envPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
var env = readFileSync(envPath, 'utf-8')
var url = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim()
var key = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()

if (!url || !key) { console.error('Missing Supabase credentials'); process.exit(1) }

var supabase = createClient(url, key)

var { data: gastos, error } = await supabase.from('gastos').select('*').ilike('concepto', 'Recambio%').order('fecha')

if (error) { console.error(error); process.exit(1) }

var seen = {}
var toDelete = []

gastos.forEach(function (g) {
  var matchId = g.concepto.match(/\(alquiler #(\d+)\)/)
  var key = matchId ? 'alquiler-' + matchId[1] : 'old-' + g.concepto

  if (seen[key]) {
    toDelete.push(g.id)
  } else {
    seen[key] = true
  }
})

if (toDelete.length === 0) {
  console.log('No se encontraron duplicados.')
  process.exit(0)
}

var { error: delError } = await supabase.from('gastos').delete().in('id', toDelete)

if (delError) {
  console.error('Error al eliminar:', delError)
} else {
  console.log('Eliminados ' + toDelete.length + ' gastos duplicados de recambio.')
}
