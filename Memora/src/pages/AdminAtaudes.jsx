// src/pages/AdminAtaudes.jsx
import { useEffect, useState, useRef } from 'react'
import { adminListAtaudes, adminSaveAtaud, adminDeleteAtaud } from '../features/admin/admin.service'
import { uploadAtaudImage, slugify } from '../features/storage/storage.service'

// Modal simple
function Modal({ open, onClose, children, title = 'Confirmar' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="border-b px-4 py-3 font-semibold">{title}</div>
        <div className="px-4 py-4">{children}</div>
        <div className="border-t px-4 py-3 flex justify-end gap-2">
          <button className="border rounded px-3 py-1.5" onClick={onClose}>Cancelar</button>
          {/* El confirm lo define el contenido */}
        </div>
      </div>
    </div>
  )
}

const emptyForm = {
  nombre: '', slug: '', precio: 0, stock: 0,
  material: '', interior: '', dimensiones: '', imagen_url: ''
}

export default function AdminAtaudes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const fileRef = useRef(null)

  async function load() {
    setLoading(true)
    try { setRows(await adminListAtaudes()) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(r) {
    setEditingId(r.id)
    setForm({
      nombre: r.nombre || '', slug: r.slug || '', precio: r.precio || 0,
      stock: r.stock || 0, material: r.material || '', interior: r.interior || '',
      dimensiones: r.dimensiones || '', imagen_url: r.imagen_url || ''
    })
    setImgFile(null)
    setImgPreview(r.imagen_url || '')
    fileRef.current?.value && (fileRef.current.value = '')
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setImgFile(null)
    setImgPreview('')
    fileRef.current?.value && (fileRef.current.value = '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // slug autogenerado si falta
    const finalSlug = form.slug?.trim() || slugify(form.nombre)
    let payload = { ...form, slug: finalSlug }

    // Si subimos imagen, primero upload y pegamos la URL al payload
    if (imgFile) {
      const up = await uploadAtaudImage(imgFile, { slug: finalSlug })
      payload.imagen_url = up.publicUrl
    }

    if (editingId) payload.id = editingId

    await adminSaveAtaud(payload)
    resetForm()
    await load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ataúdes</h1>

      <form onSubmit={handleSubmit} className="border rounded p-4 grid sm:grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Nombre"
          value={form.nombre}
          onChange={e=>setForm(f=>({...f, nombre:e.target.value}))}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Slug (opcional, se genera si se omite)"
          value={form.slug}
          onChange={e=>setForm(f=>({...f, slug:e.target.value}))}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Precio"
          type="number" step="0.01"
          value={form.precio}
          onChange={e=>setForm(f=>({...f, precio:e.target.value}))}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={e=>setForm(f=>({...f, stock:e.target.value}))}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Material"
          value={form.material}
          onChange={e=>setForm(f=>({...f, material:e.target.value}))}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Interior"
          value={form.interior}
          onChange={e=>setForm(f=>({...f, interior:e.target.value}))}
        />
        <input
          className="border rounded px-3 py-2 sm:col-span-2"
          placeholder="Dimensiones"
          value={form.dimensiones}
          onChange={e=>setForm(f=>({...f, dimensiones:e.target.value}))}
        />

        {/* Imagen */}
        <div className="sm:col-span-2 grid sm:grid-cols-[1fr_auto] gap-3 items-start">
          <input
            type="url"
            className="border rounded px-3 py-2"
            placeholder="Imagen URL (opcional, se rellena si subes archivo)"
            value={form.imagen_url}
            onChange={e=>setForm(f=>({...f, imagen_url: e.target.value}))}
          />
          <label className="block">
            <span className="text-xs text-gray-500">Subir imagen</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="block"
              onChange={(e)=>{
                const file = e.target.files?.[0]
                setImgFile(file || null)
                setImgPreview(file ? URL.createObjectURL(file) : '')
              }}
            />
          </label>
        </div>

        {imgPreview && (
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Preview</div>
            <img src={imgPreview} alt="Preview" className="max-h-40 rounded-md border" />
          </div>
        )}

        <div className="sm:col-span-2 flex gap-2">
          <button className="bg-slate-900 text-white px-4 py-2 rounded">
            {editingId ? 'Guardar cambios' : 'Crear'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Cargando…</p>
      ) : rows.length === 0 ? (
        <p>No hay productos.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Nombre</Th><Th>Precio</Th><Th>Stock</Th><Th>Imagen</Th><Th>Actualizado</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <Td>{r.nombre}</Td>
                  <Td>${Number(r.precio || 0).toFixed(2)}</Td>
                  <Td>{r.stock ?? '—'}</Td>
                  <Td>{r.imagen_url ? <img src={r.imagen_url} alt="" className="h-10 rounded"/> : '—'}</Td>
                  <Td>{new Date(r.updated_at || r.created_at).toLocaleString()}</Td>
                  <Td className="flex gap-2 py-2">
                    <button className="border px-3 py-1 rounded" onClick={()=>startEdit(r)}>Editar</button>
                    <button
                      className="border px-3 py-1 rounded text-red-600"
                      onClick={()=>{ setToDelete(r); setModalOpen(true) }}
                    >
                      Eliminar
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title="Eliminar ataúd">
        <p className="text-sm">
          ¿Seguro que deseas eliminar <b>{toDelete?.nombre}</b>? Esta acción no se puede deshacer.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="border rounded px-3 py-1.5" onClick={()=>setModalOpen(false)}>Cancelar</button>
          <button
            className="bg-red-600 text-white rounded px-3 py-1.5"
            onClick={async ()=>{
              await adminDeleteAtaud(toDelete.id)
              setModalOpen(false); setToDelete(null)
              await load()
            }}
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}

function Th({children}){ return <th className="text-left px-4 py-2">{children}</th> }
function Td({children}){ return <td className="px-4 py-2">{children}</td> }
