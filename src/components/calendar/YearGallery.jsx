import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import MiniMonthGrid from './MiniMonthGrid'
import SeasonFilter from './SeasonFilter'
import DayDetailSheet from './DayDetailSheet'

function toDateOnly(str) {
  if (!str) return null
  var parts = String(str).split('-')
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function reservasOverlapMonth(reservas, month, year) {
  var mStart = new Date(year, month, 1)
  var mEnd = new Date(year, month + 1, 0)
  return reservas.filter(function (r) {
    var desde = toDateOnly(r.fecha_desde)
    var hasta = toDateOnly(r.fecha_hasta)
    return desde && hasta && desde <= mEnd && hasta >= mStart
  })
}

export default function YearGallery({ inmuebleId, compact }) {
  var navigate = useNavigate()
  var today = new Date()
  var [year, setYear] = useState(today.getFullYear())
  var [showFilter, setShowFilter] = useState(false)
  var [selectedMonths, setSelectedMonths] = useState([11, 0, 1, 2, 3])
  var [inmuebles, setInmuebles] = useState([])
  var [reservas, setReservas] = useState([])
  var [loading, setLoading] = useState(true)
  var [selectedDay, setSelectedDay] = useState(null)
  var [reservasForDay, setReservasForDay] = useState([])

  useEffect(function () {
    var query = supabase.from('inmuebles').select('id, nombre')
    if (inmuebleId) {
      query = query.eq('id', inmuebleId)
    }
    query.then(function (res) {
      if (res.data) setInmuebles(res.data)
    })
  }, [inmuebleId])

  useEffect(function () {
    setLoading(true)
    var q = supabase
      .from('alquileres')
      .select('id, fecha_desde, fecha_hasta, inmueble_id, clientes(nombre, apellido), inmuebles(nombre)')
      .gte('fecha_desde', year + '-01-01')
      .lte('fecha_hasta', year + '-12-31')
    if (inmuebleId) {
      q = q.eq('inmueble_id', inmuebleId)
    }
    q.then(function (res) {
      if (res.data) setReservas(res.data)
      setLoading(false)
    })
  }, [year, inmuebleId])

  function handleYearChange(dir) {
    setYear(year + dir)
    setSelectedDay(null)
  }

  function handleDayClick(day, state) {
    setSelectedDay(day)
    var parsed = reservas.map(function (r) {
      return { ...r, _desde: toDateOnly(r.fecha_desde), _hasta: toDateOnly(r.fecha_hasta) }
    })
    setReservasForDay(
      parsed.filter(function (r) {
        return r._desde && r._hasta && day >= r._desde && day <= r._hasta
      })
    )
  }

  function handleNewReserva(day) {
    navigate('/reservas', {
      state: {
        fechaDesde: day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0'),
        inmuebleId: inmuebleId || undefined,
      },
    })
  }

  function formatDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }

  var effectiveInmuebles = inmuebleId
    ? inmuebles
    : inmuebles

  var hasActiveDays = reservas.length === 0 && loading === false

  return (
    <div className={'space-y-3' + (compact ? '' : '')}>
      {!compact && (
        <div className="flex items-center justify-between">
          <h1 className="text-text-main text-xl font-bold">Calendario</h1>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={function () { handleYearChange(-1) }}
            className="text-text-muted hover:text-text-main p-1 -m-1 transition-colors"
          >
            <ChevronLeft className={'transition-colors ' + (compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </button>
          <span className={'text-text-main font-semibold ' + (compact ? 'text-sm' : 'text-base')}>
            {year}
          </span>
          <button
            onClick={function () { handleYearChange(1) }}
            className="text-text-muted hover:text-text-main p-1 -m-1 transition-colors"
          >
            <ChevronRight className={'transition-colors ' + (compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </button>
        </div>
        <button
          onClick={function () { setShowFilter(!showFilter) }}
          className={'inline-flex items-center gap-1 rounded-xl transition-colors ' +
            (compact ? 'h-7 px-2 text-[10px]' : 'h-9 px-3 text-xs') + ' ' +
            (showFilter
              ? 'bg-primary text-white'
              : 'bg-secondary text-text-main border border-slate-200 hover:bg-primary/10')}
        >
          <Filter className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Temporada
        </button>
      </div>

      {showFilter && (
        <SeasonFilter
          selected={selectedMonths}
          onChange={setSelectedMonths}
          onClose={function () { setShowFilter(false) }}
          compact={compact}
        />
      )}

      {loading && (
        <p className="text-text-muted text-sm text-center py-4">Cargando reservas...</p>
      )}

      {!loading && effectiveInmuebles.length === 0 && (
        <p className="text-text-muted text-sm text-center py-4">No hay inmuebles.</p>
      )}

      {!loading && effectiveInmuebles.map(function (inm) {
        var inmReservas = reservas.filter(function (r) {
          return Number(r.inmueble_id) === Number(inm.id)
        })
        var visibleMonths = selectedMonths.filter(function (m) {
          return inmReservas.length > 0 || true
        })

        return (
          <div key={inm.id} className="space-y-2">
            <h2 className={'text-text-main font-semibold ' + (compact ? 'text-sm' : 'text-base')}>
              {inm.nombre}
            </h2>
            <div className={'grid gap-2 ' + (compact ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4')}>
              {selectedMonths.map(function (m) {
                var monthReservas = reservasOverlapMonth(inmReservas, m, year)
                return (
                  <MiniMonthGrid
                    key={m}
                    month={m}
                    year={year}
                    reservas={monthReservas}
                    onDayClick={handleDayClick}
                    selectedDay={selectedDay}
                    compact={compact}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      <DayDetailSheet
        selectedDay={selectedDay}
        onClose={function () { setSelectedDay(null) }}
        onNewReserva={handleNewReserva}
        reservasForDay={reservasForDay}
        onViewReserva={function (id) { navigate('/reservas/' + id) }}
      />
    </div>
  )
}
