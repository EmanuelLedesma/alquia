import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function InmueblesView() {
  const [inmuebles, setInmuebles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', texto_disponibilidad: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    supabase.from('inmuebles').select('*').then(({ data, error }) => {
      if (data) setInmuebles(data)
      setLoading(false)
    })
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const resetForm = () => {
    setForm({ nombre: '', descripcion: '', texto_disponibilidad: '' })
    setSelectedFile(null)
    setPreview(null)
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      let fotoUrl = null

      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('fotos-inmuebles')
          .upload(fileName, selectedFile)

        if (uploadError) throw new Error(uploadError.message)

        const { data: publicUrlData } = supabase.storage
          .from('fotos-inmuebles')
          .getPublicUrl(fileName)

        fotoUrl = publicUrlData.publicUrl
      }

      const { data, error: insertError } = await supabase
        .from('inmuebles')
        .insert({
          nombre: form.nombre,
          descripcion: form.descripcion,
          texto_disponibilidad: form.texto_disponibilidad,
          fotos_urls: fotoUrl ? [fotoUrl] : [],
        })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      setInmuebles((prev) => [data, ...prev])
      resetForm()
      setModalOpen(false)
    } catch (err) {
      setErrorMsg(err.message)
    }

    setSubmitting(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-main text-xl font-bold">Inmuebles</h1>
          <p className="text-text-muted text-sm">Gestioná tus propiedades</p>
        </div>
        <button
          onClick={() => { setModalOpen(true); setErrorMsg('') }}
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

      {inmuebles.length === 0 && !loading && (
        <p className="text-center text-text-muted pt-8">No hay inmuebles registrados aún.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inmuebles.map((d) => (
          <Link
            key={d.id}
            to={`/inmuebles/${d.id}`}
            className="bg-surface rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 block"
          >
            {d.fotos_urls?.[0] ? (
              <img src={d.fotos_urls[0]} alt={d.nombre} className="aspect-[4/3] w-full object-cover bg-slate-100" />
            ) : (
              <div className="aspect-[4/3] w-full bg-slate-200" />
            )}
            <div className="p-4 space-y-1.5">
              <h2 className="text-text-main font-semibold">{d.nombre}</h2>
              <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
                {d.descripcion}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-lg">Nuevo Inmueble</h2>
              <button
                onClick={() => { setModalOpen(false); resetForm() }}
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
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-surface text-text-main text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Texto de disponibilidad</label>
                  <textarea
                    value={form.texto_disponibilidad}
                    onChange={(e) => handleChange('texto_disponibilidad', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-surface text-text-main text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Foto</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 text-text-muted text-sm hover:border-primary hover:text-primary transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                      Seleccionar foto
                    </button>
                  )}
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
