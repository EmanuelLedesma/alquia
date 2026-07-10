import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, X, Image as ImageIcon, CalendarPlus, UserPlus, ReceiptText, CalendarDays,
  ChevronLeft, ChevronRight, AlertCircle, TrendingUp, TrendingDown, Wallet,
} from 'lucide-react'
import { supabase } from '../services/supabase'

function formatCurrency(n) {
  return '$' + Number(n || 0).toLocaleString('es-AR')
}

function fmtDate(iso) {
  if (!iso) return ''
  var p = iso.split('-')
  return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-AR')
}

function todayIso() {
  var d = new Date()
  var y = d.getFullYear()
  var m = String(d.getMonth() + 1).padStart(2, '0')
  var day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

function currentYear() {
  return new Date().getFullYear()
}

function currentMonth() {
  return new Date().getMonth() + 1
}

function RecambioInput({ value, onSave }) {
  var [draft, setDraft] = useState(value ? String(Number(value)) : '')
  var [editing, setEditing] = useState(false)

  useEffect(function () {
    if (!editing) {
      setDraft(value ? String(Number(value)) : '')
    }
  }, [value, editing])

  function commit() {
    setEditing(false)
    var n = draft === '' ? 0 : Number(draft.replace(/\D/g, ''))
    if (n !== Number(value || 0)) onSave(n)
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={function () { setEditing(true) }}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-secondary text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
      >
        <span>Recambio:</span>
        <span className="tabular-nums">{formatCurrency(value || 0)}</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
      <input
        type="text"
        inputMode="numeric"
        autoFocus
        value={draft ? Number(draft).toLocaleString('es-AR') : ''}
        onChange={function (e) { setDraft(e.target.value.replace(/\D/g, '')) }}
        onBlur={commit}
        onKeyDown={function (e) { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setEditing(false); setDraft(value ? String(Number(value)) : '') } }}
        className="w-32 h-8 pl-5 pr-2 rounded-full border border-primary bg-white text-text-main text-xs font-semibold"
      />
    </div>
  )
}

