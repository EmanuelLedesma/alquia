import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function diasEntre(desde, hasta) {
  if (!desde || !hasta) return 0
  const d1 = new Date(desde)
  const d2 = new Date(hasta)
  const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
