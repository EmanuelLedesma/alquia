import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X, Copy, Trash2, Plus } from 'lucide-react'
import { supabase } from '../services/supabase'
import YearGallery from '../components/calendar/YearGallery'

export default function InmuebleDetalleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inmueble, setInmueble] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem(`templates-${id}`)
    return saved ? JSON.parse(saved) : []
  })
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templateForm, setTemplateForm] = useState({ title: '', content: '' })
  const [templateSubmitting, setTemplateSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (id) {
      localStorage.setItem(`templates-${id}`, JSON.stringify(templates))
    }
  }, [templates, id])

  useEffect(() => {
    supabase
      .from('inmuebles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (data) setInmueble(data)
        setLoading(false)
      })
  }, [id])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    uploadPhoto(file)
  }

  const uploadPhoto = async (file) => {
    setUploading(true)
    setErrorMsg('')

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('fotos-inmuebles')
        .upload(fileName, file)

      if (uploadError) throw new Error(uploadError.message)

      const { data: publicUrlData } = supabase.storage
        .from('fotos-inmuebles')
        .getPublicUrl(fileName)

      const newUrl = publicUrlData.publicUrl

      const { error: updateError } = await supabase
        .from('inmuebles')
        .update({ fotos_urls: [newUrl] })
        .eq('id', id)

      if (updateError) throw new Error(updateError.message)

      setInmueble((prev) => ({ ...prev, fotos_urls: [newUrl] }))
      setPreview(null)
      setSelectedFile(null)
    } catch (err) {
      setErrorMsg(err.message)
    }

    setUploading(false)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleAddTemplate = async (e) => {
    e.preventDefault()
    setTemplateSubmitting(true)
    const newTemplate = {
      id: Date.now(),
      title: templateForm.title,
      content: templateForm.content,
    }
    setTemplates((prev) => [newTemplate, ...prev])
    setTemplateForm({ title: '', content: '' })
    setTemplateModalOpen(false)
    setTemplateSubmitting(false)
  }

  const handleCopyTemplate = (content) => {
    navigator.clipboard.writeText(content).then(() => showToast('¡Copiado!'))
  }

  const handleDeleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-text-muted">Cargando…</p>
      </div>
    )
  }

  if (!inmueble) {
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <p className="text-text-muted">Inmueble no encontrado.</p>
      </div>
    )
  }

  const currentPhoto = preview || inmueble.fotos_urls?.[0]

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="relative">
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={inmueble.nombre}
            className="aspect-[4/3] w-full object-cover rounded-xl bg-slate-100"
          />
        ) : (
          <div className="aspect-[4/3] w-full bg-slate-200 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-slate-400" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-3 right-3 h-10 px-4 rounded-xl bg-black/60 text-white text-sm font-medium backdrop-blur-sm disabled:opacity-50"
        >
          {uploading ? 'Subiendo…' : 'Cambiar foto'}
        </button>

        {preview && (
          <button
            onClick={() => { setPreview(null); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
            className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-3">
        <h1 className="text-text-main text-xl font-bold">{inmueble.nombre}</h1>

        {inmueble.descripcion && (
          <p className="text-text-muted leading-relaxed">{inmueble.descripcion}</p>
        )}

        {inmueble.texto_disponibilidad && (
          <div className="bg-secondary rounded-xl p-4">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
              Disponibilidad
            </p>
            <p className="text-text-main text-sm whitespace-pre-line">
              {inmueble.texto_disponibilidad}
            </p>
          </div>
        )}
      </div>

      <YearGallery inmuebleId={Number(id)} compact />

      {/* Textos Pre-armados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-text-main font-semibold">Textos Pre-armados</h2>
          <button
            onClick={() => { setTemplateModalOpen(true); setTemplateForm({ title: '', content: '' }) }}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary text-white text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Texto
          </button>
        </div>

        {templates.length === 0 && (
          <p className="text-text-muted text-sm">No hay textos guardados para este inmueble.</p>
        )}

        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="bg-surface rounded-xl shadow-sm p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-text-main font-semibold text-sm">{t.title}</p>
                <button
                  onClick={() => handleDeleteTemplate(t.id)}
                  className="text-red-400 hover:text-red-600 p-0.5 -m-0.5 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-text-muted text-sm whitespace-pre-line">{t.content}</p>
              <button
                onClick={() => handleCopyTemplate(t.content)}
                className="inline-flex items-center gap-1.5 text-primary text-xs font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Modal nuevo texto */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-text-main font-semibold text-lg">Nuevo Texto</h2>
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="text-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              <form id="template-form" onSubmit={handleAddTemplate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Título</label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-surface text-text-main text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-text-muted font-medium">Contenido</label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={4}
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
                disabled={templateSubmitting}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {templateSubmitting ? 'Guardando…' : 'Guardar Texto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
