// src/pages/Payment.jsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  getOrderByPublicId,
  uploadComprobante,
  setComprobanteOnOrder,
  getSignedComprobanteURL,
  setOrderStatus,
} from '../features/orders/orders.service.js'
import { useAuth } from '../hooks/useAuth.jsx'

import {
  Phone,
  MessageCircle,
  ArrowLeft,
  UploadCloud,
  XCircle,
  ReceiptText,
  Clock,
} from 'lucide-react'

const BANK = {
  banco: 'BBVA',
  titular: 'Empresa Funeraria Señor del Calvario S.A. de C.V.',
  cuenta: '0123456789',
  clabe: '012345678901234567',
  referencia: 'MEMORA',
}

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(n || 0))
}

function getEstadoBadge(status) {
  const s = status || ''
  const base =
    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border'

  if (s === 'PAGADO_ENTREGADO')
    return `${base} bg-green-50 text-green-700 border-green-200`
  if (s === 'PAGADO')
    return `${base} bg-blue-50 text-blue-700 border-blue-200`
  if (s === 'CANCELADO')
    return `${base} bg-red-50 text-red-700 border-red-200`
  // SIN_PAGAR u otros
  return `${base} bg-amber-50 text-amber-800 border-amber-200`
}

function getEstadoLabel(status) {
  if (!status) return ''
  return status.replaceAll('_', ' ').toLowerCase()
}

