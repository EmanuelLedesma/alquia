import { useState } from 'react'
import { Copy } from 'lucide-react'

const duplexes = [
  {
    id: 1,
    nombre: 'Dúplex A',
    descripcion: 'Dúplex en primera línea de costa con vista al mar, dos dormitorios y capacidad para 4 personas.',
    disponibilidad: '¡Hola! Te confirmo que el Dúplex A está disponible para las fechas solicitadas. El precio es de $XXX por noche. Quedo atenta a tu consulta.',
  },
  {
    id: 2,
    nombre: 'Dúplex B',
    descripcion: 'Amplio dúplex con patio privado, parrillero y cocina completa. Ideal para familias de hasta 5 personas.',
    disponibilidad: '¡Hola! Te confirmo que el Dúplex B está disponible para las fechas solicitadas. El precio es de $XXX por noche. Quedo atenta a tu consulta.',
  },
]

export default function InmueblesView() {
  const [copiedId, setCopiedId] = useState(null)

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback silencioso si no hay permisos de clipboard
    }
  }

  return (
    <div className="p-4 space-y-4">
      {duplexes.map((d) => (
        <div key={d.id} className="bg-surface rounded-xl shadow-sm overflow-hidden">
          <div className="aspect-video bg-slate-200" />
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
