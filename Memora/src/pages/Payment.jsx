// src/pages/Payment.jsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getOrderByPublicId } from '../features/orders/orders.service.js'
import { uploadComprobante, setComprobanteOnOrder, getSignedComprobanteURL } from '../features/orders/orders.service.js'
import { useAuth } from '../hooks/useAuth.jsx'

const BANK = {
  banco: 'BBVA',
  titular: 'Juan Pérez',
  cuenta: '0123456789',
  clabe: '012345678901234567',
  referencia: 'ETHR-COFFINS'
}

function formatMoney(n) {
  const val = Number(n || 0)
  return val.toFixed(2)
}

export default function Payment() {
  const [sp] = useSearchParams()
  const pid = sp.get('pid') || ''
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const { session } = useAuth()

  // estado para subir comprobante
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [signedUrl, setSignedUrl] = useState('')

  useEffect(() => {
    if (!pid) {
      setErr('Falta el folio del pedido.')
      setLoading(false)
      return
    }
    getOrderByPublicId(pid)
      .then(async (o) => {
        setOrder(o)
        // si ya hay comprobante, firma una URL para previsualizar/descargar
        if (o?.comprobante_url) {
          try {
            const url = await getSignedComprobanteURL(o.comprobante_url)
            setSignedUrl(url)
          } catch {}
        }
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [pid])

  if (loading) return <div className="max-w-3xl mx-auto py-10">Cargando…</div>
  if (err) return <div className="max-w-3xl mx-auto py-10 text-red-600">{err}</div>
  if (!order) return <div className="max-w-3xl mx-auto py-10">No se encontró el pedido.</div>

  const cantidad = order.cantidad ?? 1
  const precioUnit = order.precio_unitario ?? order.ataudes?.precio ?? 0
  const total = Number(precioUnit) * Number(cantidad)

  // enums en mayúsculas
  const estadoLegible = String(order.order_status || '')
    .replaceAll('_', ' ')
    .trim()

  const stateClass = (() => {
    const s = order.order_status || ''
    if (s === 'PAGADO_ENTREGADO') return 'bg-green-100 text-green-700'
    if (s === 'PAGADO') return 'bg-blue-100 text-blue-700'
    return 'bg-yellow-100 text-yellow-800' // SIN_PAGAR
  })()

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return alert('Selecciona un archivo primero.')
    if (!session?.user?.id) return alert('Debes iniciar sesión.')

    try {
      setUploading(true)
      // sube
      const path = await uploadComprobante(file, {
        user_id: session.user.id,
        public_id: order.public_id
      })
      // guarda en la orden (y marca PAGADO)
      const updated = await setComprobanteOnOrder(order.id, path, 'PAGADO')
      setOrder(updated)
      // generar URL firmada para ver/descargar
      const url = await getSignedComprobanteURL(path)
      setSignedUrl(url)
      setFile(null)
      alert('Comprobante enviado. ¡Gracias!')
    } catch (e2) {
      console.error(e2)
      alert(e2.message || 'No se pudo subir el comprobante.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-semibold">Pago por Depósito</h1>
      <p className="text-sm text-gray-600">
        Folio: <strong>{order.public_id}</strong>
      </p>

      <section className="border rounded p-5">
        <h2 className="text-xl font-semibold mb-3">Resumen del pedido</h2>
        <ul className="text-sm space-y-1">
          <li>Producto: <strong>{order.ataudes?.nombre ?? order.ataud_id}</strong></li>
          <li>Cantidad: <strong>{cantidad}</strong></li>
          <li>
            Importe: <strong>${formatMoney(total)}</strong>{' '}
            <span className="text-gray-500">({cantidad} × ${formatMoney(precioUnit)})</span>
          </li>
          <li>
            Estado actual:{' '}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${stateClass}`}>
              {estadoLegible}
            </span>
          </li>
          <li>Fecha: {new Date(order.created_at).toLocaleString()}</li>
        </ul>
      </section>

      <section className="border rounded p-5">
        <h2 className="text-xl font-semibold mb-3">Datos bancarios</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Banco:</span> <strong>{BANK.banco}</strong></div>
          <div><span className="text-gray-500">Titular:</span> <strong>{BANK.titular}</strong></div>
          <div><span className="text-gray-500">Cuenta:</span> <strong>{BANK.cuenta}</strong></div>
          <div><span className="text-gray-500">CLABE:</span> <strong>{BANK.clabe}</strong></div>
          <div className="sm:col-span-2">
            <span className="text-gray-500">Referencia:</span>{' '}
            <strong>{BANK.referencia} / {order.public_id}</strong>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Usa tu <strong>folio</strong> como referencia. Después del depósito, envíanos el comprobante.
        </p>
      </section>

      {/* Subir comprobante */}
      <section className="border rounded p-5 space-y-3">
        <h2 className="text-xl font-semibold">Subir comprobante</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          <div className="text-xs text-gray-500">
            Acepta imágenes (JPG/PNG/… ) o PDF. Tamaño razonable &lt; 10 MB.
          </div>
          <button
            disabled={uploading || !file}
            className="bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {uploading ? 'Enviando…' : 'Enviar comprobante'}
          </button>
        </form>

        {order.comprobante_url && (
          <div className="text-sm mt-2">
            <span className="text-gray-600">Comprobante enviado:</span>{' '}
            {signedUrl ? (
              <a href={signedUrl} target="_blank" rel="noreferrer" className="underline text-blue-600">
                Ver/descargar
              </a>
            ) : (
              <span className="italic">no disponible</span>
            )}
          </div>
        )}
      </section>

      <div className="flex gap-3 text-sm">
        <a
          className="bg-green-600 text-white px-4 py-2 rounded"
          href={`https://wa.me/52XXXXXXXXXX?text=Comprobante%20del%20pedido%20${encodeURIComponent(order.public_id)}`}
          target="_blank"
          rel="noreferrer"
        >
          Enviar por WhatsApp
        </a>
        <Link className="underline text-gray-700" to="/cuenta">Volver a mi cuenta</Link>
      </div>
    </div>
  )
}
