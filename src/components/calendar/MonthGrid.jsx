import { useRef, useLayoutEffect, useState } from 'react'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function isSameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function toDateOnly(str) {
  if (!str) return null
  const [y, m, d] = String(str).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function parseReservaDays(reservas) {
  return reservas.map((r) => ({
    ...r,
    _desde: toDateOnly(r.fecha_desde),
    _hasta: toDateOnly(r.fecha_hasta),
  }))
}

export default function MonthGrid({ days, month, year, reservas, selectedDay, onDayClick, compact }) {
  const gridRef = useRef(null)
  const [cellW, setCellW] = useState(0)
  const today = new Date()

  const parsed = parseReservaDays(reservas)

  useLayoutEffect(() => {
    if (!gridRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        const gapTotal = 6 * 2
        setCellW(Math.floor((w - gapTotal) / 7))
      }
    })
    observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  const getDayState = (day) => {
    const dateOnly = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (dateOnly < todayDate) return 'past'
    if (day.getMonth() !== month) return 'other'

    const ocupada = parsed.some(
      (r) => r._desde && r._hasta && day >= r._desde && day <= r._hasta
    )
    return ocupada ? 'occupied' : 'free'
  }

  const getReservasForDay = (day) => {
    return parsed.filter((r) => r._desde && r._hasta && day >= r._desde && day <= r._hasta)
  }

  const getReservaSegments = () => {
    const segments = []
    for (const r of parsed) {
      if (!r._desde || !r._hasta) continue
      const startIdx = days.findIndex((d) => isSameDay(d, r._desde))
      const endIdx = days.findIndex((d) => isSameDay(d, r._hasta))
      if (startIdx === -1 || endIdx === -1) continue

      let segStart = startIdx
      for (let i = startIdx; i <= endIdx; i++) {
        if (i % 7 === 6 || i === endIdx) {
          const row = Math.floor(segStart / 7) + 1
          const startCol = (segStart % 7) + 1
          const endCol = (i % 7) + 2
          segments.push({
            row,
            startCol,
            endCol,
            label: segStart === startIdx ? `${r.clientes?.nombre || ''}` : '',
            reserva: r,
          })
          segStart = i + 1
        }
      }
    }
    return segments
  }

  const barSegments = getReservaSegments()
  const isToday = (d) => isSameDay(d, today)

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-7 gap-0.5"
    >
      {WEEKDAYS.map((w) => (
        <div
          key={w}
          className={`text-center text-[10px] text-text-muted font-medium uppercase tracking-wider py-1.5 ${compact ? 'text-[8px] py-1' : ''}`}
        >
          {w}
        </div>
      ))}

      {days.map((day, i) => {
        const state = getDayState(day)
        const isSel = selectedDay && isSameDay(day, selectedDay)
        const isCurMonth = day.getMonth() === month
        const isT = isToday(day)

        let bg = ''
        if (state === 'occupied') bg = 'bg-red-100'
        else if (state === 'free') bg = 'bg-green-100'
        else if (state === 'past') bg = 'bg-gray-50'
        else if (state === 'other') bg = 'bg-transparent'

        const row = Math.floor(i / 7) + 2
        const col = (i % 7) + 1

        return (
          <button
            key={i}
            onClick={() => onDayClick?.(day, state)}
            disabled={state === 'past'}
            style={{ gridRow: row, gridColumn: col }}
            className={`relative z-[1] flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-150 ${
              compact ? 'text-xs min-h-[28px]' : 'aspect-square min-h-[36px]'
            } ${isCurMonth ? 'text-text-main' : 'text-text-muted/40'} ${bg} ${
              isSel ? 'ring-2 ring-primary ring-inset' : ''
            } ${isT && !isSel ? 'font-bold ring-1 ring-primary/40 ring-inset' : ''} ${
              state !== 'past' && state !== 'other' ? 'cursor-pointer hover:brightness-95 active:scale-[0.97]' : 'cursor-default'
            }`}
          >
            <span className={`leading-none ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {day.getDate()}
            </span>
            {state === 'free' && (
              <span className={`text-green-500 ${compact ? 'text-[6px]' : 'text-[8px]'}`}>●</span>
            )}
          </button>
        )
      })}

      {barSegments.map((seg, i) => (
        <div
          key={i}
          style={{
            gridRow: seg.row + 1,
            gridColumn: `${seg.startCol} / ${seg.endCol}`,
          }}
          className="z-[2] flex items-center justify-start pointer-events-auto cursor-pointer rounded-md bg-red-200/70 hover:bg-red-300/70 transition-colors truncate px-1.5 select-none"
          onClick={(e) => {
            e.stopPropagation()
            onDayClick?.(toDateOnly(seg.reserva.fecha_desde), 'occupied')
          }}
        >
          <span className={`text-[10px] text-red-800 font-medium leading-none truncate ${compact ? 'text-[7px]' : ''}`}>
            {seg.label || '\u00A0'}
          </span>
        </div>
      ))}
    </div>
  )
}
