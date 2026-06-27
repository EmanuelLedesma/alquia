import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react'
import { supabase } from '../services/supabase'

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
            className="w-full h-64 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-64 bg-slate-300 rounded-xl flex items-center justify-center">
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
    </div>
  )
}
