import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, TrendingUp, TrendingDown, DollarSign, X, Check } from 'lucide-react'
import { supabase } from '../services/supabase'
import { isoToDisplay, displayToIso, formatDateInput } from '../lib/utils'

var MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatCurrency(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

function formatDate(d) {
  if (!d) return ''
  var parts = d.split('-')
  return parts[2] + '/' + parts[1] + '/' + parts[0]
}

function getYear(d) {
  return d ? d.split('-')[0] : ''
}

function getMonth(d) {
  return d ? d.split('-')[1] : ''
}

export default function GastosView() {
  var [gastos, setGastos] = useState([])
  var [senas, setSenas] = useState([])
  var [inmuebles, setInmuebles] = useState([])
  var [alquileresList, setAlquileresList] = useState([])
  var [loading, setLoading] = useState(true)

  var [periodo, setPeriodo] = useState('todo')
  var [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()))
  var [monthFilter, setMonthFilter] = useState('')
  var [tipoFilter, setTipoFilter] = useState('todo')

  var [showModal, setShowModal] = useState(false)
  var [tipoMov, setTipoMov] = useState('gasto')
  var [formInmuebleId, setFormInmuebleId] = useState('')
  var [formAlquilerId, setFormAlquilerId] = useState('')
  var [formConcepto, setFormConcepto] = useState('')
  var [formMonto, setFormMonto] = useState('')
  var [formFecha, setFormFecha] = useState('')
  var [submitting, setSubmitting] = useState(false)
  var [submitError, setSubmitError] = useState('')

  useEffect(function () {
    Promise.all([
      supabase.from('gastos').select('*, inmuebles(nombre)').order('fecha', { ascending: false }),
      supabase.from('senas').select('*, alquileres(inmueble_id, inmuebles(nombre), clientes(nombre, apellido))'),
      supabase.from('inmuebles').select('id, nombre'),
      supabase.from('alquileres').select('id, fecha_desde, fecha_hasta, monto_total, total_senas_recibidas, clientes(nombre, apellido), inmuebles(nombre)').order('fecha_desde', { ascending: false }),
    ]).then(function ([gastosRes, senasRes, inmueblesRes, alquileresRes]) {
      if (gastosRes.data) setGastos(gastosRes.data)
      if (senasRes.data) setSenas(senasRes.data)
      if (inmueblesRes.data) setInmuebles(inmueblesRes.data)
      if (alquileresRes.data) setAlquileresList(alquileresRes.data)
      setLoading(false)
    })
  }, [])

  function resetForm() {
    setTipoMov('gasto')
    setFormInmuebleId('')
    setFormAlquilerId('')
    setFormConcepto('')
    setFormMonto('')
    setFormFecha('')
    setSubmitting(false)
    setSubmitError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    var montoNum = Number(formMonto)
    var isoFecha = displayToIso(formFecha)
    if (!montoNum) { setSubmitError('Ingresá un monto válido'); return }
    if (!isoFecha) { setSubmitError('Ingresá una fecha completa (dd/mm/aa)'); return }
    if (tipoMov === 'gasto' && !formConcepto.trim()) { setSubmitError('Ingresá un concepto'); return }
    if (tipoMov === 'ingreso' && !formAlquilerId) { setSubmitError('Seleccioná un alquiler'); return }

    setSubmitting(true)

    if (tipoMov === 'gasto') {
      var anioTemp = Number(isoFecha.split('-')[0])
      var gastoData = {
        concepto: formConcepto.trim(),
        monto: montoNum,
        fecha: isoFecha,
        anio_temporada: anioTemp,
      }
      if (formInmuebleId) {
        gastoData.inmueble_id = Number(formInmuebleId)
      }
      supabase.from('gastos').insert(gastoData).then(function (res) {
        if (res.error) {
          setSubmitError('Error al guardar: ' + res.error.message)
          setSubmitting(false)
          return
        }
        setGastos(function (prev) {
          var nuevo = {
            id: Date.now(),
            concepto: formConcepto.trim(),
            monto: montoNum,
            fecha: isoFecha,
            anio_temporada: anioTemp,
            inmuebles: formInmuebleId ? { nombre: inmuebles.find(function (i) { return i.id === Number(formInmuebleId) })?.nombre || '' } : null,
          }
          if (formInmuebleId) nuevo.inmueble_id = Number(formInmuebleId)
          return [nuevo].concat(prev)
        })
        setShowModal(false)
        resetForm()
        setSubmitting(false)
      })
    } else {
      var alquilerSel = alquileresList.find(function (a) { return a.id === Number(formAlquilerId) })
      var senasActuales = Number(alquilerSel?.total_senas_recibidas || 0)
      var nuevoTotalSenas = senasActuales + montoNum

      supabase.from('senas').insert({
        alquiler_id: Number(formAlquilerId),
        monto: montoNum,
        fecha: isoFecha,
      }).then(function (senasRes) {
        if (!senasRes.error) {
          supabase.from('alquileres').update({ total_senas_recibidas: nuevoTotalSenas }).eq('id', Number(formAlquilerId)).then(function () {
            setSenas(function (prev) {
              var nuevaSena = {
                id: Date.now(),
                alquiler_id: Number(formAlquilerId),
                monto: montoNum,
                fecha: isoFecha,
                alquileres: alquilerSel
                  ? {
                      inmueble_id: alquilerSel.inmueble_id,
                      inmuebles: alquilerSel.inmuebles,
                      clientes: alquilerSel.clientes,
                    }
                  : null,
              }
              return [nuevaSena].concat(prev)
            })
            setShowModal(false)
            resetForm()
            setSubmitting(false)
          })
        } else {
          setSubmitError('Error al guardar: ' + senasRes.error.message)
          setSubmitting(false)
        }
      })
    }
  }

  // Build unified transactions
  var transacciones = []

  for (var gi = 0; gi < gastos.length; gi++) {
    var g = gastos[gi]
    transacciones.push({
      id: 'gasto-' + g.id,
      tipo: 'Gasto',
      monto: g.monto,
      fecha: g.fecha,
      descripcion: g.concepto,
      categoria: g.categoria || '',
      inmueble: g.inmuebles?.nombre || '',
    })
  }

  for (var si = 0; si < senas.length; si++) {
    var s = senas[si]
    var alq = s.alquileres || {}
    var cliente = alq.clientes || {}
    var nombreCliente = (cliente.nombre || '') + ' ' + (cliente.apellido || '')
    transacciones.push({
      id: 'ingreso-' + s.id,
      tipo: 'Ingreso',
      monto: s.monto,
      fecha: s.fecha,
      descripcion: (nombreCliente.trim() || 'Seña') + (alq.inmuebles?.nombre ? ' — ' + alq.inmuebles.nombre : ''),
      categoria: 'alquiler',
      inmueble: alq.inmuebles?.nombre || '',
    })
  }

  transacciones.sort(function (a, b) {
    if (a.fecha > b.fecha) return -1
    if (a.fecha < b.fecha) return 1
    return 0
  })

  // Apply filters
  var filtered = transacciones

  if (periodo === 'año') {
    filtered = filtered.filter(function (t) {
      return getYear(t.fecha) === yearFilter
    })
  } else if (periodo === 'mes') {
    filtered = filtered.filter(function (t) {
      return getYear(t.fecha) === yearFilter && getMonth(t.fecha) === monthFilter
    })
  }

  if (tipoFilter === 'ingreso') {
    filtered = filtered.filter(function (t) { return t.tipo === 'Ingreso' })
  } else if (tipoFilter === 'gasto') {
    filtered = filtered.filter(function (t) { return t.tipo === 'Gasto' })
  }

  // Compute KPIs from ALL data (unfiltered)
  var ingresosTotal = 0
  var gastosTotal = 0

  for (var fi = 0; fi < transacciones.length; fi++) {
    var ft = transacciones[fi]
    if (ft.tipo === 'Ingreso') {
      ingresosTotal += ft.monto
    } else {
      gastosTotal += ft.monto
    }
  }

  var balance = ingresosTotal - gastosTotal

  var showYearSelect = periodo === 'año' || periodo === 'mes'
  var showMonthSelect = periodo === 'mes'

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-text-main text-xl font-bold">Gesti&oacute;n Financiera</h1>
          <p className="text-text-muted text-sm mt-0.5">Dashboard de ingresos y gastos</p>
        </div>
        <button
          onClick={function () { setShowModal(true) }}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Movimiento
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-12">Cargando datos financieros...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface rounded-xl shadow-sm p-4 space-y-2 border-l-4 border-green-500">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">Ingresos</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(ingresosTotal)}</p>
            </div>

            <div className="bg-surface rounded-xl shadow-sm p-4 space-y-2 border-l-4 border-red-500">
              <div className="flex items-center gap-2 text-red-500">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-semibold">Gastos</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(gastosTotal)}</p>
            </div>

            <div className={'bg-surface rounded-xl shadow-sm p-4 space-y-2 border-l-4 ' + (balance >= 0 ? 'border-green-500' : 'border-red-500')}>
              <div className={'flex items-center gap-2 ' + (balance >= 0 ? 'text-green-600' : 'text-red-500')}>
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold">Balance</span>
              </div>
              <p className={'text-2xl font-bold ' + (balance >= 0 ? 'text-green-600' : 'text-red-500')}>{formatCurrency(balance)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={periodo}
              onChange={function (e) { setPeriodo(e.target.value) }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
            >
              <option value="todo">Todo el tiempo</option>
              <option value="año">Por a&ntilde;o</option>
              <option value="mes">Por mes</option>
            </select>

            {showYearSelect && (
              <select
                value={yearFilter}
                onChange={function (e) { setYearFilter(e.target.value) }}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            )}

            <select
              value={tipoFilter}
              onChange={function (e) { setTipoFilter(e.target.value) }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
            >
              <option value="todo">Todo</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
            </select>

            {showMonthSelect && (
              <select
                value={monthFilter}
                onChange={function (e) { setMonthFilter(e.target.value) }}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
              >
                <option value="">Seleccionar mes</option>
                {MONTHS.map(function (m, idx) {
                  var val = String(idx + 1)
                  if (val.length === 1) val = '0' + val
                  return <option key={val} value={val}>{m}</option>
                })}
              </select>
            )}
          </div>

          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-text-muted font-medium px-4 py-3">Fecha</th>
                  <th className="text-left text-text-muted font-medium px-4 py-3">Descripci&oacute;n</th>
                  <th className="text-left text-text-muted font-medium px-4 py-3 hidden sm:table-cell">Categor&iacute;a</th>
                  <th className="text-center text-text-muted font-medium px-4 py-3">Tipo</th>
                  <th className="text-right text-text-muted font-medium px-4 py-3">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-text-muted py-8">No hay movimientos en este per&iacute;odo.</td>
                  </tr>
                )}
                {filtered.map(function (t) {
                  var esIngreso = t.tipo === 'Ingreso'
                  return (
                    <tr key={t.id} className={'border-b border-slate-100 transition-colors ' + (esIngreso ? 'bg-green-50/40' : 'bg-red-50/40')}>
                      <td className="px-4 py-3 text-text-muted text-xs">{formatDate(t.fecha)}</td>
                      <td className="px-4 py-3 text-text-main">
                        <div className="font-medium">{t.descripcion}</div>
                        {t.inmueble && <div className="text-[11px] text-text-muted">{t.inmueble}</div>}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs hidden sm:table-cell">{t.categoria || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ' + (esIngreso ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                          {t.tipo}
                        </span>
                      </td>
                      <td className={'px-4 py-3 text-right font-medium tabular-nums ' + (esIngreso ? 'text-green-600' : 'text-red-500')}>
                        {esIngreso ? '+' : '-'}{formatCurrency(t.monto)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4" onClick={function (e) { if (e.target === e.currentTarget) { setShowModal(false); resetForm() } }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold">Nuevo Movimiento</h2>
              <button onClick={function () { setShowModal(false); resetForm() }} className="text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              <form id="movimiento-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Tipo</label>
                  <select
                    value={tipoMov}
                    onChange={function (e) { setTipoMov(e.target.value) }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
                  >
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso</option>
                  </select>
                </div>

                {tipoMov === 'gasto' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm text-text-muted font-medium">Inmueble</label>
                      <select
                        value={formInmuebleId}
                        onChange={function (e) { setFormInmuebleId(e.target.value) }}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
                      >
                        <option value="">Sin especificar</option>
                        {inmuebles.map(function (i) {
                          return <option key={i.id} value={i.id}>{i.nombre}</option>
                        })}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-text-muted font-medium">Concepto</label>
                      <input
                        type="text"
                        value={formConcepto}
                        onChange={function (e) { setFormConcepto(e.target.value) }}
                        placeholder="Ej. Reparaci&oacute;n termotanque"
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Alquiler</label>
                    <select
                      value={formAlquilerId}
                      onChange={function (e) { setFormAlquilerId(e.target.value) }}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
                    >
                      <option value="">Seleccionar alquiler</option>
                      {alquileresList.map(function (a) {
                        var c = a.clientes || {}
                        return <option key={a.id} value={a.id}>{(c.nombre || '') + ' ' + (c.apellido || '') + ' — ' + (a.inmuebles?.nombre || '')}</option>
                      })}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Monto</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formMonto}
                    onChange={function (e) {
                      var v = e.target.value.replace(/\D/g, '')
                      setFormMonto(v)
                    }}
                    placeholder="0"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Fecha</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formFecha}
                    onChange={function (e) { setFormFecha(formatDateInput(e.target.value)) }}
                    placeholder="dd/mm/aa"
                    maxLength={8}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-200 space-y-2">
              {submitError && <p className="text-xs text-red-500 text-center">{submitError}</p>}
              {submitting && <p className="text-xs text-text-muted text-center">Guardando...</p>}
              <button
                type="submit"
                form="movimiento-form"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {tipoMov === 'gasto' ? 'Registrar Gasto' : 'Registrar Ingreso'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
