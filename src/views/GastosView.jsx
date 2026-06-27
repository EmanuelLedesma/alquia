import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { supabase } from '../services/supabase'

const ingresosTotalesMock = 2000000

const tabs = [
  { key: 'cargar', label: 'Cargar Gasto' },
  { key: 'balance', label: 'Balance Anual' },
]

export default function GastosView() {
  const [activeTab, setActiveTab] = useState('cargar')
  const [gastos, setGastos] = useState([])
  const [inmuebles, setInmuebles] = useState([])
  const [loading, setLoading] = useState(true)

  const [inmuebleId, setInmuebleId] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')

  useEffect(() => {
    Promise.all([
      supabase
        .from('gastos')
        .select('*, inmuebles(nombre)')
        .order('fecha', { ascending: false }),
      supabase.from('inmuebles').select('id, nombre'),
    ]).then(([gastosRes, inmueblesRes]) => {
      if (gastosRes.data) setGastos(gastosRes.data)
      if (inmueblesRes.data) setInmuebles(inmueblesRes.data)
      setLoading(false)
    })
  }, [])

  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0)
  const resultadoFinal = ingresosTotalesMock - totalGastos

  const handleSubmit = async (e) => {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!inmuebleId || !concepto || !montoNum || !fecha) return

    const { error } = await supabase.from('gastos').insert({
      inmueble_id: Number(inmuebleId),
      concepto,
      monto: montoNum,
      fecha,
    })

    if (error) return

    setGastos((prev) => [
      { id: Date.now(), inmueble_id: Number(inmuebleId), concepto, monto: montoNum, fecha },
      ...prev,
    ])
    setInmuebleId('')
    setConcepto('')
    setMonto('')
    setFecha('')
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-text-main text-xl font-bold">Gastos</h1>

      <div className="flex bg-secondary rounded-xl p-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-text-main shadow-sm'
                : 'text-text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'cargar' && (
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
            <label className="text-sm text-text-muted font-medium">Concepto</label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej. Reparación termotanque"
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Monto</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-text-muted font-medium">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Registrar Gasto
          </button>
        </form>
      )}

      {activeTab === 'balance' && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Ingresos Totales</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${ingresosTotalesMock.toLocaleString('es-AR')}
            </p>
          </div>

          <div className="bg-surface rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">Gastos Totales</span>
            </div>
            <p className="text-2xl font-bold text-red-500">
              ${totalGastos.toLocaleString('es-AR')}
            </p>
          </div>

          <div className={`rounded-xl p-4 space-y-2 text-center border ${
            resultadoFinal >= 0
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">Resultado Final</span>
            </div>
            <p className="text-3xl font-bold">
              ${resultadoFinal.toLocaleString('es-AR')}
            </p>
          </div>

          {gastos.length > 0 && (
            <div className="bg-surface rounded-xl shadow-sm p-4 space-y-3">
              <h3 className="text-text-main font-semibold">Últimos Gastos</h3>
              <ul className="space-y-2">
                {gastos.slice(0, 20).map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center justify-between text-sm bg-background rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="text-text-main font-medium">{g.concepto}</p>
                      <p className="text-text-muted text-xs">
                        {g.inmuebles?.nombre} · {new Date(g.fecha).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <span className="text-red-500 font-medium">-${g.monto.toLocaleString('es-AR')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
