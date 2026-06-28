import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function diasEntre(desde, hasta) {
  if (!desde || !hasta) return 0
  const [ay, am, ad] = desde.split('-').map(Number)
  const [by, bm, bd] = hasta.split('-').map(Number)
  const d1 = new Date(ay, am - 1, ad)
  const d2 = new Date(by, bm - 1, bd)
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function isoToDisplay(iso) {
  if (!iso || !iso.match(/^\d{4}-\d{2}-\d{2}$/)) return ''
  var parts = iso.split('-')
  return parts[2] + '/' + parts[1] + '/' + parts[0].slice(2)
}

export function displayToIso(ddmm) {
  if (!ddmm || ddmm.length < 8) return ''
  var parts = ddmm.split('/')
  if (parts.length !== 3) return ''
  return '20' + parts[2] + '-' + parts[1] + '-' + parts[0]
}

export function formatDateInput(raw) {
  var digits = raw.replace(/\D/g, '').slice(0, 6)
  var out = ''
  for (var i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) out += '/'
    out += digits[i]
  }
  return out
}
