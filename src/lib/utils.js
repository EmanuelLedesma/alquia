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
