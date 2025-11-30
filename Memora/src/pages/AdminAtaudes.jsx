// src/pages/AdminAtaudes.jsx
import { useEffect, useState, useRef } from 'react'
import {
  adminListAtaudes,
  adminSaveAtaud,
  adminDeleteAtaud,
} from '../features/admin/admin.service'
import {
  uploadAtaudImage,
  slugify,
} from '../features/storage/storage.service'
import {
  Plus,
  Save,
  Image as ImageIcon,
  Trash2,
  Edit2,
  RefreshCw,
  Eye,
} from 'lucide-react'

// =========================
// Modal simple
// =========================
function Modal({ open, onClose, title = 'Confirmar', children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E3D7CC] overflow-hidden">
        <header className="px-4 py-3 border-b bg-[#F8F4F0] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#5B3A20]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-[#8A7A68] hover:text-[#5B3A20]"
          >
            Cerrar
          </button>
        </header>
        <div className="px-4 py-4 text-sm text-[#4B3B2A]">{children}</div>
      </div>
    </div>
  )
}

const emptyForm = {
  nombre: '',
  slug: '',
  precio: 0,
  stock: 0,
  material: '',
  interior: '',
  dimensiones: '',
  imagen_url: '',
}

export default function AdminAtaudes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState('')
  const fileRef = useRef(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [previewAtaud, setPreviewAtaud] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await adminListAtaudes()
      setRows(data)
    } catch (e) {
      setError(e.message || 'No se pudo cargar el catálogo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(r) {
    setEditingId(r.id)
    setForm({
      nombre: r.nombre || '',
      slug: r.slug || '',
      precio: r.precio || 0,
      stock: r.stock || 0,
      material: r.material || '',
      interior: r.interior || '',
      dimensiones: r.dimensiones || '',
      imagen_url: r.imagen_url || '',
    })
    setImgFile(null)
    setImgPreview(r.imagen_url || '')
    if (fileRef.current) fileRef.current.value = ''
    setSuccessMsg('')
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setImgFile(null)
    setImgPreview('')
    if (fileRef.current) fileRef.current.value = ''
    setSuccessMsg('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMsg('')

    try {
      const finalSlug =
        form.slug?.trim() || slugify(form.nombre || '').trim()
      let payload = { ...form, slug: finalSlug }

      if (imgFile) {
        const up = await uploadAtaudImage(imgFile, { slug: finalSlug })
        payload.imagen_url = up.publicUrl
      }

      if (editingId) payload.id = editingId

      await adminSaveAtaud(payload)
      setSuccessMsg(
        editingId ? 'Ataúd actualizado correctamente.' : 'Ataúd creado correctamente.',
      )
      resetForm()
      await load()
    } catch (e) {
      console.error(e)
      setError(e.message || 'No se pudo guardar el ataúd.')
    } finally {
      setSaving(false)
    }
  }

  function openDeleteModal(row) {
    setToDelete(row)
    setModalOpen(true)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeletingId(toDelete.id)
    try {
      await adminDeleteAtaud(toDelete.id)
      setModalOpen(false)
      setToDelete(null)
      await load()
      if (previewAtaud?.id === toDelete.id) {
        setPreviewAtaud(null)
      }
    } catch (e) {
      alert(e.message || 'No se pudo eliminar el ataúd.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#5B3A20]">
            Catálogo de ataúdes
          </h1>
          <p className="text-xs text-[#8A7A68]">
            Administra los productos que estarán disponibles para los clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-[#E3D7CC] bg-white/70 px-3 py-1.5 text-xs text-[#5B3A20] hover:bg-[#F8F4F0]"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar
        </button>
      </header>

      {/* Card de formulario */}
      <section className="rounded-2xl border border-[#E3D7CC] bg-[#F8F4F0] p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#5B3A20] flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Editar ataúd
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Nuevo ataúd
                </>
              )}
            </h2>
            <p className="text-[11px] text-[#8A7A68]">
              Completa los datos del ataúd. El slug se genera automáticamente
              si lo dejas vacío.
            </p>
          </div>

          {successMsg && (
            <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[11px] text-green-700">
              {successMsg}
            </span>
          )}
        </div>

        {error && (
          <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-2 text-sm"
        >
          {/* Nombre */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
              Nombre
            </span>
            <input
              className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              required
            />
          </label>

          {/* Slug */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
              Slug (opcional)
            </span>
            <input
              className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value }))
              }
              placeholder="se genera si se omite"
            />
          </label>

          {/* Precio */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
              Precio
            </span>
            <input
              className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
              type="number"
              step="0.01"
              value={form.precio}
              onChange={(e) =>
                setForm((f) => ({ ...f, precio: e.target.value }))
              }
              required
            />
          </label>

          {/* Stock */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
              Stock
            </span>
            <input
              className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
            />
          </label>

          {/* Material */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
              Material
            </span>
            <input
              className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
              value={form.material}
              onChange={(e) =>
                setForm((f) => ({ ...f, material: e.target.value }))
              }
            />
          </label>

          {/* Interior */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
              Interior
            </span>
            <input
              className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
              value={form.interior}
              onChange={(e) =>
                setForm((f) => ({ ...f, interior: e.target.value }))
              }
            />
          </label>

          {/* Dimensiones */}
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
              Dimensiones
            </span>
            <input
              className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
              placeholder="Ejemplo: 190cm x 60cm"
              value={form.dimensiones}
              onChange={(e) =>
                setForm((f) => ({ ...f, dimensiones: e.target.value }))
              }
            />
          </label>

          {/* Imagen URL + archivo */}
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-[1.4fr_auto] items-start">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
                Imagen URL
              </span>
              <input
                type="url"
                className="border border-[#E3D7CC] rounded-lg px-3 py-2 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
                placeholder="Se rellena automáticamente si subes archivo"
                value={form.imagen_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imagen_url: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-[#8A7A68]">
              <span className="text-[11px] uppercase tracking-wide">
                Subir imagen
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[#E3D7CC] bg-white/80 px-3 py-1.5 text-xs text-[#5B3A20] hover:bg-[#F5F2EF]"
                onClick={() => fileRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4" />
                Seleccionar archivo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setImgFile(file || null)
                  setImgPreview(file ? URL.createObjectURL(file) : '')
                }}
              />
            </label>
          </div>

          {imgPreview && (
            <div className="sm:col-span-2">
              <div className="text-xs text-[#8A7A68] mb-1">
                Previsualización
              </div>
              <div className="border border-[#E3D7CC] rounded-xl bg-white/80 p-2 flex items-center justify-center">
                <img
                  src={imgPreview}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-contain"
                />
              </div>
            </div>
          )}

          <div className="sm:col-span-2 flex flex-wrap gap-2 mt-2">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#5B3A20] text-[#F5F2EF] px-4 py-2 text-xs font-medium hover:bg-[#3F2915] disabled:opacity-60"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving
                ? 'Guardando…'
                : editingId
                ? 'Guardar cambios'
                : 'Crear ataúd'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-[#E3D7CC] bg-white/80 px-4 py-2 text-xs text-[#5B3A20] hover:bg-[#F5F2EF]"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Tabla de ataúdes */}
      <section className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-10 w-1/2 bg-gray-100 animate-pulse rounded" />
            <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
            <div className="h-10 w-2/3 bg-gray-100 animate-pulse rounded" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[#8A7A68]">
            No hay productos en el catálogo todavía.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E3D7CC] bg-white/80 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8F4F0] text-xs text-[#8A7A68] uppercase">
                <tr>
                  <Th>Nombre</Th>
                  <Th>Slug</Th>
                  <Th>Precio</Th>
                  <Th>Stock</Th>
                  <Th>Imagen</Th>
                  <Th>Actualizado</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-t hover:bg-[#FFF9F4] transition-colors ${
                      idx % 2 === 1 ? 'bg-[#FDF8F2]' : ''
                    }`}
                  >
                    <Td>
                      <div className="font-medium text-[#5B3A20]">
                        {r.nombre}
                      </div>
                      <div className="text-[11px] text-[#8A7A68]">
                        {r.material || 'Sin material definido'}
                      </div>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center rounded-full bg-[#F5F2EF] px-2 py-0.5 text-[11px] text-[#8A7A68] font-mono">
                        {r.slug || '—'}
                      </span>
                    </Td>
                    <Td>{`$${Number(r.precio || 0).toFixed(2)}`}</Td>
                    <Td>{r.stock ?? '—'}</Td>
                    <Td>
                      {r.imagen_url ? (
                        <img
                          src={r.imagen_url}
                          alt={r.nombre}
                          className="h-10 w-16 object-cover rounded-md border border-[#E3D7CC] bg-[#F5F2EF]"
                        />
                      ) : (
                        <span className="text-xs text-[#B49A83]">
                          Sin imagen
                        </span>
                      )}
                    </Td>
                    <Td>
                      {new Date(
                        r.updated_at || r.created_at,
                      ).toLocaleString()}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-[#E3D7CC] bg-white/80 px-3 py-1 text-xs text-[#5B3A20] hover:bg-[#F5F2EF]"
                          onClick={() => setPreviewAtaud(r)}
                        >
                          <Eye className="w-3 h-3" />
                          Ver ficha
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-[#E3D7CC] bg-white/80 px-3 py-1 text-xs text-[#5B3A20] hover:bg-[#F5F2EF]"
                          onClick={() => startEdit(r)}
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
                          onClick={() => openDeleteModal(r)}
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Preview card */}
        {previewAtaud && (
          <div className="mt-4 rounded-2xl border border-[#E3D7CC] bg-[#F8F4F0] p-5 shadow-sm flex flex-col md:flex-row gap-5">
            <div className="md:w-1/3 flex items-center justify-center">
              {previewAtaud.imagen_url ? (
                <img
                  src={previewAtaud.imagen_url}
                  alt={previewAtaud.nombre}
                  className="max-h-56 w-full object-contain rounded-xl border border-[#E3D7CC] bg-white"
                />
              ) : (
                <div className="h-40 w-full rounded-xl border border-dashed border-[#E3D7CC] flex items-center justify-center text-xs text-[#B49A83]">
                  Sin imagen disponible
                </div>
              )}
            </div>
            <div className="md:flex-1 space-y-3 text-sm text-[#4B3B2A]">
              <div>
                <h3 className="text-lg font-semibold text-[#5B3A20]">
                  {previewAtaud.nombre}
                </h3>
                <p className="text-[11px] text-[#8A7A68]">
                  Slug: {previewAtaud.slug || '—'}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <div>
                  <span className="block text-[11px] uppercase text-[#8A7A68]">
                    Material
                  </span>
                  <span>{previewAtaud.material || '—'}</span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase text-[#8A7A68]">
                    Interior
                  </span>
                  <span>{previewAtaud.interior || '—'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[11px] uppercase text-[#8A7A68]">
                    Dimensiones
                  </span>
                  <span>{previewAtaud.dimensiones || '—'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="inline-flex items-center rounded-full bg-[#5B3A20] text-[#F5F2EF] px-4 py-1.5 text-sm font-semibold">
                  {`$${Number(previewAtaud.precio || 0).toFixed(2)}`}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#F5F2EF] text-[#5B3A20] px-3 py-1 text-xs">
                  Stock: {previewAtaud.stock ?? '—'}
                </span>
              </div>

              <div className="text-[11px] text-[#8A7A68] pt-1">
                Actualizado:{' '}
                {new Date(
                  previewAtaud.updated_at || previewAtaud.created_at,
                ).toLocaleString()}
              </div>

              <button
                type="button"
                onClick={() => setPreviewAtaud(null)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#8A7A68] hover:text-[#5B3A20]"
              >
                Ocultar ficha
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modal de confirmación de borrado */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Eliminar ataúd"
      >
        <p className="text-sm mb-4">
          ¿Seguro que deseas eliminar{' '}
          <b>{toDelete?.nombre || 'este ataúd'}</b>? Esta acción no se puede
          deshacer.
        </p>
        <div className="flex justify-end gap-2 text-xs">
          <button
            className="rounded-full border border-[#E3D7CC] bg-white px-3 py-1 hover:bg-[#F8F4F0]"
            onClick={() => setModalOpen(false)}
          >
            Cancelar
          </button>
          <button
            className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white px-3 py-1 hover:bg-red-700 disabled:opacity-60"
            onClick={confirmDelete}
            disabled={!!deletingId}
          >
            <Trash2 className="w-3 h-3" />
            {deletingId ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="text-left px-4 py-2 font-medium align-middle whitespace-nowrap">
      {children}
    </th>
  )
}
function Td({ children }) {
  return (
    <td className="px-4 py-2 align-middle whitespace-nowrap">
      {children}
    </td>
  )
}
