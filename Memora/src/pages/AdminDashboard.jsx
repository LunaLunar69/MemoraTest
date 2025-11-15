// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { adminGetKpis } from '../features/admin/admin.service'

export default function AdminDashboard() {
  const [kpi, setKpi] = useState({ pedidos: 0, ataudes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetKpis().then(setKpi).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-gray-500 text-sm">Pedidos totales</div>
            <div className="text-3xl font-semibold">{kpi.pedidos}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-gray-500 text-sm">Catálogo (ataúdes)</div>
            <div className="text-3xl font-semibold">{kpi.ataudes}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-gray-500 text-sm">Próximamente</div>
            <div className="text-3xl font-semibold">—</div>
          </div>
        </div>
      )}
    </div>
  )
}
