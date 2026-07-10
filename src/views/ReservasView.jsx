import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, CalendarDays, DollarSign, AlertTriangle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { diasEntre, isoToDisplay } from '../lib/utils'

function addDays(dateStr, days) {
  var parts = dateStr.split('-')
  var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  d.setDate(d.getDate() + days)
  var y = d.getFullYear()
  var m = String(d.getMonth() + 1).padStart(2, '0')
  var day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

function fmtDate(d) {
  if (!d) return ''
  var p = d.split('-')
  return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-AR')
}

function DateInput({ value, onChange, label }) {
  var ref = useRef(null)
  var [display, setDisplay] = useState('')

  useEffect(function () {
    if (value) {
      setDisplay(isoToDisplay(value))
    }
  }, [value])

  function handleTextChange(e) {
    var raw = e.target.value.replace(/\D/g, '').slice(0, 6)
    var formatted = ''
    for (var i = 0; i < raw.length; i++) {
      if (i === 2 || i === 4) formatted += '/'
      formatted += raw[i]
    }
    setDisplay(formatted)
    if (raw.length === 6) {
      var d = raw.slice(0, 2)
      var m = raw.slice(2, 4)
      var y = '20' + raw.slice(4, 6)
      onChange(y + '-' + m + '-' + d)
    } else {
      onChange('')
    }
  }

  function handleCalendarClick() {
    if (ref.current) {
      ref.current.showPicker()
    }
  }

  function handleCalendarChange(e) {
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleTextChange}
        placeholder="dd/mm/aa"
        className="w-full h-11 pl-3 pr-10 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
      />
      <button
        type="button"
        onClick={handleCalendarClick}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-primary transition-colors"
      >
        <CalendarDays className="w-5 h-5" />
      </button>
      <input
        ref={ref}
        type="date"
        value={value || ''}
        onChange={handleCalendarChange}
        className="sr-only"
      />
    </div>
  )
}

