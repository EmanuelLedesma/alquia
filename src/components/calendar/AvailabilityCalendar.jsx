import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import MonthGrid from './MonthGrid'
import DayDetailSheet from './DayDetailSheet'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = new Date(first)
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7))
  const end = new Date(last)
  end.setDate(last.getDate() + (6 - ((last.getDay() + 6) % 7)))
  const days = []
  const cur = new Date(start)
  while (cur <= end) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export default function AvailabilityCalendar({ inmuebleId, compact }) {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [inmuebles, setInmuebles] = useState([])
  const [filterInmuebleId, setFilterInmuebleId] = useState(inmuebleId ?? '')
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [reservasForDay, setReservasForDay] = useState([])

  useEffect(() => {
    supabase.from('inmuebles').select('id, nombre').then(({ data }) => {
      if (data) setInmuebles(data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const mStart = formatDate(new Date(year, month, 1))
    const mEnd = formatDate(new Date(year, month + 1, 0))

    let query = supabase
      .from('alquileres')
      .select('id, fecha_desde, fecha_hasta, inmueble_id, clientes(nombre, apellido), inmuebles(nombre)')

    const filter = inmuebleId ?? (filterInmuebleId || null)
    if (filter) {
      query = query.eq('inmueble_id', Number(filter))
    }

    query.then(({ data }) => {
      if (data) setReservas(data)
      setLoading(false)
    })
  }, [year, month, inmuebleId, filterInmuebleId])

  const days = getMonthDays(year, month)

  const handleDayClick = (day, state) => {
    if (state === 'past' || state === 'other') return
    if (compact) {
      if (state === 'free') {
        navigate('/reservas', {
          state: { fechaDesde: formatDate(day), inmuebleId },
        })
      } else {
        navigate(`/calendario${inmuebleId ? `?inmueble=${inmuebleId}` : ''}`)
      }
      return
    }
    setSelectedDay(day)
    const parsed = reservas.map((r) => ({
      ...r,
      _desde: (([y, m, d]) => new Date(y, m - 1, d))(String(r.fecha_desde).split('-').map(Number)),
      _hasta: (([y, m, d]) => new Date(y, m - 1, d))(String(r.fecha_hasta).split('-').map(Number)),
    }))
    setReservasForDay(
      parsed.filter((r) => r._desde && r._hasta && day >= r._desde && day <= r._hasta)
    )
  }

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11) }
    else setMonth(month - 1)
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0) }
    else setMonth(month + 1)
    setSelectedDay(null)
  }

  const effectiveId = inmuebleId ?? filterInmuebleId

  return (
    <div className={`space-y-3 ${compact ? '' : ''}`}>
      {!compact && (
        <div className="flex items-center justify-between">
          <h1 className="text-text-main text-xl font-bold">Calendario</h1>
          {!inmuebleId && inmuebles.length > 0 && (
            <select
              value={filterInmuebleId}
              onChange={(e) => { setFilterInmuebleId(e.target.value); setSelectedDay(null) }}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none max-w-[180px]"
            >
              <option value="">Todos los inmuebles</option>
              {inmuebles.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-text-main font-semibold text-sm">Disponibilidad</h3>
          <button
            onClick={() => navigate(`/calendario${inmuebleId ? `?inmueble=${inmuebleId}` : ''}`)}
            className="text-primary text-xs font-medium"
          >
            Ver calendario completo →
          </button>
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
          <button
            onClick={prevMonth}
            className="text-text-muted hover:text-text-main p-1 -m-1 transition-colors"
          >
            <ChevronLeft className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </button>
          <span className={`text-text-main font-semibold ${compact ? 'text-sm' : ''}`}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="text-text-muted hover:text-text-main p-1 -m-1 transition-colors"
          >
            <ChevronRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </button>
        </div>

        <div className="p-2">
          <MonthGrid
            days={days}
            month={month}
            year={year}
            reservas={reservas}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
            compact={compact}
          />
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-100 inline-block ring-1 ring-green-200" />
            Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-100 inline-block ring-1 ring-red-200" />
            Ocupado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-gray-50 inline-block ring-1 ring-gray-200" />
            Pasado
          </span>
        </div>
      )}

      {loading && (
        <p className="text-text-muted text-sm text-center">Cargando reservas…</p>
      )}

      {!compact && (
        <DayDetailSheet
          selectedDay={selectedDay}
          onClose={() => setSelectedDay(null)}
          onNewReserva={(day) => navigate('/reservas', {
            state: {
              fechaDesde: formatDate(day),
              inmuebleId: effectiveId || undefined,
            },
          })}
          reservasForDay={reservasForDay}
          onViewReserva={(id) => navigate(`/reservas/${id}`)}
        />
      )}
    </div>
  )
}
