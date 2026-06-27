import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Users, PawPrint, Plus, X, MoreVertical, Archive, Trash2, UserCheck, Pencil } from 'lucide-react'
import { supabase } from '../services/supabase'

const tabs = [
  { key: 'activo', label: 'Activos' },
  { key: 'prospecto', label: 'Prospectos' },
  { key: 'archivado', label: 'Archivados' },
]

const initialForm = {
  nombre: '',
  apellido: '',
  dni: '',
  direccion: '',
  email: '',
  celular: '',
  adultos: 1,
  chicos: 0,
  observaciones: '',
  lleva_mascotas: false,
  estado: 'prospecto',
}

export default function ClientesView() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('activo')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editingCliente, setEditingCliente] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    supabase.from('clientes').select('*').then(({ data, error }) => {
      if (data) setClientes(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!menuOpenId) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpenId])

  const filtered = clientes.filter((c) => c.estado === activeTab)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      dni: form.dni,
      direccion: form.direccion,
      email: form.email,
      celular: form.celular,
      adultos: form.adultos,
      chicos: form.chicos,
      observaciones: form.observaciones,
      lleva_mascotas: form.lleva_mascotas,
      estado: form.estado,
    }

    if (editingCliente) {
      const { error } = await supabase
        .from('clientes')
        .update(payload)
        .eq('id', editingCliente.id)

      setSubmitting(false)

      if (error) {
        setErrorMsg(error.message)
        return
      }

      setClientes((prev) =>
        prev.map((c) => (c.id === editingCliente.id ? { ...c, ...payload } : c))
      )
    } else {
      const { data, error } = await supabase
        .from('clientes')
        .insert(payload)
        .select()
        .single()

      setSubmitting(false)

      if (error) {
        setErrorMsg(error.message)
        return
      }

      setClientes((prev) => [data, ...prev])
    }

    setForm(initialForm)
    setEditingCliente(null)
    setModalOpen(false)
  }

  const handleArchive = async (cliente) => {
    setErrorMsg('')
    const nuevoEstado = cliente.estado === 'archivado' ? 'activo' : 'archivado'
    const { error } = await supabase
      .from('clientes')
      .update({ estado: nuevoEstado })
      .eq('id', cliente.id)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setClientes((prev) =>
      prev.map((c) => (c.id === cliente.id ? { ...c, estado: nuevoEstado } : c))
    )
    setMenuOpenId(null)
  }

  const handleActivar = async (cliente) => {
    setErrorMsg('')
    const { error } = await supabase
      .from('clientes')
      .update({ estado: 'activo' })
      .eq('id', cliente.id)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setClientes((prev) =>
      prev.map((c) => (c.id === cliente.id ? { ...c, estado: 'activo' } : c))
    )
    setMenuOpenId(null)
  }

  const handleEdit = (cliente) => {
    setEditingCliente(cliente)
    setForm({
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      dni: cliente.dni || '',
      direccion: cliente.direccion || '',
      email: cliente.email || '',
      celular: cliente.celular || '',
      adultos: cliente.adultos ?? 1,
      chicos: cliente.chicos ?? 0,
      observaciones: cliente.observaciones || '',
      lleva_mascotas: cliente.lleva_mascotas || false,
      estado: cliente.estado || 'prospecto',
    })
    setModalOpen(true)
    setErrorMsg('')
    setMenuOpenId(null)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setErrorMsg('')

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', confirmDelete.id)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setClientes((prev) => prev.filter((c) => c.id !== confirmDelete.id))
    setConfirmDelete(null)
    setMenuOpenId(null)
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-text-muted">Cargando clientes…</p>
      </div>
    )
  }

  const emptyMsg = {
    activo: 'No hay clientes activos aún.',
    prospecto: 'No hay prospectos aún.',
    archivado: 'No hay clientes archivados.',
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-text-main text-xl font-bold">Clientes</h1>
        <button
          onClick={() => { setModalOpen(true); setErrorMsg('') }}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      <div className="flex bg-secondary rounded-xl p-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => { setActiveTab(tab.key); setErrorMsg('') }}
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

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-text-muted pt-8">{emptyMsg[activeTab]}</p>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="bg-surface rounded-xl shadow-sm p-4 space-y-3 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-main font-semibold">
                  {c.nombre} {c.apellido}
                </p>
                <p className="text-text-muted text-sm">DNI {c.dni}</p>
                {c.email && <p className="text-text-muted text-xs">{c.email}</p>}
                {c.celular && <p className="text-text-muted text-xs">{c.celular}</p>}
              </div>
              <div className="flex items-start gap-2">
                {c.lleva_mascotas && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    <PawPrint className="w-3.5 h-3.5" />
                    Con Mascota
                  </span>
                )}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpenId(menuOpenId === c.id ? null : c.id)
                    }}
                    className="text-text-muted hover:text-text-main p-1 -m-1"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {menuOpenId === c.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[150px]"
                    >
                      {c.estado === 'prospecto' && (
                        <button
                          onClick={() => handleActivar(c)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50 text-left"
                        >
                          <UserCheck className="w-4 h-4" />
                          Convertir a Activo
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(c)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-background text-left"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleArchive(c)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-background text-left"
                      >
                        <Archive className="w-4 h-4" />
                        {c.estado === 'archivado' ? 'Desarchivar' : 'Archivar'}
                      </button>
                      <button
                        onClick={() => { setConfirmDelete(c); setMenuOpenId(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4" />
                {c.adultos} Adulto{c.adultos !== 1 ? 's' : ''}, {c.chicos} Chico{c.chicos !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1">
                <PawPrint className="w-4 h-4" />
                Mascotas: {c.lleva_mascotas ? 'Sí' : 'No'}
              </span>
              {c.observaciones && (
                <span className="text-text-muted text-xs">· {c.observaciones}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal nuevo / editar cliente */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-lg">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={() => { setModalOpen(false); setEditingCliente(null); setForm(initialForm) }}
                className="text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              <form id="cliente-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Nombre</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      required
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Apellido</label>
                    <input
                      type="text"
                      value={form.apellido}
                      onChange={(e) => handleChange('apellido', e.target.value)}
                      required
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">DNI</label>
                  <input
                    type="text"
                    value={form.dni}
                    onChange={(e) => handleChange('dni', e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Dirección</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Celular</label>
                    <input
                      type="tel"
                      value={form.celular}
                      onChange={(e) => handleChange('celular', e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Observaciones</label>
                  <input
                    type="text"
                    value={form.observaciones}
                    onChange={(e) => handleChange('observaciones', e.target.value)}
                    placeholder="Notas adicionales"
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Adultos</label>
                    <input
                      type="number"
                      value={form.adultos}
                      onChange={(e) => handleChange('adultos', Number(e.target.value))}
                      min={0}
                      required
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-text-muted font-medium">Chicos</label>
                    <input
                      type="number"
                      value={form.chicos}
                      onChange={(e) => handleChange('chicos', Number(e.target.value))}
                      min={0}
                      required
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm appearance-none"
                  >
                    <option value="prospecto">Prospecto</option>
                    <option value="activo">Activo</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.lleva_mascotas}
                    onChange={(e) => handleChange('lleva_mascotas', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-primary accent-primary"
                  />
                  <span className="text-sm text-text-main">Tiene mascotas</span>
                </label>
              </form>
            </div>

            <div className="p-4 border-t border-slate-200 space-y-2">
              {errorMsg && (
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
              )}
              <button
                type="submit"
                form="cliente-form"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Guardando…' : editingCliente ? 'Guardar Cambios' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal confirmar eliminación */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-text-main font-semibold text-lg">
                ¿Eliminar a {confirmDelete.nombre} {confirmDelete.apellido}?
              </h3>
              <p className="text-sm text-text-muted">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-text-main text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
