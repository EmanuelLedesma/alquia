import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronDown, Check } from 'lucide-react'
import { supabase } from '../services/supabase'
import { diasEntre } from '../lib/utils'

var STATUS_DISPLAY = {
  pagado: 'Pagado',
  senado: 'Señado',
  pendiente: 'Pendiente',
}

var STATUS_COLORS = {
  pagado: 'bg-green-100 text-green-700',
  senado: 'bg-blue-100 text-blue-700',
  pendiente: 'bg-gray-100 text-gray-600',
}

function formatDate(d) {
  if (!d) return ''
  var parts = d.split('-')
  return parts[2] + '/' + parts[1] + '/' + parts[0]
}

function formatCurrency(n) {
  return '$' + Number(n).toLocaleString('es-AR')
}

function getStatus(senas, total) {
  var s = Number(senas)
  var t = Number(total)
  if (s >= t) return 'pagado'
  if (s > 0) return 'senado'
  return 'pendiente'
}

function formatDiasRange(desde, hasta) {
  var d = diasEntre(desde, hasta)
  return d + ' (' + formatDate(desde) + ' - ' + formatDate(hasta) + ')'
}

export default function AlquileresView() {
  var navigate = useNavigate()

  var [alquileres, setAlquileres] = useState([])
  var [inmuebles, setInmuebles] = useState([])
  var [loading, setLoading] = useState(true)
  var [openDropdownId, setOpenDropdownId] = useState(null)

  var [search, setSearch] = useState('')
  var [yearFilter, setYearFilter] = useState('2026')
  var [inmuebleFilter, setInmuebleFilter] = useState('')
  var [statusFilter, setStatusFilter] = useState('')

  useEffect(function () {
    supabase.from('inmuebles').select('id, nombre').then(function (res) {
      if (res.data) setInmuebles(res.data)
    })
  }, [])

  useEffect(function () {
    setLoading(true)
    var query = supabase
      .from('alquileres')
      .select('*, clientes(nombre, apellido), inmuebles(nombre)')

    if (yearFilter) {
      query = query.eq('anio_temporada', Number(yearFilter))
    }
    if (inmuebleFilter) {
      query = query.eq('inmueble_id', Number(inmuebleFilter))
    }

    query.order('fecha_desde', { ascending: false }).then(function (res) {
      if (res.data) setAlquileres(res.data)
      setLoading(false)
    })
  }, [yearFilter, inmuebleFilter])

  useEffect(function () {
    if (!openDropdownId) return
    function handleClick(e) {
      if (!e.target.closest('[data-dropdown]')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return function () { document.removeEventListener('mousedown', handleClick) }
  }, [openDropdownId])

  function handleQuickStatus(a, newStatus) {
    if (newStatus === 'pagado') {
      supabase.from('alquileres').update({ total_senas_recibidas: a.monto_total }).eq('id', a.id).then(function (res) {
        if (!res.error) {
          setAlquileres(function (prev) {
            return prev.map(function (x) { return x.id === a.id ? { ...x, total_senas_recibidas: a.monto_total } : x })
          })
        }
      })
      setOpenDropdownId(null)
    } else if (newStatus === 'pendiente') {
      supabase.from('alquileres').update({ total_senas_recibidas: 0 }).eq('id', a.id).then(function (res) {
        if (!res.error) {
          setAlquileres(function (prev) {
            return prev.map(function (x) { return x.id === a.id ? { ...x, total_senas_recibidas: 0 } : x })
          })
        }
      })
      setOpenDropdownId(null)
    }
  }

  function handleConfirmSenado(a) {
    var val = Number(senadoInputVal[a.id])
    if (isNaN(val) || val <= 0) return
    supabase.from('alquileres').update({ total_senas_recibidas: val }).eq('id', a.id).then(function (res) {
      if (!res.error) {
        setAlquileres(function (prev) {
          return prev.map(function (x) { return x.id === a.id ? { ...x, total_senas_recibidas: val } : x })
        })
      }
    })
    setOpenDropdownId(null)
  }

  var filtered = alquileres.filter(function (a) {
    var status = getStatus(a.total_senas_recibidas, a.monto_total)
    if (statusFilter && status !== statusFilter) return false

    if (search) {
      var q = search.toLowerCase()
      var cliente = (a.clientes?.nombre + ' ' + a.clientes?.apellido).toLowerCase()
      var inmueble = (a.inmuebles?.nombre || '').toLowerCase()
      if (!cliente.includes(q) && !inmueble.includes(q)) return false
    }

    return true
  })

  var [senadoInputVal, setSenadoInputVal] = useState({})

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-text-main text-xl font-bold">Gesti\u00f3n de Alquileres</h1>
          <p className="text-text-muted text-sm mt-0.5">Administra todos los alquileres</p>
        </div>
        <button
          onClick={function () { navigate('/reservas') }}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Alquiler
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar cliente o inmueble..."
            value={search}
            onChange={function (e) { setSearch(e.target.value) }}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
          />
        </div>

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

        <select
          value={inmuebleFilter}
          onChange={function (e) { setInmuebleFilter(e.target.value) }}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
        >
          <option value="">Todos los inmuebles</option>
          {inmuebles.map(function (i) {
            return <option key={i.id} value={i.id}>{i.nombre}</option>
          })}
        </select>

        <select
          value={statusFilter}
          onChange={function (e) { setStatusFilter(e.target.value) }}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
        >
          <option value="">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="senado">Se\u00f1ado</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      <div className="overflow-x-auto -mx-4">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-text-muted font-medium px-4 py-3">Cliente</th>
              <th className="text-left text-text-muted font-medium px-4 py-3">Inmueble</th>
              <th className="text-left text-text-muted font-medium px-4 py-3">Entrada</th>
              <th className="text-left text-text-muted font-medium px-4 py-3">Salida</th>
              <th className="text-right text-text-muted font-medium px-4 py-3">Se\u00f1a</th>
              <th className="text-right text-text-muted font-medium px-4 py-3">Total</th>
              <th className="text-right text-text-muted font-medium px-4 py-3">Resto</th>
              <th className="text-left text-text-muted font-medium px-4 py-3">D\u00edas</th>
              <th className="text-center text-text-muted font-medium px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="text-center text-text-muted py-8">Cargando...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-text-muted py-8">No se encontraron alquileres.</td>
              </tr>
            )}
            {!loading && filtered.map(function (a) {
              var senas = Number(a.total_senas_recibidas) || 0
              var total = Number(a.monto_total) || 0
              var resto = total - senas
              var status = getStatus(senas, total)
              var dias = Number(a.cant_dias) || diasEntre(a.fecha_desde, a.fecha_hasta) || 0
              var precio = Number(a.precio_por_dia) || 0
              var recambio = Number(a.costo_recambio) || 0
              return (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-text-main font-medium">
                    {a.clientes?.nombre} {a.clientes?.apellido}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{a.inmuebles?.nombre}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(a.fecha_desde)}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(a.fecha_hasta)}</td>
                  <td className="px-4 py-3 text-right text-text-main font-medium">
                    {senas > 0 ? formatCurrency(senas) : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-text-main font-medium">{formatCurrency(total)}</div>
                    <div className="text-[10px] text-text-muted leading-tight">
                      {dias} {'\u00d7'} {formatCurrency(precio)}{recambio > 0 ? ' + ' + formatCurrency(recambio) : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-text-main font-medium">
                    {resto > 0 ? formatCurrency(resto) : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs">
                    {formatDiasRange(a.fecha_desde, a.fecha_hasta)}
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <button
                      data-dropdown="true"
                      onClick={function () {
                        setOpenDropdownId(openDropdownId === a.id ? null : a.id)
                        if (openDropdownId !== a.id) {
                          setSenadoInputVal(function (prev) { return { ...prev, [a.id]: String(senas) } })
                        }
                      }}
                      className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ' + (STATUS_COLORS[status] || '')}
                    >
                      {STATUS_DISPLAY[status] || status}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {openDropdownId === a.id && (
                      <div
                        data-dropdown="true"
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 bg-surface border border-slate-200 rounded-xl shadow-lg p-1 min-w-[140px]"
                      >
                        <button
                          data-dropdown="true"
                          onClick={function () { handleQuickStatus(a, 'pagado') }}
                          className={'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-slate-100 ' + (status === 'pagado' ? 'bg-green-100 text-green-700 font-semibold' : 'text-text-main')}
                        >
                          Pagado
                        </button>

                        <div className="px-1 py-0.5">
                          <div
                            data-dropdown="true"
                            className={'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (status === 'senado' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-text-main')}
                          >
                            Se\u00f1ado
                          </div>
                          <div data-dropdown="true" className="px-1 pt-1 pb-1.5 space-y-1">
                            <input
                              data-dropdown="true"
                              type="text"
                              inputMode="numeric"
                              value={senadoInputVal[a.id] || ''}
                              onChange={function (e) {
                                var v = e.target.value.replace(/\D/g, '')
                                setSenadoInputVal(function (prev) { return { ...prev, [a.id]: v } })
                              }}
                              placeholder="Monto de la se\u00f1a"
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-surface text-text-main text-xs text-right"
                            />
                            <button
                              data-dropdown="true"
                              onClick={function () { handleConfirmSenado(a) }}
                              className="w-full h-7 rounded-lg bg-primary text-white text-xs font-medium flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Confirmar
                            </button>
                          </div>
                        </div>

                        <button
                          data-dropdown="true"
                          onClick={function () { handleQuickStatus(a, 'pendiente') }}
                          className={'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-slate-100 ' + (status === 'pendiente' ? 'bg-gray-100 text-gray-600 font-semibold' : 'text-text-main')}
                        >
                          Pendiente
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
