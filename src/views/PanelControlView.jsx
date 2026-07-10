import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Plus, X, Image as ImageIcon, CalendarPlus, UserPlus, ReceiptText, CalendarDays,
  ChevronLeft, ChevronRight, AlertCircle, TrendingUp, TrendingDown, Wallet, Copy,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { diasEntre, displayToIso, formatDateInput } from '../lib/utils'

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

function initials(nombre, apellido) {
  var n = (nombre || '').trim()
  var a = (apellido || '').trim()
  return ((n[0] || '') + (a[0] || '')).toUpperCase() || '?'
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
    <div className="aspect-[4/3] w-full relative bg-slate-100">
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

var TEMPLATES_KEY = 'templates-global'

export default function PanelControlView() {
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
  const [templates, setTemplates] = useState(function () {
    try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]') } catch (e) { return [] }
  })
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templateForm, setTemplateForm] = useState({ title: '', content: '' })
  const [copyToast, setCopyToast] = useState(null)

  const [temporadas, setTemporadas] = useState(function () {
    try { return JSON.parse(localStorage.getItem('temporadas') || '{}') } catch (e) { return {} }
  })
  const [temporadaModal, setTemporadaModal] = useState(null)

  var initialClienteForm = {
    nombre: '', apellido: '', dni: '', celular: '', email: '',
    adultos: 1, chicos: 0, lleva_mascotas: false, estado: 'prospecto',
    anio_alquiler: new Date().getFullYear(),
  }
  const [clienteModalOpen, setClienteModalOpen] = useState(false)
  const [clienteForm, setClienteForm] = useState(initialClienteForm)
  const [clienteSubmitting, setClienteSubmitting] = useState(false)
  const [clienteError, setClienteError] = useState('')

  const [gastoModalOpen, setGastoModalOpen] = useState(false)
  const [gastoTipo, setGastoTipo] = useState('gasto')
  const [gastoForm, setGastoForm] = useState({
    inmuebleId: '', concepto: '', alquilerId: '', monto: '', fecha: '',
  })
  const [gastoSubmitting, setGastoSubmitting] = useState(false)
  const [gastoError, setGastoError] = useState('')

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

  useEffect(function () {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  }, [templates])

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
    var target = inmuebles.find(function (x) { return x.id === targetId })
    var newArr = ((target && target.fotos_urls) || []).concat([url])
    supabase.from('inmuebles').update({ fotos_urls: newArr }).eq('id', targetId).then(function (res) {
      if (res.error) setErrorMsg(res.error.message)
    })
    setPendingUploads(function (prev) { return prev.filter(function (u) { return u.id !== uploadId }) })
  }

  function addTemplate() {
    if (!templateForm.title.trim() || !templateForm.content.trim()) return
    setTemplates(function (prev) {
      return [{ id: Date.now(), title: templateForm.title.trim(), content: templateForm.content.trim() }].concat(prev)
    })
    setTemplateForm({ title: '', content: '' })
    setTemplateModalOpen(false)
  }

  function deleteTemplate(id) {
    setTemplates(function (prev) { return prev.filter(function (t) { return t.id !== id }) })
  }

  function copyText(text, label) {
    navigator.clipboard.writeText(text).then(function () {
      setCopyToast('¡' + label + ' copiado!')
      setTimeout(function () { setCopyToast(null) }, 2000)
    })
  }

  function openTemporada(inmueble) {
    var t = temporadas[inmueble.id] || {}
    setTemporadaModal({ id: inmueble.id, nombre: inmueble.nombre, desde: t.desde || '', hasta: t.hasta || '' })
  }

  function saveTemporada() {
    if (!temporadaModal) return
    if (!temporadaModal.desde || !temporadaModal.hasta) return
    if (temporadaModal.desde >= temporadaModal.hasta) {
      setErrorMsg('La fecha desde debe ser anterior a hasta.')
      return
    }
    var updated = Object.assign({}, temporadas)
    updated[temporadaModal.id] = { desde: temporadaModal.desde, hasta: temporadaModal.hasta }
    setTemporadas(updated)
    localStorage.setItem('temporadas', JSON.stringify(updated))
    setTemporadaModal(null)
  }

  function clearTemporada(id) {
    var updated = Object.assign({}, temporadas)
    delete updated[id]
    setTemporadas(updated)
    localStorage.setItem('temporadas', JSON.stringify(updated))
  }

  function openClienteModal() {
    setClienteForm(initialClienteForm)
    setClienteError('')
    setClienteModalOpen(true)
  }

  function changeCliente(field, value) {
    setClienteForm(function (prev) { return Object.assign({}, prev, { [field]: value }) })
  }

  async function submitCliente(e) {
    e.preventDefault()
    setClienteSubmitting(true)
    setClienteError('')
    try {
      var payload = {
        nombre: clienteForm.nombre.trim(),
        apellido: clienteForm.apellido.trim(),
        dni: clienteForm.dni.trim(),
        celular: clienteForm.celular.trim(),
        email: clienteForm.email.trim(),
        adultos: Number(clienteForm.adultos) || 1,
        chicos: Number(clienteForm.chicos) || 0,
        lleva_mascotas: !!clienteForm.lleva_mascotas,
        estado: clienteForm.estado,
        anio_alquiler: Number(clienteForm.anio_alquiler) || new Date().getFullYear(),
      }
      var res = await supabase.from('clientes').insert(payload).select().single()
      if (res.error) throw new Error(res.error.message)
      setClienteModalOpen(false)
      setClienteForm(initialClienteForm)
    } catch (err) {
      setClienteError(err.message)
    }
    setClienteSubmitting(false)
  }

  function openGastoModal() {
    setGastoTipo('gasto')
    setGastoForm({ inmuebleId: '', concepto: '', alquilerId: '', monto: '', fecha: '' })
    setGastoError('')
    setGastoModalOpen(true)
  }

  function changeGasto(field, value) {
    setGastoForm(function (prev) { return Object.assign({}, prev, { [field]: value }) })
  }

  async function submitGasto(e) {
    e.preventDefault()
    setGastoSubmitting(true)
    setGastoError('')
    try {
      var montoNum = Number(gastoForm.monto.replace(/\D/g, ''))
      var isoFecha = displayToIso(gastoForm.fecha)
      if (!montoNum) throw new Error('Ingresá un monto válido.')
      if (!isoFecha) throw new Error('Ingresá una fecha completa (dd/mm/aa).')

      if (gastoTipo === 'gasto') {
        if (!gastoForm.concepto.trim()) throw new Error('Ingresá un concepto.')
        var anioTemp = Number(isoFecha.split('-')[0])
        var data = {
          concepto: gastoForm.concepto.trim(),
          monto: montoNum,
          fecha: isoFecha,
          anio_temporada: anioTemp,
        }
        if (gastoForm.inmuebleId) data.inmueble_id = Number(gastoForm.inmuebleId)
        var res = await supabase.from('gastos').insert(data).select().single()
        if (res.error) throw new Error(res.error.message)
        var inm = inmuebles.find(function (i) { return i.id === Number(gastoForm.inmuebleId) })
        setGastos(function (prev) { return [{
          id: res.data.id,
          concepto: data.concepto,
          monto: montoNum,
          fecha: isoFecha,
          anio_temporada: anioTemp,
          inmueble_id: data.inmueble_id,
          inmuebles: inm ? { nombre: inm.nombre } : null,
        }].concat(prev) })
      } else {
        if (!gastoForm.alquilerId) throw new Error('Seleccioná un alquiler.')
        var alqSel = alquileres.find(function (a) { return a.id === Number(gastoForm.alquilerId) })
        if (!alqSel) throw new Error('Alquiler inválido.')
        var senasActuales = Number(alqSel.total_senas_recibidas || 0)
        var nuevoTotal = senasActuales + montoNum
        var senaRes = await supabase.from('senas').insert({
          alquiler_id: Number(gastoForm.alquilerId),
          monto: montoNum,
          fecha: isoFecha,
        }).select().single()
        if (senaRes.error) throw new Error(senaRes.error.message)
        await supabase.from('alquileres').update({ total_senas_recibidas: nuevoTotal }).eq('id', alqSel.id)
        setSenas(function (prev) { return [{
          id: senaRes.data.id,
          alquiler_id: alqSel.id,
          monto: montoNum,
          fecha: isoFecha,
          alquileres: alqSel,
        }].concat(prev) })
        setAlquileres(function (prev) {
          return prev.map(function (a) { return a.id === alqSel.id ? Object.assign({}, a, { total_senas_recibidas: nuevoTotal }) : a })
        })
      }
      setGastoModalOpen(false)
    } catch (err) {
      setGastoError(err.message)
    }
    setGastoSubmitting(false)
  }

  var anio = currentYear()
  var mesActual = currentMonth()
  var hoy = todayIso()

  var ingresosTemporada = 0
  for (var it = 0; it < alquileres.length; it++) {
    var alq = alquileres[it]
    if (!alq.fecha_desde) continue
    if (Number(alq.fecha_desde.split('-')[0]) === anio) {
      ingresosTemporada += Number(alq.monto_total || 0)
    }
  }

  var gastosTemporada = 0
  for (var ggt = 0; ggt < gastos.length; ggt++) {
    var gt = gastos[ggt]
    if (gt.concepto && gt.concepto.indexOf('Recambio -') === 0) continue
    if (!gt.fecha) continue
    if (Number(gt.fecha.split('-')[0]) === anio) {
      gastosTemporada += Number(gt.monto || 0)
    }
  }
  var netoTemporada = ingresosTemporada - gastosTemporada

  var ingresosMes = 0
  var allAlquilerIdsMes = {}
  for (var aim = 0; aim < alquileres.length; aim++) {
    var aam = alquileres[aim]
    if (!aam.fecha_desde) continue
    var ppm = aam.fecha_desde.split('-')
    if (Number(ppm[0]) === anio && Number(ppm[1]) === mesActual) {
      ingresosMes += Number(aam.monto_total || 0)
      allAlquilerIdsMes[aam.id] = true
    }
  }
  for (var sm = 0; sm < senas.length; sm++) {
    var ss = senas[sm]
    if (allAlquilerIdsMes[ss.alquiler_id]) {
      ingresosMes -= Number(ss.monto || 0)
    }
  }
  ingresosMes = Math.max(0, ingresosMes)

  var gastosMes = 0
  for (var ggm = 0; ggm < gastos.length; ggm++) {
    var gm = gastos[ggm]
    if (gm.concepto && gm.concepto.indexOf('Recambio -') === 0) continue
    if (!gm.fecha) continue
    var gpm = gm.fecha.split('-')
    if (Number(gpm[0]) === anio && Number(gpm[1]) === mesActual) {
      gastosMes += Number(gm.monto || 0)
    }
  }
  var balanceMes = ingresosMes - gastosMes

  var hospedados = alquileres.filter(function (a) {
    return a.fecha_desde && a.fecha_hasta && a.fecha_desde <= hoy && a.fecha_hasta > hoy
  })

  var proximosInq = alquileres
    .filter(function (a) { return a.fecha_desde && a.fecha_desde > hoy })
    .sort(function (a, b) { return a.fecha_desde.localeCompare(b.fecha_desde) })
    .slice(0, 4)

  function ocupacion(inmuebleId) {
    var t = temporadas[inmuebleId]
    var rangeStart, rangeEnd, total
    if (t && t.desde && t.hasta) {
      rangeStart = t.desde
      rangeEnd = t.hasta
      total = Math.max(1, diasEntre(rangeStart, rangeEnd))
    } else {
      rangeStart = anio + '-01-01'
      rangeEnd = (anio + 1) + '-01-01'
      total = 365
    }
    var reservas = alquileres.filter(function (a) {
      if (a.inmueble_id !== inmuebleId) return false
      if (!a.fecha_desde || !a.fecha_hasta) return false
      return a.fecha_desde < rangeEnd && a.fecha_hasta > rangeStart
    })
    var dias = {}
    reservas.forEach(function (r) {
      var start = r.fecha_desde < rangeStart ? rangeStart : r.fecha_desde
      var end = r.fecha_hasta > rangeEnd ? rangeEnd : r.fecha_hasta
      if (start >= end) return
      var sp = start.split('-')
      var ep = end.split('-')
      var d = new Date(+sp[0], +sp[1] - 1, +sp[2])
      var endD = new Date(+ep[0], +ep[1] - 1, +ep[2])
      while (d < endD) {
        var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
        dias[key] = true
        d.setDate(d.getDate() + 1)
      }
    })
    var count = Object.keys(dias).length
    return { ocupados: count, total: total, pct: Math.round(count / total * 100) }
  }

  var alertas = []
  for (var ri = 0; ri < alquileres.length; ri++) {
    var ra = alquileres[ri]
    if (!ra.costo_recambio) continue
    if (recambioPagado[ra.id]) continue
    var concepto = 'Recambio - ' + (ra.inmuebles && ra.inmuebles.nombre ? ra.inmuebles.nombre : '') + ' (alquiler #' + ra.id + ')'
    var tieneGasto = gastos.some(function (x) { return x.concepto === concepto })
    if (!tieneGasto) continue
    var cli = ra.clientes ? (ra.clientes.nombre + ' ' + (ra.clientes.apellido || '')) : 'Cliente'
    alertas.push({
      tipo: 'recambio',
      label: 'Recambio · ' + cli,
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
        label: 'Saldo · ' + cliP,
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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">

      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-primary font-semibold">Temporada {anio}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main mt-1">Panel de control</h1>
        </div>
        <button
          onClick={function () { setModalOpen(true); setErrorMsg('') }}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Inmueble
        </button>
      </header>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-white/5"></div>

          <p className="text-[11px] uppercase tracking-widest text-white/80 font-semibold relative">
            Ingresos de la temporada
          </p>
          <p className="text-4xl md:text-5xl font-bold mt-2 relative tabular-nums">
            {formatCurrency(ingresosTemporada)}
          </p>

          <div className="mt-5 pt-4 border-t border-white/20 flex justify-between relative">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/70 font-medium">Gastos</p>
              <p className="text-sm font-semibold mt-0.5 tabular-nums">{formatCurrency(gastosTemporada)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/70 font-medium">Neto</p>
              <p className="text-sm font-semibold mt-0.5 tabular-nums">{formatCurrency(netoTemporada)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
          <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-1 text-green-600 text-[10px] font-semibold uppercase tracking-wider">
              <TrendingUp className="w-3 h-3" />
              Ingresos mes
            </div>
            <p className="text-lg font-bold text-green-600 tabular-nums mt-1">{formatCurrency(ingresosMes)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center gap-1 text-red-500 text-[10px] font-semibold uppercase tracking-wider">
              <TrendingDown className="w-3 h-3" />
              Gastos mes
            </div>
            <p className="text-lg font-bold text-red-500 tabular-nums mt-1">{formatCurrency(gastosMes)}</p>
          </div>
          <div className={'bg-white rounded-xl p-3 shadow-sm border-l-4 ' + (balanceMes >= 0 ? 'border-green-500' : 'border-red-500')}>
            <div className={'flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ' + (balanceMes >= 0 ? 'text-green-600' : 'text-red-500')}>
              <Wallet className="w-3 h-3" />
              Balance
            </div>
            <p className={'text-lg font-bold tabular-nums mt-1 ' + (balanceMes >= 0 ? 'text-green-600' : 'text-red-500')}>
              {formatCurrency(balanceMes)}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-text-main font-semibold text-sm mb-2.5">Ocupación por inmueble</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {inmuebles.map(function (d) {
            var oc = ocupacion(d.id)
            var tieneTemp = !!(temporadas[d.id] && temporadas[d.id].desde && temporadas[d.id].hasta)
            return (
              <div key={d.id} className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative">
                <Link to={'/inmuebles/' + d.id} className="block">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium truncate pr-14">{d.nombre}</p>
                  <p className="text-xl font-bold text-text-main mt-1 tabular-nums">{oc.pct}%</p>
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: oc.pct + '%' }}></div>
                  </div>
                  <p className="text-text-muted text-[10px] mt-1.5 tabular-nums">{oc.ocupados}/{oc.total} días</p>
                </Link>
                <button
                  onClick={function () { openTemporada(d) }}
                  className={'absolute top-2 right-2 h-7 px-2 rounded-md text-[10px] font-semibold inline-flex items-center gap-1 ' + (tieneTemp ? 'bg-primary text-white' : 'bg-secondary text-primary hover:bg-primary hover:text-white transition-colors')}
                  title={tieneTemp ? 'Temporada definida' : 'Definir temporada'}
                >
                  <CalendarIcon className="w-3 h-3" />
                  {tieneTemp ? 'Editar' : 'Temporada'}
                </button>
              </div>
            )
          })}
          <button
            onClick={function () { setModalOpen(true); setErrorMsg('') }}
            className="border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors min-h-[88px]"
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold mt-1.5">Añadir inmueble</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <h2 className="text-text-main font-semibold text-sm mb-2.5">Hospedados ahora</h2>
          {hospedados.length === 0 ? (
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-text-muted text-xs">Sin huéspedes activos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hospedados.map(function (a) {
                var cli = a.clientes || {}
                return (
                  <Link
                    key={a.id}
                    to={'/reservas/' + a.id}
                    className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials(cli.nombre, cli.apellido)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-main text-sm font-medium truncate">{(cli.nombre || '') + ' ' + (cli.apellido || '')}</p>
                      <p className="text-text-muted text-xs truncate">
                        {(a.inmuebles ? a.inmuebles.nombre : '') + ' · sale ' + fmtDate(a.fecha_hasta)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold uppercase tracking-wide">Activo</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-text-main font-semibold text-sm mb-2.5">Próximos inquilinos</h2>
          {proximosInq.length === 0 ? (
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-text-muted text-xs">Sin próximas reservas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {proximosInq.map(function (a) {
                var cli = a.clientes || {}
                return (
                  <Link
                    key={a.id}
                    to={'/reservas/' + a.id}
                    className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials(cli.nombre, cli.apellido)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-main text-sm font-medium truncate">{(cli.nombre || '') + ' ' + (cli.apellido || '')}</p>
                      <p className="text-text-muted text-xs truncate">
                        {(a.inmuebles ? a.inmuebles.nombre : '') + ' · ingresa ' + fmtDate(a.fecha_desde)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold uppercase tracking-wide">Próximo</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-text-main font-semibold text-sm mb-2.5">Pendientes</h2>
          {alertas.length === 0 ? (
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-text-muted text-xs">Sin pendientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alertas.slice(0, 5).map(function (al, i) {
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
          )}
        </div>
      </section>

      <section>
        <h2 className="text-text-main font-semibold text-sm mb-2.5">Accesos rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/reservas" className="flex items-center gap-3 bg-white text-primary border border-primary/20 rounded-xl p-4 hover:bg-secondary transition-colors">
            <CalendarPlus className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Nueva Reserva</span>
          </Link>
          <button onClick={openClienteModal} className="flex items-center gap-3 bg-white text-primary border border-primary/20 rounded-xl p-4 hover:bg-secondary transition-colors text-left">
            <UserPlus className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Nuevo Cliente</span>
          </button>
          <button onClick={openGastoModal} className="flex items-center gap-3 bg-white text-primary border border-primary/20 rounded-xl p-4 hover:bg-secondary transition-colors text-left">
            <ReceiptText className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Nuevo Gasto</span>
          </button>
          <Link to="/calendario" className="flex items-center gap-3 bg-white text-primary border border-primary/20 rounded-xl p-4 hover:bg-secondary transition-colors">
            <CalendarDays className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Calendario</span>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-text-main font-semibold text-sm mb-2.5">Galería</h2>
        {loading ? (
          <p className="text-text-muted text-sm">Cargando…</p>
        ) : (() => {
          var allPhotos = []
          inmuebles.forEach(function (d) {
            (d.fotos_urls || []).forEach(function (url) {
              allPhotos.push({ url: url, inmuebleId: d.id, inmuebleNombre: d.nombre })
            })
          })
          if (allPhotos.length === 0) {
            return (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <ImageIcon className="w-10 h-10 text-text-muted mx-auto" />
                <p className="text-text-muted text-sm mt-2">No hay fotos todavía.</p>
                <p className="text-text-muted text-xs mt-1">Subí fotos desde un inmueble.</p>
              </div>
            )
          }
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {allPhotos.map(function (p, i) {
                return (
                  <Link
                    key={i}
                    to={'/inmuebles/' + p.inmuebleId}
                    className="relative aspect-square overflow-hidden rounded-xl group bg-slate-100"
                  >
                    <img src={p.url} alt={p.inmuebleNombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 pt-6">
                      <p className="text-white text-xs font-semibold truncate">{p.inmuebleNombre}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        })()}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-text-main font-semibold text-sm">Textos rápidos</h2>
          <button
            onClick={function () { setTemplateModalOpen(true); setTemplateForm({ title: '', content: '' }) }}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-secondary text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo texto
          </button>
        </div>
        {templates.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-text-muted text-sm">No hay textos rápidos guardados.</p>
            <p className="text-text-muted text-xs mt-1">Creá uno con el botón de arriba.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {templates.map(function (t) {
              return (
                <div key={t.id} className="bg-white rounded-xl p-3 shadow-sm relative group">
                  <button
                    onClick={function () { copyText(t.content, t.title) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-md text-text-muted hover:text-primary hover:bg-secondary transition-colors flex items-center justify-center"
                    aria-label="Copiar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={function () { deleteTemplate(t.id) }}
                    className="absolute top-2 right-10 w-7 h-7 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                    aria-label="Eliminar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-text-main text-sm font-semibold pr-14">{t.title}</p>
                  <p className="text-text-muted text-[11px] mt-1 line-clamp-3 leading-relaxed">{t.content}</p>
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
              <button onClick={function () { setModalOpen(false); resetForm() }} className="text-text-muted">
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

      {templateModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-lg">Nuevo texto</h2>
              <button onClick={function () { setTemplateModalOpen(false) }} className="text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              <form id="template-form" onSubmit={function (e) { e.preventDefault(); addTemplate() }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Título</label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={function (e) { setTemplateForm(function (prev) { return Object.assign({}, prev, { title: e.target.value }) }) }}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Contenido</label>
                  <textarea
                    value={templateForm.content}
                    onChange={function (e) { setTemplateForm(function (prev) { return Object.assign({}, prev, { content: e.target.value }) }) }}
                    rows={5}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-surface text-text-main text-sm resize-none"
                  />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-200 space-y-2">
              <button
                type="submit"
                form="template-form"
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium"
              >
                Guardar texto
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {copyToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {copyToast}
        </div>
      )}

      {temporadaModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-base">Temporada · {temporadaModal.nombre}</h2>
              <button onClick={function () { setTemporadaModal(null) }} className="text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-text-muted text-xs">Definí el rango de fechas que cuenta como temporada para calcular la ocupación.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Desde</label>
                  <input
                    type="date"
                    value={temporadaModal.desde}
                    onChange={function (e) { setTemporadaModal(function (prev) { return Object.assign({}, prev, { desde: e.target.value }) }) }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Hasta</label>
                  <input
                    type="date"
                    value={temporadaModal.hasta}
                    onChange={function (e) { setTemporadaModal(function (prev) { return Object.assign({}, prev, { hasta: e.target.value }) }) }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 space-y-2">
              <button
                onClick={saveTemporada}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium"
              >
                Guardar
              </button>
              {temporadas[temporadaModal.id] && (
                <button
                  onClick={function () { clearTemporada(temporadaModal.id); setTemporadaModal(null) }}
                  className="w-full h-10 rounded-xl text-red-600 text-sm font-medium hover:bg-red-50"
                >
                  Quitar temporada
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {clienteModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-lg">Nuevo Cliente</h2>
              <button onClick={function () { setClienteModalOpen(false) }} className="text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              <form id="cliente-form" onSubmit={submitCliente} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Nombre</label>
                    <input type="text" required value={clienteForm.nombre} onChange={function (e) { changeCliente('nombre', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Apellido</label>
                    <input type="text" required value={clienteForm.apellido} onChange={function (e) { changeCliente('apellido', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">DNI</label>
                  <input type="text" required value={clienteForm.dni} onChange={function (e) { changeCliente('dni', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Celular</label>
                    <input type="tel" value={clienteForm.celular} onChange={function (e) { changeCliente('celular', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Email</label>
                    <input type="email" value={clienteForm.email} onChange={function (e) { changeCliente('email', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Adultos</label>
                    <input type="number" min="0" value={clienteForm.adultos} onChange={function (e) { changeCliente('adultos', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Chicos</label>
                    <input type="number" min="0" value={clienteForm.chicos} onChange={function (e) { changeCliente('chicos', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Estado</label>
                  <select value={clienteForm.estado} onChange={function (e) { changeCliente('estado', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none">
                    <option value="prospecto">Prospecto</option>
                    <option value="activo">Activo</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={clienteForm.lleva_mascotas} onChange={function (e) { changeCliente('lleva_mascotas', e.target.checked) }} className="w-5 h-5 rounded border-slate-300 text-primary accent-primary" />
                  <span className="text-sm text-text-main">Tiene mascotas</span>
                </label>
              </form>
            </div>
            <div className="p-4 border-t border-slate-200 space-y-2">
              {clienteError && <p className="text-sm text-red-500 text-center">{clienteError}</p>}
              <button type="submit" form="cliente-form" disabled={clienteSubmitting} className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
                {clienteSubmitting ? 'Guardando…' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {gastoModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4" onClick={function (e) { if (e.target === e.currentTarget) setGastoModalOpen(false) }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-lg">Nuevo Movimiento</h2>
              <button onClick={function () { setGastoModalOpen(false) }} className="text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              <form id="gasto-form" onSubmit={submitGasto} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Tipo</label>
                  <select value={gastoTipo} onChange={function (e) { setGastoTipo(e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none">
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso (seña)</option>
                  </select>
                </div>

                {gastoTipo === 'gasto' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm text-text-muted font-medium">Inmueble</label>
                      <select value={gastoForm.inmuebleId} onChange={function (e) { changeGasto('inmuebleId', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none">
                        <option value="">Sin especificar</option>
                        {inmuebles.map(function (i) {
                          return <option key={i.id} value={i.id}>{i.nombre}</option>
                        })}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-text-muted font-medium">Concepto</label>
                      <input type="text" required value={gastoForm.concepto} onChange={function (e) { changeGasto('concepto', e.target.value) }} placeholder="Ej. Reparación termotanque" className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm" />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Alquiler</label>
                    <select required value={gastoForm.alquilerId} onChange={function (e) { changeGasto('alquilerId', e.target.value) }} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none">
                      <option value="">Seleccionar alquiler</option>
                      {alquileres.map(function (a) {
                        var c = a.clientes || {}
                        return <option key={a.id} value={a.id}>{(c.nombre || '') + ' ' + (c.apellido || '') + ' — ' + (a.inmuebles ? a.inmuebles.nombre : '')}</option>
                      })}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Monto</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={gastoForm.monto}
                    onChange={function (e) { changeGasto('monto', e.target.value.replace(/\D/g, '')) }}
                    placeholder="0"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Fecha</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={gastoForm.fecha}
                    onChange={function (e) { changeGasto('fecha', formatDateInput(e.target.value)) }}
                    placeholder="dd/mm/aa"
                    maxLength="8"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-200 space-y-2">
              {gastoError && <p className="text-sm text-red-500 text-center">{gastoError}</p>}
              <button type="submit" form="gasto-form" disabled={gastoSubmitting} className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
                {gastoSubmitting ? 'Guardando…' : (gastoTipo === 'gasto' ? 'Registrar Gasto' : 'Registrar Ingreso')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