/** Timeline sencillo de estado del pedido */
function StatusTimeline({ status }) {
  if (status === 'CANCELADO') {
    return (
      <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 flex items-center gap-3 text-sm text-red-700">
        <XCircle className="w-5 h-5" />
        <div>
          <p className="font-medium">Pedido cancelado</p>
          <p className="text-xs text-red-600/80">
            Si fue un error, por favor contáctanos por teléfono o WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  const steps = [
    { key: 'CREADO', label: 'Pedido creado' },
    { key: 'PAGADO', label: 'Pago recibido' },
    { key: 'ENTREGADO', label: 'Entregado' },
  ]

  let activeIndex = 0
  if (status === 'SIN_PAGAR') activeIndex = 0
  if (status === 'PAGADO') activeIndex = 1
  if (status === 'PAGADO_ENTREGADO') activeIndex = 2

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-sm text-[#8A7A68] mb-2">
        <Clock className="w-4 h-4" />
        <span>Progreso del pedido</span>
      </div>
      <ol className="flex items-center justify-between gap-2 text-xs">
        {steps.map((step, idx) => {
          const done = idx <= activeIndex
          const isCurrent = idx === activeIndex
          return (
            <li key={step.key} className="flex-1 flex items-center">
              {/* Circle */}
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center w-full">
                  <div
                    className={[
                      'w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300',
                      done
                        ? 'bg-[#B28153] border-[#B28153] text-[#F5F2EF]'
                        : 'bg-white border-[#E3D7CC] text-[#8A7A68]',
                    ].join(' ')}
                  >
                    {done ? '✓' : idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={[
                        'h-px flex-1 mx-1 transition-all duration-300',
                        idx < activeIndex
                          ? 'bg-[#B28153]'
                          : 'bg-[#E3D7CC]',
                      ].join(' ')}
                    />
                  )}
                </div>
                <span
                  className={[
                    'mt-2 text-[11px] text-center px-1',
                    isCurrent ? 'text-[#5B3A20] font-medium' : 'text-[#8A7A68]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function Payment() {
  const [sp] = useSearchParams()
  const pid = sp.get('pid') || ''
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const { session } = useAuth()

  // estado para subir comprobante
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [signedUrl, setSignedUrl] = useState('')

  // cancelar
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    if (!pid) {
      setErr('Falta el folio del pedido.')
      setLoading(false)
      return
    }
    getOrderByPublicId(pid)
      .then(async (o) => {
        setOrder(o)
        if (o?.comprobante_url) {
          try {
            const url = await getSignedComprobanteURL(o.comprobante_url)
            setSignedUrl(url)
          } catch (_) {}
        }
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [pid])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm text-[#8A7A68]">
        Cargando información del pedido…
      </div>
    )
  }

  if (err) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm text-red-600">
        {err}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm">
        No se encontró el pedido.
      </div>
    )
  }

  const cantidad = order.cantidad ?? 1
  const precioUnit = order.precio_unitario ?? order.ataudes?.precio ?? 0
  const total = Number(precioUnit) * Number(cantidad)

  const estadoBadgeClass = getEstadoBadge(order.order_status)
  const estadoLabel = getEstadoLabel(order.order_status)

  const cancelDisabled =
    cancelLoading ||
    order.order_status === 'PAGADO' ||
    order.order_status === 'PAGADO_ENTREGADO' ||
    order.order_status === 'CANCELADO'

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return alert('Selecciona un archivo primero.')
    if (!session?.user?.id) return alert('Debes iniciar sesión.')

    try {
      setUploading(true)
      const path = await uploadComprobante(file, {
        user_id: session.user.id,
        public_id: order.public_id,
      })
      const updated = await setComprobanteOnOrder(order.id, path, 'PAGADO')
      setOrder(updated)
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

  async function handleCancel() {
    if (cancelDisabled) return
    const ok = window.confirm(
      '¿Seguro que deseas cancelar este pedido?\nEsta acción no se puede deshacer.'
    )
    if (!ok) return

    try {
      setCancelLoading(true)
      const updated = await setOrderStatus(order.id, 'CANCELADO')
      setOrder(updated)
      alert('Tu pedido ha sido cancelado.')
      navigate('/cuenta', { replace: true })
    } catch (e2) {
      console.error(e2)
      alert(e2.message || 'No se pudo cancelar el pedido.')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Encabezado */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F2EF] px-3 py-1 text-xs text-[#8A7A68] border border-[#E3D7CC]">
          <ReceiptText className="w-4 h-4" />
          <span>Pago por depósito bancario</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#5B3A20] tracking-tight">
          Detalle de pago
        </h1>
        <p className="text-sm text-[#8A7A68]">
          Folio del pedido:{' '}
          <span className="font-mono font-semibold text-[#5B3A20]">
            {order.public_id}
          </span>
        </p>
      </header>

      {/* Resumen + Timeline */}
      <section className="bg-[#F5F2EF] border border-[#E3D7CC] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 text-sm">
            <h2 className="text-lg font-semibold text-[#5B3A20]">
              Resumen del pedido
            </h2>
            <p>
              Producto:{' '}
              <span className="font-medium">
                {order.ataudes?.nombre ?? order.ataud_id}
              </span>
            </p>
            <p>
              Cantidad:{' '}
              <span className="font-medium">{cantidad}</span>
            </p>
            <p>
              Importe total:{' '}
              <span className="font-semibold text-[#5B3A20]">
                {formatMoney(total)}
              </span>{' '}
              <span className="text-xs text-[#8A7A68]">
                ({cantidad} × {formatMoney(precioUnit)})
              </span>
            </p>
            <p>
              Fecha:{' '}
              <span className="text-[#5B3A20]/80">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 text-sm">
            <span className="text-[#8A7A68] text-xs uppercase tracking-wide">
              Estado del pedido
            </span>
            <span className={estadoBadgeClass}>
              {estadoLabel || 'sin estado'}
            </span>
          </div>
        </div>

        <StatusTimeline status={order.order_status} />
      </section>

      {/* Datos bancarios */}
      <section className="border border-[#E3D7CC] rounded-3xl p-6 sm:p-7 bg-white shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-[#5B3A20] flex items-center gap-2">
          <BankIcon />
          Datos bancarios
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-[#5B3A20]">
          <div>
            <span className="text-[#8A7A68]">Banco:</span>{' '}
            <strong>{BANK.banco}</strong>
          </div>
          <div>
            <span className="text-[#8A7A68]">Titular:</span>{' '}
            <strong>{BANK.titular}</strong>
          </div>
          <div>
            <span className="text-[#8A7A68]">Cuenta:</span>{' '}
            <strong>{BANK.cuenta}</strong>
          </div>
          <div>
            <span className="text-[#8A7A68]">CLABE:</span>{' '}
            <strong>{BANK.clabe}</strong>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[#8A7A68]">Referencia:</span>{' '}
            <strong>
              {BANK.referencia} / {order.public_id}
            </strong>
          </div>
        </div>
        <p className="text-xs text-[#8A7A68] mt-2">
          Realiza tu depósito o transferencia y conserva el comprobante. Una
          vez validado, tu pedido se marcará como pagado.
        </p>
        <div className="flex flex-wrap gap-3 pt-3 text-xs text-[#8A7A68]">
          <div className="inline-flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Tel. atención: +52 772 159 86 45</span>
          </div>
        </div>
      </section>

      {/* Botones principales (WhatsApp / cuenta / cancelar) */}
      <section className="space-y-3">
        <a
          className="flex items-center justify-center gap-2 w-full text-sm rounded-full bg-[#B28153] text-[#F5F2EF] px-4 py-2.5 hover:bg-[#8C5F32] transition-all shadow-md"
          href={`https://wa.me/527721547459?text=Hola,%20te%20env%C3%ADo%20el%20comprobante%20del%20pedido%20${encodeURIComponent(
            order.public_id
          )}`}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="w-5 h-5" />
          Enviar comprobante por WhatsApp
        </a>

        <Link
          className="flex items-center justify-center gap-2 w-full text-sm rounded-full border border-[#B28153] px-4 py-2.5 text-[#5B3A20] hover:bg-[#F5F2EF] transition-all shadow-sm"
          to="/cuenta"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a mi cuenta
        </Link>

        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelDisabled}
          className="flex items-center justify-center gap-2 w-full text-sm rounded-full border border-red-300 px-4 py-2.5 text-[#B00020] bg-[#FBE9E7] hover:bg-[#F8D7DA] disabled:opacity-60 transition-all shadow-sm"
        >
          <XCircle className="w-5 h-5" />
          {cancelLoading ? 'Cancelando…' : 'Cancelar pedido'}
        </button>
      </section>

      {/* Subir comprobante */}
      <section className="border border-[#E3D7CC] rounded-3xl p-6 sm:p-7 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#5B3A20]">
              Subir comprobante de depósito
            </h2>
            <p className="text-xs text-[#8A7A68] mt-1">
              Adjunta una foto o PDF de tu comprobante. Una vez validado, tu
              pedido se marcará como pagado.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-3">
          <label className="block text-sm text-[#5B3A20]">
            Seleccionar archivo
            <div className="mt-1 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer rounded-full border border-dashed border-[#D8C4B3] bg-[#F5F2EF] px-4 py-2 text-xs text-[#5B3A20] hover:bg-[#EADDD2] transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>
                  {file ? file.name : 'Click aquí para elegir imagen o PDF'}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </label>
            </div>
          </label>

          <p className="text-[11px] text-[#8A7A68]">
            Acepta imágenes (JPG/PNG) o PDF. Tamaño recomendado &lt; 10 MB.
          </p>

          <button
            disabled={uploading || !file}
            className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[#B28153] to-[#8C5F32] text-[#F5F2EF] px-6 py-2.5 text-sm font-medium shadow-md hover:shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
          >
            <UploadCloud className="w-5 h-5" />
            {uploading ? 'Enviando…' : 'Enviar comprobante'}
          </button>
        </form>

        {order.comprobante_url && (
          <div className="text-sm mt-3 flex items-center gap-2 text-[#5B3A20]">
            <span className="text-[#8A7A68]">
              Comprobante enviado:
            </span>
            {signedUrl ? (
              <a
                href={signedUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-[#B28153] hover:text-[#8C5F32]"
              >
                Ver / descargar
              </a>
            ) : (
              <span className="italic text-[#8A7A68]">
                no disponible
              </span>
            )}
          </div>
        )}
      </section>
    </section>
  )
}

/** Ícono muy simple de "banco" sin depender de otra librería */
function BankIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#B28153]"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10.5L12 4L21 10.5V12H3V10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12V19H19V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 15V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 15V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
