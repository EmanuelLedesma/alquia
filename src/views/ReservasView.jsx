import { useState } from 'react'
import { CalendarDays, DollarSign } from 'lucide-react'
import { diasEntre } from '../lib/utils'

const inmueblesMock = [
  { id: 1, nombre: 'Dúplex A' },
  { id: 2, nombre: 'Dúplex B' },
]

const clientesMock = [
  { id: 1, nombre: 'Juan Pérez' },
  { id: 2, nombre: 'Ana Gómez' },
]

export default function ReservasView() {
  const [inmueble, setInmueble] = useState('')
  const [cliente, setCliente] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [precioPorDia, setPrecioPorDia] = useState(50000)
  const [costoRecambio, setCostoRecambio] = useState(15000)

  const dias = diasEntre(fechaDesde, fechaHasta)
  const total = dias * precioPorDia + costoRecambio

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-text-main text-xl font-bold">Nueva Reserva</h1>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-text-muted font-medium">Inmueble</label>
          <select
            value={inmueble}
            onChange={(e) => setInmueble(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
          >
            <option value="">Seleccionar inmueble</option>
            {inmueblesMock.map((i) => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-text-muted font-medium">Cliente</label>
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
          >
            <option value="">Seleccionar cliente</option>
            {clientesMock.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
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
    </div>
  )
}
