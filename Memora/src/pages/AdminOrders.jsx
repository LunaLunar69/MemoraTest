// src/pages/AdminOrders.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  getAdminOrders,
  setOrderStatus,
  getSignedComprobanteURL,
} from '../features/orders/orders.service.js'
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
  X,
  CheckCircle2,
  Ban,
} from 'lucide-react'

/* =========================
   Constantes / utilidades
   ========================= */
const STATUS = ['SIN_PAGAR', 'PAGADO', 'PAGADO_ENTREGADO', 'CANCELADO']
const PAGE_SIZE = 25

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number(n || 0),
  )

const stateBadgeClass = (s) => {
  if (s === 'PAGADO_ENTREGADO')
    return 'bg-green-100 text-green-700 border-green-200'
  if (s === 'PAGADO') return 'bg-blue-100 text-blue-700 border-blue-200'
  if (s === 'CANCELADO') return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-yellow-100 text-yellow-800 border-yellow-200' // SIN_PAGAR
}

// total por fila
function getRowTotal(r) {
  const cantidad = r.cantidad ?? 1
  const precio = r.precio_unitario ?? r.ataudes?.precio ?? 0
  return Number(precio) * Number(cantidad)
}

// debounce simple
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export default function AdminOrders() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // '' = Todos
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 450)

  const [page, setPage] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // filtros avanzados
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [minTotal, setMinTotal] = useState('')
  const [maxTotal, setMaxTotal] = useState('')

  // ordenamiento
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  // modal de detalle + comprobante
  const [detailOrder, setDetailOrder] = useState(null)
  const [detailUrl, setDetailUrl] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  // diálogo de confirmación de estado
  const [confirmState, setConfirmState] = useState({
    open: false,
    orderId: null,
    newStatus: '',
    previousStatus: '',
  })

  /* =========================
     Carga de datos
     ========================= */
  useEffect(() => {
    setLoading(true)
    setErr('')
    getAdminOrders({
      status: statusFilter || null,
      search: debouncedSearch.trim(),
      limit: PAGE_SIZE,
      from: page * PAGE_SIZE,
    })
      .then(setRows)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [statusFilter, debouncedSearch, page, refreshKey])

  /* =========================
     Helpers
     ========================= */

  function copyFolio(folio) {
    navigator.clipboard?.writeText(folio).catch(() => {
      alert('No se pudo copiar el folio')
    })
  }

  function handleAskStatusChange(order, newStatus) {
    if (!newStatus || newStatus === order.order_status) return
    // Para estados "sensibles" pedimos confirmación
    if (newStatus === 'CANCELADO' || newStatus === 'PAGADO_ENTREGADO') {
      setConfirmState({
        open: true,
        orderId: order.id,
        newStatus,
        previousStatus: order.order_status,
      })
    } else {
      // cambios normales (por ejemplo SIN_PAGAR -> PAGADO)
      handleStatusChange(order.id, newStatus)
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      // Optimista
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, order_status: newStatus } : r)),
      )
      const updated = await setOrderStatus(id, newStatus)
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (e) {
      alert(e.message || 'No se pudo actualizar el estado.')
      setRefreshKey((x) => x + 1)
    }
  }

  function handleConfirmStatus() {
    if (!confirmState.orderId || !confirmState.newStatus) {
      setConfirmState({ open: false, orderId: null, newStatus: '', previousStatus: '' })
      return
    }
    handleStatusChange(confirmState.orderId, confirmState.newStatus)
    setConfirmState({ open: false, orderId: null, newStatus: '', previousStatus: '' })
  }

  function handleCancelConfirm() {
    setConfirmState({ open: false, orderId: null, newStatus: '', previousStatus: '' })
  }

  function handleSort(col) {
    setSortBy((prevCol) => {
      if (prevCol === col) {
        setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'))
        return prevCol
      }
      setSortDir('asc')
      return col
    })
  }

  async function openDetail(order) {
    setDetailOrder(order)
    setDetailUrl('')
    setDetailError('')
    if (!order.comprobante_url) return

    try {
      setDetailLoading(true)
      const url = await getSignedComprobanteURL(order.comprobante_url, 60 * 10)
      setDetailUrl(url)
    } catch (e) {
      setDetailError(e.message || 'No se pudo cargar el comprobante.')
    } finally {
      setDetailLoading(false)
    }
  }

  function closeDetail() {
    setDetailOrder(null)
    setDetailUrl('')
    setDetailError('')
    setDetailLoading(false)
  }

  /* =========================
     Procesamiento de filas
     ========================= */

  const processedRows = useMemo(() => {
    let list = [...rows]

    // filtros avanzados
    if (fromDate) {
      const from = new Date(fromDate)
      list = list.filter((r) => new Date(r.created_at) >= from)
    }
    if (toDate) {
      const to = new Date(toDate)
      // sumar 1 día para incluir el día "to"
      to.setDate(to.getDate() + 1)
      list = list.filter((r) => new Date(r.created_at) < to)
    }
    if (minTotal) {
      const m = Number(minTotal)
      if (!Number.isNaN(m)) {
        list = list.filter((r) => getRowTotal(r) >= m)
      }
    }
    if (maxTotal) {
      const m = Number(maxTotal)
      if (!Number.isNaN(m)) {
        list = list.filter((r) => getRowTotal(r) <= m)
      }
    }

    // ordenamiento
    list.sort((a, b) => {
      let av
      let bv

      switch (sortBy) {
        case 'folio':
          av = a.public_id
          bv = b.public_id
          break
        case 'cliente':
          av = a.profiles?.nombre_completo || a.user_id || ''
          bv = b.profiles?.nombre_completo || b.user_id || ''
          break
        case 'producto':
          av = a.ataudes?.nombre || ''
          bv = b.ataudes?.nombre || ''
          break
        case 'total':
          av = getRowTotal(a)
          bv = getRowTotal(b)
          break
        case 'estado':
          av = a.order_status || ''
          bv = b.order_status || ''
          break
        case 'created_at':
        default:
          av = new Date(a.created_at).getTime()
          bv = new Date(b.created_at).getTime()
          break
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [rows, fromDate, toDate, minTotal, maxTotal, sortBy, sortDir])

  const totalRows = processedRows.length

  /* =========================
     Render
     ========================= */

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Filtros principales */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#5B3A20]">Pedidos</h1>
          <p className="text-xs text-[#8A7A68]">
            Administra pagos, estados y comprobantes de los pedidos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-[#B49A83] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Buscar por folio o cliente…"
              value={search}
              onChange={(e) => {
                setPage(0)
                setSearch(e.target.value)
              }}
              className="pl-7 pr-3 py-2 text-sm rounded-full border border-[#E3D7CC] bg-white/60 focus:outline-none focus:ring-1 focus:ring-[#B28153]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#B49A83]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(0)
                setStatusFilter(e.target.value)
              }}
              className="text-sm rounded-full border border-[#E3D7CC] bg-white/60 px-3 py-2"
            >
              <option value="">Todos</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>

            <button
              className="inline-flex items-center gap-1 text-sm rounded-full border border-[#E3D7CC] bg-white/60 px-3 py-2 hover:bg-[#F5F2EF]"
              onClick={() => setRefreshKey((x) => x + 1)}
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
          </div>
        </div>
      </header>

      {/* Filtros avanzados */}
      <section className="rounded-2xl border border-[#E3D7CC] bg-[#F8F4F0] px-4 py-3 text-xs text-[#8A7A68] space-y-3">
        <div className="flex items-center gap-2 font-medium text-[11px] uppercase tracking-wide">
          <Filter className="w-3 h-3" />
          Filtros avanzados
        </div>
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
          <div>
            <div className="mb-1">Desde</div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-[#E3D7CC] bg-white/70 px-2 py-1.5 text-xs"
            />
          </div>
          <div>
            <div className="mb-1">Hasta</div>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-[#E3D7CC] bg-white/70 px-2 py-1.5 text-xs"
            />
          </div>
          <div>
            <div className="mb-1">Monto mínimo</div>
            <input
              type="number"
              min="0"
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              className="w-full rounded-lg border border-[#E3D7CC] bg-white/70 px-2 py-1.5 text-xs"
            />
          </div>
          <div>
            <div className="mb-1">Monto máximo</div>
            <input
              type="number"
              min="0"
              value={maxTotal}
              onChange={(e) => setMaxTotal(e.target.value)}
              className="w-full rounded-lg border border-[#E3D7CC] bg-white/70 px-2 py-1.5 text-xs"
            />
          </div>
        </div>
      </section>

      {/* Estado de carga / error */}
      {loading && (
        <div className="space-y-2">
          <div className="h-10 w-2/3 bg-gray-100 animate-pulse rounded" />
          <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
          <div className="h-10 w-5/6 bg-gray-100 animate-pulse rounded" />
        </div>
      )}
      {err && <p className="text-red-600">{err}</p>}

      {/* Vacío */}
      {!loading && !processedRows.length && (
        <p className="text-gray-600">
          No hay pedidos para los filtros actuales.
        </p>
      )}

      {/* Tabla */}
      {!!processedRows.length && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[#E3D7CC] bg-white/80 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8F4F0] text-xs text-[#8A7A68] uppercase">
                <tr>
                  {[
                    { key: 'folio', label: 'Folio' },
                    { key: 'cliente', label: 'Cliente' },
                    { key: 'producto', label: 'Producto' },
                    { key: 'cantidad', label: 'Cant' },
                    { key: 'total', label: 'Importe' },
                    { key: 'estado', label: 'Estado' },
                    { key: 'comprobante', label: 'Detalle' },
                    { key: 'created_at', label: 'Creado' },
                    { key: 'acciones', label: '' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2 text-left align-middle"
                    >
                      {['acciones', 'cantidad', 'comprobante'].includes(
                        col.key,
                      ) ? (
                        col.label
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={() => handleSort(col.key)}
                        >
                          <span>{col.label}</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedRows.map((r) => {
                  const cantidad = r.cantidad ?? 1
                  const total = getRowTotal(r)
                  const cliente =
                    r.profiles?.nombre_completo ||
                    (r.user_id?.slice(0, 8) ?? '—')
                  const prod = r.ataudes?.nombre ?? r.ataud_id

                  return (
                    <tr key={r.id} className="border-t hover:bg-[#FFF9F4]">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetail(r)}
                            className="font-mono text-[13px] underline decoration-dotted underline-offset-2 text-[#5B3A20]"
                            title="Ver detalle del pedido"
                          >
                            {r.public_id}
                          </button>
                          <button
                            onClick={() => copyFolio(r.public_id)}
                            className="text-[11px] text-[#8A7A68] hover:text-[#5B3A20]"
                            title="Copiar folio"
                          >
                            copiar
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">{cliente}</td>
                      <td className="px-3 py-2">{prod}</td>
                      <td className="px-3 py-2">{cantidad}</td>
                      <td className="px-3 py-2 font-medium">
                        {money(total)}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`border px-2 py-0.5 rounded-full text-xs ${stateBadgeClass(
                              r.order_status,
                            )}`}
                            title={r.order_status}
                          >
                            {r.order_status.replaceAll('_', ' ')}
                          </span>
                          <select
                            value={r.order_status}
                            onChange={(e) =>
                              handleAskStatusChange(r, e.target.value)
                            }
                            className="border border-[#E3D7CC] rounded-full px-2 py-1 text-xs bg-white/80"
                            title="Cambiar estado"
                          >
                            {STATUS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <button
                          onClick={() => openDetail(r)}
                          className="inline-flex items-center gap-1 text-xs text-[#5B3A20] hover:text-[#3F2915]"
                        >
                          <FileText className="w-4 h-4" />
                          Ver detalle
                        </button>
                      </td>

                      <td className="px-3 py-2">
                        {new Date(r.created_at).toLocaleString()}
                      </td>

                      <td className="px-3 py-2">
                        {r.comprobante_url &&
                          r.order_status === 'SIN_PAGAR' && (
                            <button
                              className="text-xs inline-flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-full"
                              onClick={() =>
                                handleAskStatusChange(r, 'PAGADO')
                              }
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Marcar PAGADO
                            </button>
                          )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    className="px-3 py-2 text-xs text-gray-500"
                    colSpan={9}
                  >
                    Mostrando {totalRows} pedido(s) en esta página
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between pt-3 text-xs text-[#8A7A68]">
            <div>Pagina {page + 1}</div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1 rounded-full border border-[#E3D7CC] px-3 py-1 disabled:opacity-50 bg-white/70"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-3 h-3" />
                Anterior
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-full border border-[#E3D7CC] px-3 py-1 disabled:opacity-50 bg-white/70"
                onClick={() => setPage((p) => p + 1)}
                disabled={rows.length < PAGE_SIZE}
              >
                Siguiente
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalle + comprobante */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-[#E3D7CC] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-[#F8F4F0]">
              <div>
                <div className="text-xs text-[#8A7A68] uppercase tracking-wide">
                  Pedido
                </div>
                <div className="font-mono text-sm text-[#5B3A20]">
                  {detailOrder.public_id}
                </div>
              </div>
              <button
                onClick={closeDetail}
                className="p-1 rounded-full hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-5 px-5 py-4 md:grid-cols-[1.2fr_1fr]">
              {/* Resumen + historial */}
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="text-sm font-semibold text-[#5B3A20]">
                    Resumen
                  </h3>
                  <div className="mt-2 space-y-1 text-[#4B3B2A]">
                    <div>
                      Cliente:{' '}
                      <strong>
                        {detailOrder.profiles?.nombre_completo ||
                          detailOrder.user_id?.slice(0, 8) ||
                          '—'}
                      </strong>
                    </div>
                    <div>
                      Producto:{' '}
                      <strong>
                        {detailOrder.ataudes?.nombre || detailOrder.ataud_id}
                      </strong>
                    </div>
                    <div>
                      Cantidad:{' '}
                      <strong>{detailOrder.cantidad ?? 1}</strong>
                    </div>
                    <div>
                      Importe:{' '}
                      <strong>{money(getRowTotal(detailOrder))}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      Estado:{' '}
                      <span
                        className={`border px-2 py-0.5 rounded-full text-xs ${stateBadgeClass(
                          detailOrder.order_status,
                        )}`}
                      >
                        {detailOrder.order_status.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <div>
                      Creado:{' '}
                      {new Date(
                        detailOrder.created_at,
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#5B3A20]">
                    Historial de estado
                  </h3>
                  <ol className="mt-2 space-y-2 text-xs text-[#6B5A47]">
                    <li className="flex gap-2">
                      <span className="mt-[3px] h-2 w-2 rounded-full bg-[#B28153]" />
                      <div>
                        <div className="font-medium">
                          Pedido creado (SIN_PAGAR)
                        </div>
                        <div className="text-[11px]">
                          {new Date(
                            detailOrder.created_at,
                          ).toLocaleString()}
                        </div>
                      </div>
                    </li>
                    {detailOrder.comprobante_url && (
                      <li className="flex gap-2">
                        <span className="mt-[3px] h-2 w-2 rounded-full bg-[#1D8F5A]" />
                        <div>
                          <div className="font-medium">
                            Comprobante cargado
                          </div>
                          <div className="text-[11px] text-[#A08F7B]">
                            Fecha exacta no registrada (solo estado
                            actual).
                          </div>
                        </div>
                      </li>
                    )}
                    {detailOrder.order_status &&
                      detailOrder.order_status !== 'SIN_PAGAR' && (
                        <li className="flex gap-2">
                          <span className="mt-[3px] h-2 w-2 rounded-full bg-[#5B3A20]" />
                          <div>
                            <div className="font-medium">
                              Estado actual:{' '}
                              {detailOrder.order_status.replaceAll(
                                '_',
                                ' ',
                              )}
                            </div>
                            <div className="text-[11px] text-[#A08F7B]">
                              Último cambio registrado en BD no
                              disponible; se muestra solo el estado
                              vigente.
                            </div>
                          </div>
                        </li>
                      )}
                  </ol>
                </div>
              </div>

              {/* Comprobante */}
              <div className="rounded-xl border border-[#E3D7CC] bg-[#F8F4F0] p-3 text-xs text-[#6B5A47]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-semibold text-[13px]">
                      Comprobante
                    </span>
                  </div>
                </div>

                {!detailOrder.comprobante_url && (
                  <p className="text-[12px] text-[#A08F7B]">
                    No se ha subido comprobante para este pedido.
                  </p>
                )}

                {detailOrder.comprobante_url && (
                  <>
                    {detailLoading && (
                      <p className="text-[12px] text-[#A08F7B]">
                        Cargando comprobante…
                      </p>
                    )}
                    {detailError && (
                      <p className="text-[12px] text-red-600">
                        {detailError}
                      </p>
                    )}
                    {!detailLoading && detailUrl && (
                      <div className="mt-2 space-y-2">
                        {detailOrder.comprobante_url
                          .toLowerCase()
                          .endsWith('.pdf') ? (
                          <iframe
                            src={detailUrl}
                            title="Comprobante PDF"
                            className="w-full h-64 rounded-lg border border-[#E3D7CC] bg-white"
                          />
                        ) : (
                          <div className="w-full h-64 rounded-lg border border-[#E3D7CC] bg-white flex items-center justify-center overflow-hidden">
                            <img
                              src={detailUrl}
                              alt="Comprobante"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <a
                          href={detailUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-[#5B3A20] underline"
                        >
                          Abrir en nueva pestaña
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de cambio de estado */}
      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="max-w-sm w-full rounded-2xl bg-white shadow-xl border border-[#E3D7CC] p-5 space-y-4">
            <div className="flex items-center gap-3">
              {confirmState.newStatus === 'CANCELADO' ? (
                <Ban className="w-6 h-6 text-red-500" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#1D8F5A]" />
              )}
              <div>
                <h2 className="text-sm font-semibold text-[#5B3A20]">
                  Confirmar cambio de estado
                </h2>
                <p className="text-xs text-[#8A7A68]">
                  Vas a cambiar el estado de{' '}
                  <strong>{confirmState.previousStatus}</strong> a{' '}
                  <strong>{confirmState.newStatus}</strong>. Esta
                  acción afecta la gestión del pedido.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={handleCancelConfirm}
                className="rounded-full border border-[#E3D7CC] px-3 py-1 bg-white hover:bg-[#F8F4F0]"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmStatus}
                className={`rounded-full px-3 py-1 text-white ${
                  confirmState.newStatus === 'CANCELADO'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#1D8F5A] hover:bg-[#166843]'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
