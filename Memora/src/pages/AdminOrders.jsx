// src/pages/AdminOrders.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  getAdminOrders,
  setOrderStatus,
  getSignedComprobanteURL,
} from '../features/orders/orders.service.js'

/* =========================
   Constantes / utilidades
   ========================= */
const STATUS = ['SIN_PAGAR', 'PAGADO', 'PAGADO_ENTREGADO']
const PAGE_SIZE = 25

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(Number(n || 0))

const stateBadgeClass = (s) => {
  if (s === 'PAGADO_ENTREGADO') return 'bg-green-100 text-green-700 border-green-200'
  if (s === 'PAGADO') return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-yellow-100 text-yellow-800 border-yellow-200' // SIN_PAGAR
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

  // cargar datos
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

  // helpers
  async function handleView(path) {
    try {
      const url = await getSignedComprobanteURL(path, 60 * 10) // 10 min
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      alert(e.message || 'No se pudo generar el enlace del comprobante.')
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      // Optimista
      setRows(prev => prev.map(r => r.id === id ? { ...r, order_status: newStatus } : r))
      const updated = await setOrderStatus(id, newStatus)
      setRows(prev => prev.map(r => r.id === id ? updated : r))
    } catch (e) {
      alert(e.message || 'No se pudo actualizar el estado.')
      // reload para revertir
      setRefreshKey(x => x + 1)
    }
  }

  function copyFolio(folio) {
    navigator.clipboard?.writeText(folio).then(
      () => {},
      () => alert('No se pudo copiar el folio')
    )
  }

  const totalRows = useMemo(() => rows.length, [rows])

  // UI
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Filtros */}
      <header className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <div className="flex gap-2">
          <input
            placeholder="Buscar por folio o cliente…"
            value={search}
            onChange={(e) => { setPage(0); setSearch(e.target.value) }}
            className="border rounded px-3 py-2 text-sm w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setPage(0); setStatusFilter(e.target.value) }}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            className="border rounded px-3 py-2 text-sm"
            onClick={() => setRefreshKey(x => x + 1)}
            title="Recargar"
          >
            Recargar
          </button>
        </div>
      </header>

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
      {!loading && !rows.length && (
        <p className="text-gray-600">No hay pedidos para los filtros actuales.</p>
      )}

      {/* Tabla */}
      {!!rows.length && (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Folio</th>
                  <th className="text-left px-3 py-2">Cliente</th>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">Cant</th>
                  <th className="text-left px-3 py-2">Importe</th>
                  <th className="text-left px-3 py-2">Estado</th>
                  <th className="text-left px-3 py-2">Comprobante</th>
                  <th className="text-left px-3 py-2">Creado</th>
                  <th className="text-left px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const cantidad = r.cantidad ?? 1
                  const precio = r.precio_unitario ?? r.ataudes?.precio ?? 0
                  const total = Number(precio) * Number(cantidad)
                  const cliente = r.profiles?.nombre_completo || (r.user_id?.slice(0, 8) ?? '—')
                  const prod = r.ataudes?.nombre ?? r.ataud_id

                  return (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{r.public_id}</span>
                          <button
                            onClick={() => copyFolio(r.public_id)}
                            className="text-xs underline text-gray-500"
                            title="Copiar folio"
                          >
                            copiar
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">{cliente}</td>
                      <td className="px-3 py-2">{prod}</td>
                      <td className="px-3 py-2">{cantidad}</td>
                      <td className="px-3 py-2">{money(total)}</td>

                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`border px-2 py-0.5 rounded text-xs ${stateBadgeClass(r.order_status)}`}
                            title={r.order_status}
                          >
                            {r.order_status.replaceAll('_', ' ')}
                          </span>
                          <select
                            value={r.order_status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            className="border rounded px-2 py-1 text-xs"
                            title="Cambiar estado"
                          >
                            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        {r.comprobante_url ? (
                          <button
                            onClick={() => handleView(r.comprobante_url)}
                            className="underline text-blue-600"
                          >
                            Ver comprobante
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {new Date(r.created_at).toLocaleString()}
                      </td>

                      <td className="px-3 py-2">
                        {r.comprobante_url && r.order_status === 'SIN_PAGAR' && (
                          <button
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                            onClick={() => handleStatusChange(r.id, 'PAGADO')}
                          >
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
                  <td className="px-3 py-2 text-xs text-gray-500" colSpan={9}>
                    Mostrando {totalRows} pedido(s) en esta página
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between pt-3">
            <div className="text-xs text-gray-500">
              Página {page + 1}
            </div>
            <div className="flex gap-2">
              <button
                className="border rounded px-3 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                « Anterior
              </button>
              <button
                className="border rounded px-3 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage(p => p + 1)}
                // Si menos de PAGE_SIZE, probablemente no hay más filas.
                disabled={rows.length < PAGE_SIZE}
              >
                Siguiente »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
