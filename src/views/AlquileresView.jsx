import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronDown, Pencil, X } from 'lucide-react'
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

export default function AlquileresView() {
  var navigate = useNavigate()

  var [alquileres, setAlquileres] = useState([])
  var [inmuebles, setInmuebles] = useState([])
  var [loading, setLoading] = useState(true)
  var [openDropdownId, setOpenDropdownId] = useState(null)
  var [dropdownPos, setDropdownPos] = useState(null)
  var [senadoInputVal, setSenadoInputVal] = useState({})
  var [showSenadoInput, setShowSenadoInput] = useState(false)
  var [dropdownError, setDropdownError] = useState('')
  var dropdownRef = useRef(null)

  var [search, setSearch] = useState('')
  var [yearFilter, setYearFilter] = useState('')
  var [inmuebleFilter, setInmuebleFilter] = useState('')
  var [statusFilter, setStatusFilter] = useState('')
  var [recambioPagado, setRecambioPagado] = useState(function () {
    try { return JSON.parse(localStorage.getItem('recambioPagado') || '{}') } catch (e) { return {} }
  })
  var [recambioGastoId, setRecambioGastoId] = useState({})

  function cerrarDropdown() {
    setOpenDropdownId(null)
    setDropdownPos(null)
    setShowSenadoInput(false)
    setDropdownError('')
  }

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
      if (!res.data) { setLoading(false); return }
      setAlquileres(res.data)
      var promesas = res.data.filter(function (a) { return a.costo_recambio }).map(function (a) {
        var concepto = 'Recambio - ' + (a.inmuebles?.nombre || '') + ' (alquiler #' + a.id + ')'
        return supabase.from('gastos').select('id').eq('concepto', concepto).maybeSingle().then(function (r) {
          return r.data ? { id: a.id, gastoId: r.data.id } : null
        })
      })
      Promise.all(promesas).then(function (results) {
        var map = {}
        results.forEach(function (r) { if (r) map[r.id] = r.gastoId })
        setRecambioGastoId(map)
        setLoading(false)
      })
    })
  }, [yearFilter, inmuebleFilter])

  useEffect(function () {
    if (!openDropdownId) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !e.target.closest('[data-badge]')) {
        cerrarDropdown()
      }
    }
    function handleScroll() { cerrarDropdown() }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, { capture: true })
    return function () {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [openDropdownId])

  function handlePagado(a) {
    var current = Number(a.total_senas_recibidas) || 0
    var total = Number(a.monto_total) || 0
    var remaining = total - current

    if (remaining <= 0) {
      setDropdownError('El alquiler ya está completamente pagado')
      return
    }

    var today = new Date().toISOString().split('T')[0]

    supabase.from('senas').insert({
      alquiler_id: a.id,
      monto: remaining,
      fecha: today,
    }).then(function (senasRes) {
      if (!senasRes.error) {
        supabase.from('alquileres').update({ total_senas_recibidas: total }).eq('id', a.id).then(function (res) {
          if (!res.error) {
            setAlquileres(function (prev) {
              return prev.map(function (x) { return x.id === a.id ? { ...x, total_senas_recibidas: total } : x })
            })
          }
        })
      }
      cerrarDropdown()
    })
  }

  function handleAgregarSena(a) {
    var monto = Number(senadoInputVal[a.id])
    var total = Number(a.monto_total) || 0
    var current = Number(a.total_senas_recibidas) || 0

    if (isNaN(monto) || monto <= 0) {
      setDropdownError('Ingresá un monto válido')
      return
    }

    if (current + monto > total) {
      setDropdownError('La suma de señas no puede superar los ' + formatCurrency(total))
      return
    }

    var today = new Date().toISOString().split('T')[0]

    var nuevoTotal = current + monto
    var esPagado = nuevoTotal >= total

    supabase.from('senas').insert({
      alquiler_id: a.id,
      monto: monto,
      fecha: today,
    }).then(function (senasRes) {
      if (!senasRes.error) {
        var finalTotal = esPagado ? total : nuevoTotal
        supabase.from('alquileres').update({ total_senas_recibidas: finalTotal }).eq('id', a.id).then(function (res) {
          if (!res.error) {
            setAlquileres(function (prev) {
              return prev.map(function (x) { return x.id === a.id ? { ...x, total_senas_recibidas: finalTotal } : x })
            })
          }
        })
      }
      cerrarDropdown()
    })
  }

  function handleEditarTotal(a) {
    var monto = Number(senadoInputVal[a.id])
    var total = Number(a.monto_total) || 0

    if (isNaN(monto) || monto < 0) {
      setDropdownError('Ingresá un monto válido')
      return
    }

    if (monto > total) {
      setDropdownError('El total de señas no puede superar ' + formatCurrency(total))
      return
    }

    var finalTotal = monto >= total ? total : monto

    supabase.from('senas').delete().eq('alquiler_id', a.id).then(function () {
      if (finalTotal > 0) {
        var today = new Date().toISOString().split('T')[0]
        return supabase.from('senas').insert({
          alquiler_id: a.id,
          monto: finalTotal,
          fecha: today,
        })
      }
    }).then(function () {
      supabase.from('alquileres').update({ total_senas_recibidas: finalTotal }).eq('id', a.id).then(function (res) {
        if (!res.error) {
          setAlquileres(function (prev) {
            return prev.map(function (x) { return x.id === a.id ? { ...x, total_senas_recibidas: finalTotal } : x })
          })
        }
        cerrarDropdown()
      })
    })
  }

  function handlePendiente(a) {
    supabase.from('senas').delete().eq('alquiler_id', a.id).then(function () {
      supabase.from('alquileres').update({ total_senas_recibidas: 0 }).eq('id', a.id).then(function (res) {
        if (!res.error) {
          setAlquileres(function (prev) {
            return prev.map(function (x) { return x.id === a.id ? { ...x, total_senas_recibidas: 0 } : x })
          })
        }
        cerrarDropdown()
      })
    })
  }

  function handleDelete(a) {
    if (!window.confirm('¿Eliminar alquiler de ' + (a.clientes?.nombre || '') + ' ' + (a.clientes?.apellido || '') + '?')) return
    var gastoId = recambioGastoId[a.id]
    Promise.all([
      supabase.from('senas').delete().eq('alquiler_id', a.id),
      gastoId ? supabase.from('gastos').delete().eq('id', gastoId) : Promise.resolve(),
    ]).then(function () {
      supabase.from('alquileres').delete().eq('id', a.id).then(function () {
        setAlquileres(function (prev) { return prev.filter(function (x) { return x.id !== a.id }) })
        setRecambioPagado(function (prev) { var n = { ...prev }; delete n[a.id]; return n })
        setRecambioGastoId(function (prev) { var n = { ...prev }; delete n[a.id]; return n })
      })
    })
  }

  function toggleRecambio(id) {
    setRecambioPagado(function (prev) {
      var next = { ...prev, [id]: !prev[id] }
      localStorage.setItem('recambioPagado', JSON.stringify(next))
      return next
    })
  }

  function handleBadgeClick(e, a) {
    if (openDropdownId === a.id) {
      cerrarDropdown()
    } else {
      var rect = e.currentTarget.getBoundingClientRect()
      setDropdownPos({ top: rect.top, left: rect.left + rect.width / 2, width: rect.width })
      setOpenDropdownId(a.id)
      setSenadoInputVal(function (prev) { return { ...prev, [a.id]: '' } })
      setShowSenadoInput(false)
      setDropdownError('')
    }
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-text-main text-xl font-bold">Gestión de Alquileres</h1>
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
            placeholder="Buscar cliente..."
            value={search}
            onChange={function (e) { setSearch(e.target.value) }}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white text-text-main text-sm border border-slate-200"
          />
          </div>

          <select
            value={yearFilter}
            onChange={function (e) { setYearFilter(e.target.value) }}
            className="h-10 px-3 rounded-xl bg-primary text-white text-sm appearance-none font-medium"
          >
            <option value="" style={{ background: '#fff', color: '#333' }}>Todos los a&ntilde;os</option>
            {Array.from({ length: 11 }, function (_, i) {
              var y = 2020 + i
              return <option key={y} value={y} style={{ background: '#fff', color: '#333' }}>{y}</option>
            })}
          </select>

          <select
            value={inmuebleFilter}
            onChange={function (e) { setInmuebleFilter(e.target.value) }}
            className="h-10 px-3 rounded-xl bg-primary text-white text-sm appearance-none font-medium"
          >
            <option value="" style={{ background: '#fff', color: '#333' }}>Todos los inmuebles</option>
            {inmuebles.map(function (i) {
              return <option key={i.id} value={i.id} style={{ background: '#fff', color: '#333' }}>{i.nombre}</option>
            })}
          </select>

          <select
            value={statusFilter}
            onChange={function (e) { setStatusFilter(e.target.value) }}
            className="h-10 px-3 rounded-xl bg-primary text-white text-sm appearance-none font-medium"
          >
            <option value="" style={{ background: '#fff', color: '#333' }}>Todos los estados</option>
            <option value="pagado" style={{ background: '#fff', color: '#333' }}>Pagado</option>
            <option value="senado" style={{ background: '#fff', color: '#333' }}>Señado</option>
            <option value="pendiente" style={{ background: '#fff', color: '#333' }}>Pendiente</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-4">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-text-muted font-medium px-4 py-3">Cliente</th>
              <th className="text-left text-text-muted font-medium px-4 py-3">Inmueble</th>
              <th className="text-right text-text-muted font-medium px-4 py-3">Recambio</th>
              <th className="text-left text-text-muted font-medium px-4 py-3">Entrada</th>
              <th className="text-left text-text-muted font-medium px-4 py-3">Salida</th>
              <th className="text-center text-text-muted font-medium px-4 py-3">Días</th>
              <th className="text-right text-text-muted font-medium px-4 py-3">Seña</th>
              <th className="text-right text-text-muted font-medium px-4 py-3">Total</th>
              <th className="text-right text-text-muted font-medium px-4 py-3">Resto</th>
              <th className="text-center text-text-muted font-medium px-4 py-3">Estado</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={11} className="text-center text-text-muted py-8">Cargando...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center text-text-muted py-8">No se encontraron alquileres.</td>
              </tr>
            )}
            {!loading && filtered.map(function (a) {
              var senas = Number(a.total_senas_recibidas) || 0
              var total = Number(a.monto_total) || 0
              var resto = total - senas
              var status = getStatus(senas, total)
              var dias = Number(a.cant_dias) || diasEntre(a.fecha_desde, a.fecha_hasta) || 0
              return (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-text-main font-medium">
                    {a.clientes?.nombre} {a.clientes?.apellido}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{a.inmuebles?.nombre}</td>
                  <td className={'px-4 py-3 text-right tabular-nums ' + (a.costo_recambio && !recambioPagado[a.id] ? 'text-red-500' : 'text-text-muted')}>
                    {a.costo_recambio ? (
                      <span className="inline-flex items-center justify-end gap-1.5">
                        <span>{formatCurrency(a.costo_recambio)}</span>
                        <input
                          type="checkbox"
                          checked={!!recambioPagado[a.id]}
                          onChange={function () { toggleRecambio(a.id) }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-primary accent-primary shrink-0"
                        />
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(a.fecha_desde)}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(a.fecha_hasta)}</td>
                  <td className="px-4 py-3 text-center text-text-main font-medium tabular-nums">
                    {dias}
                  </td>
                  <td className="px-4 py-3 text-right text-text-main font-medium">
                    {senas > 0 ? formatCurrency(senas) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-text-main font-medium">{formatCurrency(total)}</div>
                  </td>
                  <td className={'px-4 py-3 text-right font-medium ' + (resto > 0 ? 'text-red-500' : 'text-text-main')}>
                    {resto > 0 ? formatCurrency(resto) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      data-badge="true"
                      onClick={function (e) { handleBadgeClick(e, a) }}
                      className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ' + (STATUS_COLORS[status] || '')}
                    >
                      {STATUS_DISPLAY[status] || status}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      onClick={function () { handleDelete(a) }}
                      className="text-text-muted hover:text-red-500 transition-colors p-0.5"
                      title="Eliminar alquiler"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {filtered.length > 0 && (function () {
            var sumSenas = 0, sumTotal = 0, sumResto = 0, sumRecambio = 0
            filtered.forEach(function (a) {
              var s = Number(a.total_senas_recibidas) || 0
              var t = Number(a.monto_total) || 0
              var r = Number(a.costo_recambio) || 0
              sumSenas += s
              sumTotal += t
              sumResto += t - s
              if (!recambioPagado[a.id]) sumRecambio += r
            })
            return (
              <tfoot>
                <tr className="border-t border-primary/30 text-sm font-semibold bg-primary text-white">
                  <td colSpan={2} className="px-4 py-3">TOTAL</td>
                  <td className={'px-4 py-3 text-right tabular-nums ' + (sumRecambio > 0 ? 'text-red-300' : '')}>{formatCurrency(sumRecambio)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(sumSenas)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(sumTotal)}</td>
                  <td className={'px-4 py-3 text-right tabular-nums ' + (sumResto > 0 ? 'text-red-300' : '')}>{formatCurrency(sumResto)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-2 py-3" />
                </tr>
              </tfoot>
            )
          })()}
        </table>
      </div>

      {openDropdownId && dropdownPos && createPortal((function () {
        var a = alquileres.find(function (x) { return x.id === openDropdownId })
        if (!a) return null
        var senas = Number(a.total_senas_recibidas) || 0
        var total = Number(a.monto_total) || 0
        var status = getStatus(senas, total)
        return (
          <div
            ref={function (el) {
              dropdownRef.current = el
              if (el && !el.dataset.clamped) {
                el.dataset.clamped = 'true'
                var r = el.getBoundingClientRect()
                if (r.right > window.innerWidth) {
                  el.style.left = (window.innerWidth - r.width - 12) + 'px'
                  el.style.transform = 'none'
                } else if (r.left < 12) {
                  el.style.left = '12px'
                  el.style.transform = 'none'
                }
                if (r.bottom > window.innerHeight) {
                  el.style.top = (window.innerHeight - r.height - 8) + 'px'
                }
                if (r.top < 0) {
                  el.style.top = '8px'
                }
              }
            }}
            className="fixed z-[9999] bg-surface border border-slate-200 rounded-xl shadow-lg p-1 min-w-[180px]"
            style={{
              top: dropdownPos.top + 'px',
              left: dropdownPos.left + 'px',
              transform: 'translateX(-50%)',
            }}
          >
            <button
              onClick={function () { handlePagado(a) }}
              className={'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-slate-100 ' + (status === 'pagado' ? 'bg-green-100 text-green-700 font-semibold' : 'text-text-main')}
            >
              Pagado
            </button>

            <div className="px-1 py-0.5">
              <button
                onClick={function () { setShowSenadoInput(!showSenadoInput); setDropdownError('') }}
                className={'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-slate-100 ' + (status === 'senado' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-text-main')}
              >
                Señado
              </button>
              {showSenadoInput && <div className="px-1 pt-1 pb-1.5 space-y-1.5">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[10px] font-medium">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={senadoInputVal[a.id] ? Number(senadoInputVal[a.id]).toLocaleString('es-AR') : ''}
                    onChange={function (e) {
                      var v = e.target.value.replace(/\D/g, '')
                      setSenadoInputVal(function (prev) { return { ...prev, [a.id]: v } })
                      setDropdownError('')
                    }}
                    placeholder="Monto"
                    className="w-full h-8 pl-5 pr-2 rounded-lg border border-slate-200 bg-surface text-text-main text-xs text-right"
                  />
                </div>
                {dropdownError && (
                  <p className="text-[10px] text-red-500 leading-tight px-0.5">{dropdownError}</p>
                )}
                <div className="flex gap-1.5">
                  <button
                    onClick={function () { handleAgregarSena(a) }}
                    className="flex-1 h-7 rounded-lg bg-primary text-white text-xs font-medium flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={function () { handleEditarTotal(a) }}
                    className="h-7 w-7 rounded-lg border border-slate-200 text-text-muted flex items-center justify-center hover:bg-slate-50 transition-colors"
                    title="Editar total de señas"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>}
            </div>

            <button
              onClick={function () { handlePendiente(a) }}
              className={'w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-slate-100 ' + (status === 'pendiente' ? 'bg-gray-100 text-gray-600 font-semibold' : 'text-text-main')}
            >
              Pendiente
            </button>
          </div>
        )
      })(), document.body)}
    </div>
  )
}