export default function ReservasView() {
  var navigate = useNavigate()
  var location = useLocation()

  var [inmuebles, setInmuebles] = useState([])
  var [clientes, setClientes] = useState([])
  var [loading, setLoading] = useState(true)

  var [inmuebleId, setInmuebleId] = useState('')
  var [clienteId, setClienteId] = useState('')
  var [fechaDesde, setFechaDesde] = useState(location.state && location.state.fechaDesde || '')
  var [fechaHasta, setFechaHasta] = useState('')
  var [precioPorDia, setPrecioPorDia] = useState('50000')
  var [costoRecambio, setCostoRecambio] = useState('15000')
  var [overlapError, setOverlapError] = useState(null)
  var [submitError, setSubmitError] = useState('')
  var [checking, setChecking] = useState(false)

  var dias = diasEntre(fechaDesde, fechaHasta)
  var pStr = precioPorDia === '' ? '' : String(Number(precioPorDia))
  var cStr = costoRecambio === '' ? '' : String(Number(costoRecambio))
  var pNum = pStr === '' ? 0 : Number(pStr)
  var cNum = cStr === '' ? 0 : Number(cStr)
  var total = dias * pNum - cNum

  useEffect(function () {
    var stateFecha = location.state && location.state.fechaDesde
    var stateInmueble = location.state && location.state.inmuebleId
    if (stateFecha) setFechaDesde(stateFecha)
    if (stateInmueble) setInmuebleId(String(stateInmueble))
    window.history.replaceState({}, '')

    Promise.all([
      supabase.from('inmuebles').select('id, nombre'),
      supabase.from('clientes').select('id, nombre, apellido'),
    ]).then(function (r) {
      var inmueblesRes = r[0]
      var clientesRes = r[1]
      if (inmueblesRes.data) setInmuebles(inmueblesRes.data)
      if (clientesRes.data) setClientes(clientesRes.data)
      setLoading(false)
    })
  }, [])

  function handleQuickDate(days) {
    setOverlapError(null)

    if (!inmuebleId) {
      setOverlapError({ message: 'Primero seleccioná un inmueble.' })
      return
    }
    if (!fechaDesde) {
      setOverlapError({ message: 'Primero seleccioná una fecha de inicio.' })
      return
    }

    var nuevaHasta = addDays(fechaDesde, days)

    if (nuevaHasta <= fechaDesde) {
      setOverlapError({ message: 'La fecha de fin debe ser posterior a la de inicio.' })
      return
    }

    setFechaHasta(nuevaHasta)
    setChecking(true)

    supabase
      .from('alquileres')
      .select('id, fecha_desde, fecha_hasta, clientes(nombre, apellido)')
      .eq('inmueble_id', Number(inmuebleId))
      .lt('fecha_desde', nuevaHasta)
      .gt('fecha_hasta', fechaDesde)
      .then(function (res) {
        setChecking(false)

        if (res.error) {
          setOverlapError({ message: 'Error al verificar disponibilidad.' })
          return
        }

        var conflictos = res.data
        if (conflictos && conflictos.length > 0) {
          var c = conflictos[0]
          var nombreCliente = 'otra reserva'
          if (c.clientes && c.clientes.nombre) {
            nombreCliente = c.clientes.nombre + ' ' + c.clientes.apellido
          }
          setOverlapError({
            message: 'No es posible, ' + nombreCliente + ' ya tiene alquilado del ' + fmtDate(c.fecha_desde) + ' al ' + fmtDate(c.fecha_hasta) + '.',
          })
          setFechaHasta('')
          return
        }
      })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    var faltantes = []
    if (!inmuebleId) faltantes.push('inmueble')
    if (!clienteId) faltantes.push('cliente')
    if (!fechaDesde) faltantes.push('fecha desde')
    if (!fechaHasta) faltantes.push('fecha hasta')
    if (faltantes.length) {
      setSubmitError('Faltan campos requeridos: ' + faltantes.join(', ') + '.')
      return
    }

    supabase.from('alquileres').insert({
      inmueble_id: Number(inmuebleId),
      cliente_id: Number(clienteId),
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      anio_temporada: Number(fechaDesde.split('-')[0]),
      cant_dias: dias,
      precio_por_dia: pNum,
      costo_recambio: cNum,
      monto_total: total,
      total_senas_recibidas: 0,
    }).select().single().then(function (res) {
      if (res.error) {
        setSubmitError(res.error.message)
        return
      }
      if (res.data) {
        navigate('/reservas/' + res.data.id, { replace: true })
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      <button
        type="button"
        onClick={() => navigate('/calendario')}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-main transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Calendario
      </button>
      <h1 className="text-text-main text-xl font-bold">Nueva Reserva</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-text-muted font-medium">Inmueble</label>
          <select
            value={inmuebleId}
            onChange={function (e) { setInmuebleId(e.target.value); setOverlapError(null) }}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
          >
            <option value="">Seleccionar inmueble</option>
            {inmuebles.map(function (i) {
              return <option key={i.id} value={i.id}>{i.nombre}</option>
            })}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-text-muted font-medium">Cliente</label>
          <select
            value={clienteId}
            onChange={function (e) { setClienteId(e.target.value) }}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map(function (c) {
              return <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
            })}
          </select>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-text-muted font-medium">Fecha Desde</label>
              <DateInput value={fechaDesde} onChange={function (v) { setFechaDesde(v); setOverlapError(null) }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-text-muted font-medium">Fecha Hasta</label>
              <DateInput value={fechaHasta} onChange={function (v) { setFechaHasta(v); setOverlapError(null) }} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={function () { handleQuickDate(7) }}
              disabled={checking}
              className={'flex-1 h-11 rounded-xl text-sm font-medium transition-all ' + (
                fechaHasta && dias === 7
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-secondary text-text-main hover:bg-primary/10 border border-slate-200'
              ) + ' disabled:opacity-50'}
            >
              {checking ? 'Verificando…' : 'Semana (7 días)'}
            </button>
            <button
              type="button"
              onClick={function () { handleQuickDate(14) }}
              disabled={checking}
              className={'flex-1 h-11 rounded-xl text-sm font-medium transition-all ' + (
                fechaHasta && dias === 14
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-secondary text-text-main hover:bg-primary/10 border border-slate-200'
              ) + ' disabled:opacity-50'}
            >
              {checking ? 'Verificando…' : 'Quincena (14 días)'}
            </button>
            <button
              type="button"
              onClick={function () { handleQuickDate(21) }}
              disabled={checking}
              className={'flex-1 h-11 rounded-xl text-sm font-medium transition-all ' + (
                fechaHasta && dias === 21
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-secondary text-text-main hover:bg-primary/10 border border-slate-200'
              ) + ' disabled:opacity-50'}
            >
              {checking ? 'Verificando…' : 'Tres semanas (21 días)'}
            </button>
          </div>
        </div>

        {overlapError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle className={'w-5 h-5 text-red-500 shrink-0 mt-0.5'} />
            <p className="text-sm text-red-700">{overlapError.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Precio por Día</label>
            <input
              type="text"
              inputMode="numeric"
              value={precioPorDia}
              onChange={function (e) {
                var val = e.target.value.replace(/\D/g, '')
                setPrecioPorDia(val)
              }}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Costo Recambio</label>
            <input
              type="text"
              inputMode="numeric"
              value={costoRecambio}
              onChange={function (e) {
                var val = e.target.value.replace(/\D/g, '')
                setCostoRecambio(val)
              }}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-4 space-y-2 border border-primary/20">
          <h3 className="text-text-main font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Resumen del Total
          </h3>
          <div className="space-y-1 text-sm text-text-muted">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Días de alquiler
              </span>
              <span className="text-text-main font-medium">{dias}</span>
            </div>
            <div className="flex justify-between">
              <span>Precio por día</span>
              <span className="text-text-main">{pStr === '' ? '—' : '$' + pNum.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo base ({dias} × {pStr === '' ? '—' : '$' + pNum.toLocaleString('es-AR')})</span>
              <span className="text-text-main">{pStr === '' ? '—' : '$' + (dias * pNum).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo de recambio</span>
              <span className="text-text-main">{cStr === '' ? '—' : '$' + cNum.toLocaleString('es-AR')}</span>
            </div>
          </div>
          <hr className="border-primary/20" />
          <div className="flex justify-between text-base font-bold text-primary">
            <span>Total</span>
            <span>{pStr === '' || cStr === '' ? '—' : '$' + total.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium"
        >
          Guardar Reserva
        </button>
      </form>
    </div>
  )
}
