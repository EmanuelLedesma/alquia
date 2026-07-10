import { useState, useEffect } from 'react'
import { CalendarDays, Users, ArrowRight, X } from 'lucide-react'

function fmt(iso) {
  if (!iso) return ''
  var p = iso.split('-')
  return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-AR')
}

export default function DayDetailSheet({ selectedDay, onClose, onNewReserva, reservasForDay, onViewReserva }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (selectedDay) {
      requestAnimationFrame(() => setShow(true))
    } else {
      setShow(false)
    }
  }, [selectedDay])

  if (!selectedDay) return null

  const isOccupied = reservasForDay.length > 0
  const dayStr = selectedDay.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 ease-out ${show ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        <div className="px-5 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-text-main font-semibold capitalize">{dayStr}</p>
            <button onClick={handleClose} className="text-text-muted p-1 -m-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isOccupied ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3">
                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm font-medium">Día libre — disponible para reservar</span>
              </div>
              <button
                onClick={() => onNewReserva?.(selectedDay)}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-medium"
              >
                <CalendarDays className="w-4 h-4" />
                Nueva Reserva
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500 bg-red-50 rounded-xl px-4 py-3">
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                <span className="text-sm font-medium">
                  {reservasForDay.length === 1 ? '1 reserva' : `${reservasForDay.length} reservas`}
                </span>
              </div>

              {reservasForDay.map((r) => (
                <div
                  key={r.id}
                  className="bg-surface rounded-xl border border-slate-200 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-text-main font-medium flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-text-muted" />
                        {r.clientes?.nombre} {r.clientes?.apellido}
                      </p>
                      <p className="text-text-muted text-xs">
                        {fmt(r.fecha_desde)} →{' '}
                        {fmt(r.fecha_hasta)}
                      </p>
                      {r.inmuebles?.nombre && (
                        <p className="text-text-muted text-xs">{r.inmuebles.nombre}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onViewReserva?.(r.id)}
                      className="inline-flex items-center gap-1 text-primary text-xs font-medium shrink-0 h-8 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      Ver
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const next = new Date(selectedDay)
                  next.setDate(next.getDate() + 1)
                  onNewReserva?.(next)
                }}
                className="w-full h-11 rounded-xl border border-dashed border-primary text-primary text-sm font-medium"
              >
                + Nueva reserva desde el día siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
