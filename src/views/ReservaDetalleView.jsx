import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DollarSign, Plus, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

function d(iso) {
  if (!iso) return ''
  var p = iso.split('-')
  return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-AR')
}

export default function ReservaDetalleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reserva, setReserva] = useState(null)
  const [senas, setSenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [nuevoMonto, setNuevoMonto] = useState('')

  useEffect(() => {
    Promise.all([
      supabase
        .from('alquileres')
        .select('*, inmuebles(nombre), clientes(nombre, apellido)')
        .eq('id', id)
        .single(),
      supabase.from('senas').select('*').eq('alquiler_id', id).order('fecha'),
    ]).then(([alquilerRes, senasRes]) => {
      if (alquilerRes.data) setReserva(alquilerRes.data)
      if (senasRes.data) setSenas(senasRes.data)
      setLoading(false)
    })
  }, [id])

  const totalPagado = senas.reduce((acc, s) => acc + s.monto, 0)
  const saldoPendiente = reserva ? reserva.monto_total - totalPagado : 0

  const handleAgregarSena = async () => {
    const monto = Number(nuevoMonto)
    if (!monto || monto <= 0) return

    const { error: insertError } = await supabase.from('senas').insert({
      alquiler_id: Number(id),
      fecha: new Date().toISOString().slice(0, 10),
      monto,
    })

    if (insertError) return

    const nuevoTotal = totalPagado + monto
    await supabase.from('alquileres').update({ total_senas_recibidas: nuevoTotal }).eq('id', id)

    setSenas((prev) => [
      ...prev,
      { id: Date.now(), fecha: new Date().toISOString().slice(0, 10), monto },
    ])
    setNuevoMonto('')
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-text-muted">Cargando reserva…</p>
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="p-4">
        <p className="text-text-muted">Reserva no encontrada.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => navigate('/reservas')}
        className="inline-flex items-center gap-1 text-sm text-text-muted"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a reservas
      </button>

      <h1 className="text-text-main text-xl font-bold">Reserva #{id}</h1>

      <div className="bg-surface rounded-xl shadow-sm p-4 space-y-2">
        <h2 className="text-text-main font-semibold">Resumen</h2>
        <div className="text-sm text-text-muted space-y-1">
          <p>
            <span className="text-text-main">Cliente:</span>{' '}
            {reserva.clientes?.nombre} {reserva.clientes?.apellido}
          </p>
          <p>
            <span className="text-text-main">Inmueble:</span>{' '}
            {reserva.inmuebles?.nombre}
          </p>
          <p>
            <span className="text-text-main">Fechas:</span>{' '}
            {d(reserva.fecha_desde)} al{' '}
            {d(reserva.fecha_hasta)}
          </p>
          <p className="flex items-center gap-1 text-base font-bold text-primary pt-1">
            <DollarSign className="w-4 h-4" />
            Monto Total: ${reserva.monto_total.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div
        className={`rounded-xl p-4 text-center ${
          saldoPendiente === 0
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        <p className="text-sm font-medium">Saldo Neto Pendiente</p>
        <p className="text-2xl font-bold">${saldoPendiente.toLocaleString('es-AR')}</p>
        {saldoPendiente === 0 && <p className="text-sm">Completamente saldado</p>}
      </div>

      <div className="bg-surface rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="text-text-main font-semibold">Historial de Pagos</h2>
        {senas.length === 0 ? (
          <p className="text-sm text-text-muted">No hay señas registradas aún.</p>
        ) : (
          <ul className="space-y-2">
            {senas.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between text-sm bg-background rounded-lg px-3 py-2"
              >
                <span className="text-text-muted">
                  {d(s.fecha)}
                </span>
                <span className="text-text-main font-medium">
                  ${s.monto.toLocaleString('es-AR')}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between text-sm font-semibold text-text-main border-t border-slate-100 pt-2">
          <span>Total Pagado</span>
          <span>${totalPagado.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="text-text-main font-semibold">Nueva Seña</h2>
        <div className="flex gap-2">
          <input
            type="number"
            value={nuevoMonto}
            onChange={(e) => setNuevoMonto(e.target.value)}
            placeholder="Monto"
            className="flex-1 h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
          />
          <button
            onClick={handleAgregarSena}
            disabled={!nuevoMonto || Number(nuevoMonto) <= 0}
            className="inline-flex items-center gap-1 h-11 px-4 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
