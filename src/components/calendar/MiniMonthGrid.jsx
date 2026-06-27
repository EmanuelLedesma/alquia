import { useMemo } from 'react'

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function toDateOnly(str) {
  if (!str) return null
  var parts = String(str).split('-')
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function MiniMonthGrid({ month, year, reservas, onDayClick, selectedDay, compact }) {
  var days = useMemo(function () {
    var result = []
    var total = new Date(year, month + 1, 0).getDate()
    for (var d = 1; d <= total; d++) {
      result.push(new Date(year, month, d))
    }
    return result
  }, [month, year])

  var firstDay = new Date(year, month, 1).getDay()
  var startOffset = (firstDay + 6) % 7

  var parsed = useMemo(function () {
    return reservas.map(function (r) {
      return { ...r, _desde: toDateOnly(r.fecha_desde), _hasta: toDateOnly(r.fecha_hasta) }
    })
  }, [reservas])

  function isOccupied(day) {
    return parsed.some(function (r) {
      return r._desde && r._hasta && day >= r._desde && day <= r._hasta
    })
  }

  function handleDayClick(day) {
    var state = isOccupied(day) ? 'occupied' : 'free'
    onDayClick?.(day, state)
  }

  var blanks = Array.from({ length: startOffset })

  return (
    <div className={'bg-surface rounded-xl border border-slate-100 overflow-hidden ' + (compact ? 'shadow-none' : 'shadow-sm')}>
      <div className={'text-center font-semibold text-text-main border-b border-slate-100 ' + (compact ? 'text-[10px] py-1' : 'text-xs py-1.5')}>
        {MONTH_LABELS[month]}
      </div>
      <div className={compact ? 'p-0.5' : 'p-1'}>
        <div className="grid grid-cols-7">
          {WEEKDAYS.map(function (w) {
            return (
              <div key={w} className={'text-center text-text-muted font-medium ' + (compact ? 'text-[6px] py-px' : 'text-[8px] py-0.5')}>
                {w}
              </div>
            )
          })}
          {blanks.map(function (_, i) {
            return <div key={'b' + i} />
          })}
          {days.map(function (day) {
            var occupied = isOccupied(day)
            var isSel = isSameDay(day, selectedDay)
            var num = day.getDate()
            return (
              <button
                key={num}
                onClick={function () { handleDayClick(day) }}
                className={'flex items-center justify-center rounded leading-none transition-colors hover:brightness-95 active:scale-95 ' +
                  (compact ? 'text-[8px] min-h-[14px]' : 'text-[10px] min-h-[18px]') + ' ' +
                  (occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800') + ' ' +
                  (isSel ? 'ring-1 ring-primary ring-inset' : '')}
              >
                {num}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
