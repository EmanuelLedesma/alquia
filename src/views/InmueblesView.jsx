import { useState, useEffect } from 'react'
import { Copy } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function InmueblesView() {
  const [inmuebles, setInmuebles] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    supabase.from('inmuebles').select('*').then(({ data, error }) => {
      if (data) setInmuebles(data)
      setLoading(false)
    })
  }, [])

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-text-muted">Cargando inmuebles…</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {inmuebles.length === 0 && (
        <p className="text-center text-text-muted pt-8">No hay inmuebles registrados aún.</p>
      )}
      {inmuebles.map((d) => (
        <div key={d.id} className="bg-surface rounded-xl shadow-sm overflow-hidden">
          {d.fotos_urls?.[0] ? (
            <img src={d.fotos_urls[0]} alt={d.nombre} className="aspect-video w-full object-cover" />
          ) : (
            <div className="aspect-video bg-slate-200" />
          )}
          <div className="p-4 space-y-2">
            <h2 className="text-text-main text-lg font-semibold">{d.nombre}</h2>
            <p className="text-text-muted text-sm leading-relaxed">{d.descripcion}</p>
            <button
              onClick={() => handleCopy(d.disponibilidad, d.id)}
              className="inline-flex items-center gap-2 mt-1 text-primary text-sm font-medium"
            >
              <Copy className="w-4 h-4" />
              {copiedId === d.id ? '¡Copiado!' : 'Copiar Disponibilidad'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
