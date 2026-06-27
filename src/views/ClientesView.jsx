import { useState } from 'react'
import { Users, PawPrint } from 'lucide-react'

const clientes = [
  {
    id: 1,
    nombre: 'María',
    apellido: 'González',
    dni: '30.123.456',
    estado: 'activo',
    adultos: 2,
    chicos: 1,
    mascotas: true,
  },
  {
    id: 2,
    nombre: 'Carlos',
    apellido: 'López',
    dni: '28.987.654',
    estado: 'activo',
    adultos: 2,
    chicos: 0,
    mascotas: false,
  },
  {
    id: 3,
    nombre: 'Ana',
    apellido: 'Martínez',
    dni: '32.456.789',
    estado: 'prospecto',
    adultos: 1,
    chicos: 2,
    mascotas: true,
  },
  {
    id: 4,
    nombre: 'Pedro',
    apellido: 'Ramírez',
    dni: '34.567.890',
    estado: 'prospecto',
    adultos: 2,
    chicos: 3,
    mascotas: false,
  },
]

const tabs = [
  { key: 'activo', label: 'Activos' },
  { key: 'prospecto', label: 'Prospectos' },
]

export default function ClientesView() {
  const [activeTab, setActiveTab] = useState('activo')

  const filtered = clientes.filter((c) => c.estado === activeTab)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-text-main text-xl font-bold">Clientes</h1>

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

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-surface rounded-xl shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-main font-semibold">
                  {c.nombre} {c.apellido}
                </p>
                <p className="text-text-muted text-sm">DNI {c.dni}</p>
              </div>
              {c.mascotas && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                  <PawPrint className="w-3.5 h-3.5" />
                  Con Mascota
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4" />
                {c.adultos} Adulto{c.adultos !== 1 ? 's' : ''}, {c.chicos} Chico{c.chicos !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1">
                <PawPrint className="w-4 h-4" />
                Mascotas: {c.mascotas ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-text-muted pt-8">
            No hay {activeTab === 'activo' ? 'clientes activos' : 'prospectos'} aún.
          </p>
        )}
      </div>
    </div>
  )
}
