import { useState, useEffect } from 'react'
import { CalendarDays, DollarSign } from 'lucide-react'
import { supabase } from '../services/supabase'
import { diasEntre } from '../lib/utils'

export default function ReservasView() {
  const [inmuebles, setInmuebles] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  const [inmuebleId, setInmuebleId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [precioPorDia, setPrecioPorDia] = useState(50000)
  const [costoRecambio, setCostoRecambio] = useState(15000)

  const dias = diasEntre(fechaDesde, fechaHasta)
  const total = dias * precioPorDia + costoRecambio

  useEffect(() => {
    Promise.all([
      supabase.from('inmuebles').select('id, nombre'),
      supabase.from('clientes').select('id, nombre, apellido'),
    ]).then(([inmueblesRes, clientesRes]) => {
      if (inmueblesRes.data) setInmuebles(inmueblesRes.data)
      if (clientesRes.data) setClientes(clientesRes.data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inmuebleId || !clienteId || !fechaDesde || !fechaHasta) return

    const { error } = await supabase.from('alquileres').insert({
      inmueble_id: Number(inmuebleId),
      cliente_id: Number(clienteId),
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      precio_por_dia: precioPorDia,
      costo_recambio: costoRecambio,
      monto_total: total,
      total_senas_recibidas: 0,
    })

    if (!error) {
      setInmuebleId('')
      setClienteId('')
      setFechaDesde('')
      setFechaHasta('')
      setPrecioPorDia(50000)
      setCostoRecambio(15000)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-text-main text-xl font-bold">Nueva Reserva</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-text-muted font-medium">Inmueble</label>
          <select
            value={inmuebleId}
            onChange={(e) => setInmuebleId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
          >
            <option value="">Seleccionar inmueble</option>
            {inmuebles.map((i) => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-text-muted font-medium">Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Fecha Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Precio por Día</label>
            <input
              type="number"
              value={precioPorDia}
              onChange={(e) => setPrecioPorDia(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Costo Recambio</label>
            <input
              type="number"
              value={costoRecambio}
              onChange={(e) => setCostoRecambio(Number(e.target.value))}
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
              <span className="text-text-main">${precioPorDia.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo base ({dias} × ${precioPorDia.toLocaleString('es-AR')})</span>
              <span className="text-text-main">${(dias * precioPorDia).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo de recambio</span>
              <span className="text-text-main">${costoRecambio.toLocaleString('es-AR')}</span>
            </div>
          </div>
          <hr className="border-primary/20" />
          <div className="flex justify-between text-base font-bold text-primary">
            <span>Total</span>
            <span>${total.toLocaleString('es-AR')}</span>
          </div>
        </div>

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
