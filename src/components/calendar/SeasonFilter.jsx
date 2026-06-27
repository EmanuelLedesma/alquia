var MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function SeasonFilter({ selected, onChange, onClose, compact }) {
  function toggle(m) {
    if (selected.includes(m)) {
      if (selected.length > 1) {
        onChange(selected.filter(function (s) { return s !== m }))
      }
    } else {
      var next = selected.concat([m])
      next.sort(function (a, b) { return a - b })
      onChange(next)
    }
  }

  return (
    <div className={'bg-surface rounded-xl border border-slate-200 shadow-sm ' + (compact ? 'p-2' : 'p-3')}>
      <div className="flex items-center justify-between mb-2">
        <span className={'text-text-main font-semibold ' + (compact ? 'text-[10px]' : 'text-sm')}>
          Temporada
        </span>
        <button onClick={onClose} className={'text-text-muted ' + (compact ? 'text-[9px]' : 'text-xs')}>
          Cerrar
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {MONTHS.map(function (name, i) {
          var on = selected.includes(i)
          return (
            <button
              key={i}
              onClick={function () { toggle(i) }}
              className={
                'rounded-full font-medium transition-colors ' +
                (compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs') + ' ' +
                (on ? 'bg-primary text-white' : 'bg-slate-100 text-text-muted hover:bg-slate-200')
              }
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