function PhotoCarousel({ fotos, onAdd }) {
  var [idx, setIdx] = useState(0)
  var list = fotos || []
  var fileRef = useRef(null)

  function next() { setIdx(function (i) { return (i + 1) % Math.max(list.length, 1) }) }
  function prev() { setIdx(function (i) { return (i - 1 + Math.max(list.length, 1)) % Math.max(list.length, 1) }) }

  if (list.length === 0) {
    return (
      <div className="aspect-[4/3] w-full bg-slate-200 relative">
        <input ref={fileRef} type="file" accept="image/*" onChange={onAdd} className="hidden" />
        <button
          type="button"
          onClick={function () { fileRef.current && fileRef.current.click() }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary transition-colors"
        >
          <ImageIcon className="w-10 h-10" />
          <span className="text-xs font-medium">Subir foto</span>
        </button>
      </div>
    )
  }

  return (
    <div className="aspect-[4/3] w-full relative bg-slate-100 group">
      <input ref={fileRef} type="file" accept="image/*" onChange={onAdd} className="hidden" />
      <img src={list[idx]} alt="" className="w-full h-full object-cover" />
      {list.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {list.map(function (_, i) {
              return (
                <span
                  key={i}
                  className={'w-1.5 h-1.5 rounded-full ' + (i === idx ? 'bg-white' : 'bg-white/50')}
                />
              )
            })}
          </div>
        </>
      )}
      <button
        type="button"
        onClick={function () { fileRef.current && fileRef.current.click() }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

function FotoUploadHandler({ file, onComplete }) {
  useEffect(function () {
    var cancelled = false
    async function go() {
      try {
        var ext = file.name.split('.').pop()
        var fileName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext
        var up = await supabase.storage.from('fotos-inmuebles').upload(fileName, file)
        if (up.error) throw new Error(up.error.message)
        var url = supabase.storage.from('fotos-inmuebles').getPublicUrl(fileName).data.publicUrl
        if (!cancelled) onComplete(null, url)
      } catch (err) {
        if (!cancelled) onComplete(err.message, null)
      }
    }
    go()
    return function () { cancelled = true }
  }, [file])
  return null
}

export default function PanelControlView() {
  const navigate = useNavigate()
  const [inmuebles, setInmuebles] = useState([])
  const [alquileres, setAlquileres] = useState([])
  const [senas, setSenas] = useState([])
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', texto_disponibilidad: '', costo_recambio: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [pendingUploads, setPendingUploads] = useState([])
  const [recambioPagado] = useState(function () {
    try { return JSON.parse(localStorage.getItem('recambioPagado') || '{}') } catch (e) { return {} }
  })

  useEffect(function () {
    Promise.all([
      supabase.from('inmuebles').select('*'),
      supabase.from('alquileres').select('id, fecha_desde, fecha_hasta, monto_total, total_senas_recibidas, cliente_id, inmueble_id, clientes(nombre, apellido), inmuebles(nombre)'),
      supabase.from('senas').select('id, alquiler_id, monto'),
      supabase.from('gastos').select('id, concepto, monto, fecha'),
    ]).then(function (r) {
      setInmuebles(r[0].data || [])
      setAlquileres(r[1].data || [])
      setSenas(r[2].data || [])
      setGastos(r[3].data || [])
      setLoading(false)
    })
  }, [])

  function handleChange(field, value) {
    setForm(function (prev) { return Object.assign({}, prev, { [field]: value }) })
  }

  function resetForm() {
    setForm({ nombre: '', descripcion: '', texto_disponibilidad: '', costo_recambio: '' })
    setErrorMsg('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    try {
      var recNum = form.costo_recambio === '' ? 0 : Number(form.costo_recambio.replace(/\D/g, ''))
      var ins = await supabase.from('inmuebles').insert({
        nombre: form.nombre,
        descripcion: form.descripcion,
        texto_disponibilidad: form.texto_disponibilidad,
        costo_recambio: recNum,
        fotos_urls: [],
      }).select().single()
      if (ins.error) throw new Error(ins.error.message)
      setInmuebles(function (prev) { return [ins.data].concat(prev) })
      resetForm()
      setModalOpen(false)
    } catch (err) {
      setErrorMsg(err.message)
    }
    setSubmitting(false)
  }

  async function saveRecambio(inmuebleId, value) {
    setInmuebles(function (prev) {
      return prev.map(function (x) { return x.id === inmuebleId ? Object.assign({}, x, { costo_recambio: value }) : x })
    })
    var res = await supabase.from('inmuebles').update({ costo_recambio: value }).eq('id', inmuebleId)
    if (res.error) setErrorMsg(res.error.message)
  }

  function onAddFoto(inmuebleId) {
    return function (e) {
      var file = e.target.files && e.target.files[0]
      if (!file) return
      var uploadId = Date.now() + '-' + Math.random().toString(36).slice(2)
      setPendingUploads(function (prev) { return prev.concat([{ id: uploadId, inmuebleId: inmuebleId, file: file }]) })
      e.target.value = ''
    }
  }

  function onUploadComplete(uploadId, err, url) {
    if (err) {
      setErrorMsg(err)
      setPendingUploads(function (prev) { return prev.filter(function (u) { return u.id !== uploadId }) })
      return
    }
    var upload = pendingUploads.find(function (u) { return u.id === uploadId })
    if (!upload) return
    var targetId = upload.inmuebleId
    setInmuebles(function (prev) {
      return prev.map(function (x) {
        if (x.id !== targetId) return x
        var arr = (x.fotos_urls || []).concat([url])
        return Object.assign({}, x, { fotos_urls: arr })
      })
    })
    var newArr = ((inmuebles.find(function (x) { return x.id === targetId }) || {}).fotos_urls || []).concat([url])
    supabase.from('inmuebles').update({ fotos_urls: newArr }).eq('id', targetId).then(function (res) {
      if (res.error) setErrorMsg(res.error.message)
    })
    setPendingUploads(function (prev) { return prev.filter(function (u) { return u.id !== uploadId }) })
  }

  var anio = currentYear()
  var mesActual = currentMonth()
  var hoy = todayIso()

  var ingresosMes = 0
  for (var gi = 0; gi < alquileres.length; gi++) {
    var a = alquileres[gi]
    if (!a.fecha_desde) continue
    var p = a.fecha_desde.split('-')
    if (Number(p[0]) === anio && Number(p[1]) === mesActual) {
      ingresosMes += Number(a.monto_total || 0)
    }
  }
  var allAlquilerIds = {}
  for (var ai2 = 0; ai2 < alquileres.length; ai2++) {
    var aa = alquileres[ai2]
    if (!aa.fecha_desde) continue
    var pp = aa.fecha_desde.split('-')
    if (Number(pp[0]) === anio && Number(pp[1]) === mesActual) {
      allAlquilerIds[aa.id] = true
    }
  }
  for (var si = 0; si < senas.length; si++) {
    var s = senas[si]
    if (allAlquilerIds[s.alquiler_id]) {
      ingresosMes -= Number(s.monto || 0)
    }
  }
  ingresosMes = Math.max(0, ingresosMes)

  var gastosMesTotal = 0
  for (var ggi = 0; ggi < gastos.length; ggi++) {
    var g = gastos[ggi]
    if (g.concepto && g.concepto.indexOf('Recambio -') === 0) continue
    if (!g.fecha) continue
    var gp = g.fecha.split('-')
    if (Number(gp[0]) === anio && Number(gp[1]) === mesActual) {
      gastosMesTotal += Number(g.monto || 0)
    }
  }
  var balanceMes = ingresosMes - gastosMesTotal

  var proximas = alquileres
    .filter(function (a) { return a.fecha_hasta && a.fecha_hasta >= hoy })
    .sort(function (a, b) { return a.fecha_desde.localeCompare(b.fecha_desde) })
    .slice(0, 3)

  var alertas = []
  for (var ri = 0; ri < alquileres.length; ri++) {
    var ra = alquileres[ri]
    if (!ra.costo_recambio) continue
    var pago = recambioPagado[ra.id]
    if (pago) continue
    var concepto = 'Recambio - ' + (ra.inmuebles && ra.inmuebles.nombre ? ra.inmuebles.nombre : '') + ' (alquiler #' + ra.id + ')'
    var tieneGasto = gastos.some(function (x) { return x.concepto === concepto })
    if (!tieneGasto) continue
    var cli = ra.clientes ? (ra.clientes.nombre + ' ' + (ra.clientes.apellido || '')) : 'Cliente'
    alertas.push({
      tipo: 'recambio',
      label: 'Recambio pendiente · ' + cli,
      monto: ra.costo_recambio,
      link: '/reservas/' + ra.id,
    })
  }
  for (var pi = 0; pi < alquileres.length; pi++) {
    var pa = alquileres[pi]
    var sen = Number(pa.total_senas_recibidas || 0)
    var tot = Number(pa.monto_total || 0)
    if (sen > 0 && sen < tot && pa.fecha_hasta && pa.fecha_hasta >= hoy) {
      var cliP = pa.clientes ? (pa.clientes.nombre + ' ' + (pa.clientes.apellido || '')) : 'Cliente'
      alertas.push({
        tipo: 'senado',
        label: 'Saldo pendiente · ' + cliP,
        monto: tot - sen,
        link: '/reservas/' + pa.id,
      })
    }
  }

  function metricsFor(inmuebleId) {
    var cnt = 0
    var ing = 0
    for (var i = 0; i < alquileres.length; i++) {
      var x = alquileres[i]
      if (x.inmueble_id !== inmuebleId) continue
      if (!x.fecha_desde) continue
      var xp = x.fecha_desde.split('-')
      if (Number(xp[0]) !== anio) continue
      cnt++
      ing += Number(x.monto_total || 0)
    }
    return { reservas: cnt, ingresos: ing }
  }

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-main text-xl font-bold">Panel de Control</h1>
          <p className="text-text-muted text-sm">Resumen y gestion de inmuebles</p>
        </div>
        <button
          onClick={function () { setModalOpen(true); setErrorMsg('') }}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Inmueble
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      <section className="grid grid-cols-2 gap-2">
        <Link to="/reservas" className="flex flex-col items-center justify-center gap-1 h-20 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
          <CalendarPlus className="w-5 h-5" />
          Nueva Reserva
        </Link>
        <Link to="/clientes" className="flex flex-col items-center justify-center gap-1 h-20 rounded-xl bg-secondary text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
          <UserPlus className="w-5 h-5" />
          Nuevo Cliente
        </Link>
        <Link to="/gastos" className="flex flex-col items-center justify-center gap-1 h-20 rounded-xl bg-secondary text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
          <ReceiptText className="w-5 h-5" />
          Nuevo Gasto
        </Link>
        <Link to="/calendario" className="flex flex-col items-center justify-center gap-1 h-20 rounded-xl bg-secondary text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
          <CalendarDays className="w-5 h-5" />
          Ver Calendario
        </Link>
      </section>

      <section>
        <h2 className="text-text-main font-semibold text-sm mb-2">Este mes</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface rounded-xl p-3 border-l-4 border-green-500">
            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Ingresos
            </div>
            <p className="text-base font-bold text-green-600 tabular-nums mt-1">{formatCurrency(ingresosMes)}</p>
          </div>
          <div className="bg-surface rounded-xl p-3 border-l-4 border-red-500">
            <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              Gastos
            </div>
            <p className="text-base font-bold text-red-500 tabular-nums mt-1">{formatCurrency(gastosMesTotal)}</p>
          </div>
          <div className={'bg-surface rounded-xl p-3 border-l-4 ' + (balanceMes >= 0 ? 'border-green-500' : 'border-red-500')}>
            <div className={'flex items-center gap-1 text-xs font-medium ' + (balanceMes >= 0 ? 'text-green-600' : 'text-red-500')}>
              <Wallet className="w-3.5 h-3.5" />
              Balance
            </div>
            <p className={'text-base font-bold tabular-nums mt-1 ' + (balanceMes >= 0 ? 'text-green-600' : 'text-red-500')}>{formatCurrency(balanceMes)}</p>
          </div>
        </div>
      </section>

      {proximas.length > 0 && (
        <section>
          <h2 className="text-text-main font-semibold text-sm mb-2">Próximas reservas</h2>
          <div className="space-y-2">
            {proximas.map(function (a) {
              var cli = a.clientes ? (a.clientes.nombre + ' ' + (a.clientes.apellido || '')) : 'Cliente'
              var inm = a.inmuebles ? a.inmuebles.nombre : 'Inmueble'
              return (
                <Link
                  key={a.id}
                  to={'/reservas/' + a.id}
                  className="flex items-center justify-between gap-2 bg-surface rounded-xl shadow-sm p-3 hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0">
                    <p className="text-text-main text-sm font-medium truncate">{cli}</p>
                    <p className="text-text-muted text-xs truncate">{inm}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-text-main text-xs font-medium">{fmtDate(a.fecha_desde)}</p>
                    <p className="text-text-muted text-[10px]">→ {fmtDate(a.fecha_hasta)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {alertas.length > 0 && (
        <section>
          <h2 className="text-text-main font-semibold text-sm mb-2">Pendientes</h2>
          <div className="space-y-2">
            {alertas.slice(0, 4).map(function (al, i) {
              return (
                <Link
                  key={i}
                  to={al.link}
                  className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 hover:bg-amber-100 transition-colors"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-text-main text-xs flex-1 truncate">{al.label}</span>
                  <span className="text-amber-700 text-xs font-semibold tabular-nums shrink-0">{formatCurrency(al.monto)}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-text-main font-semibold text-sm mb-2">Inmuebles</h2>
        {loading ? (
          <p className="text-text-muted text-sm">Cargando…</p>
        ) : inmuebles.length === 0 ? (
          <p className="text-text-muted text-sm">No hay inmuebles registrados aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inmuebles.map(function (d) {
              var m = metricsFor(d.id)
              return (
                <div key={d.id} className="bg-surface rounded-xl shadow-sm overflow-hidden">
                  <PhotoCarousel fotos={d.fotos_urls} onAdd={onAddFoto(d.id)} />
                  <div className="p-3 space-y-2">
                    <Link to={'/inmuebles/' + d.id} className="block">
                      <h3 className="text-text-main font-semibold text-sm truncate">{d.nombre}</h3>
                      {d.descripcion && (
                        <p className="text-text-muted text-xs line-clamp-2 mt-0.5">{d.descripcion}</p>
                      )}
                    </Link>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="text-[10px] text-text-muted">
                        <span className="font-semibold text-text-main">{m.reservas}</span> reservas
                        <span className="mx-1">·</span>
                        <span className="font-semibold text-text-main tabular-nums">{formatCurrency(m.ingresos)}</span>
                      </div>
                      <RecambioInput
                        value={d.costo_recambio}
                        onSave={function (n) { saveRecambio(d.id, n) }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {pendingUploads.map(function (u) {
        return <FotoUploadHandler key={u.id} file={u.file} onComplete={function (err, url) { onUploadComplete(u.id, err, url) }} />
      })}

      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-lg">Nuevo Inmueble</h2>
              <button
                onClick={function () { setModalOpen(false); resetForm() }}
                className="text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              <form id="inmueble-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={function (e) { handleChange('nombre', e.target.value) }}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Costo de recambio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.costo_recambio ? Number(form.costo_recambio).toLocaleString('es-AR') : ''}
                      onChange={function (e) { handleChange('costo_recambio', e.target.value.replace(/\D/g, '')) }}
                      placeholder="0"
                      className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted">Se autocompleta al crear reservas sobre este inmueble.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={function (e) { handleChange('descripcion', e.target.value) }}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-surface text-text-main text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Texto de disponibilidad</label>
                  <textarea
                    value={form.texto_disponibilidad}
                    onChange={function (e) { handleChange('texto_disponibilidad', e.target.value) }}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-surface text-text-main text-sm resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 space-y-2">
              {errorMsg && (
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
              )}
              <button
                type="submit"
                form="inmueble-form"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Guardando…' : 'Guardar Inmueble'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
