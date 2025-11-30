// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { adminGetKpis } from '../features/admin/admin.service'
import { Receipt, Package, LineChart, Info } from 'lucide-react'

export default function AdminDashboard() {
  const [kpi, setKpi] = useState({ pedidos: 0, ataudes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetKpis()
      .then(setKpi)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#5B3A20]">
            Dashboard
          </h1>
          <p className="text-sm text-[#8A7A68]">
            Resumen rápido de pedidos y catálogo.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F2EF] border border-[#E3D7CC] text-[11px] text-[#8A7A68]">
          <span className="h-2 w-2 rounded-full bg-[#4CAF50]" />
          Datos en tiempo real
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          {/* Tarjetas KPI principales */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <KpiCard
              icon={<Receipt size={22} />}
              label="Pedidos totales"
              value={kpi.pedidos}
              description="Órdenes registradas en el sistema."
              accent="primary"
            />
            <KpiCard
              icon={<Package size={22} />}
              label="Catálogo (ataúdes)"
              value={kpi.ataudes}
              description="Modelos activos en inventario."
              accent="secondary"
            />
            <KpiCard
              icon={<LineChart size={22} />}
              label="Próximamente"
              value="—"
              description="Métricas adicionales de ventas."
              accent="neutral"
            />
          </section>

          {/* Bloque informativo / ayuda rápida */}
          <section className="mt-4 rounded-2xl border border-dashed border-[#E3D7CC] bg-[#FDF8F3] px-4 py-3 md:px-5 md:py-4 flex gap-3 text-xs md:text-sm text-[#8A7A68]">
            <div className="mt-0.5 text-[#B28153]">
              <Info size={18} />
            </div>
            <div>
              <p className="font-medium text-[#5B3A20]">
                ¿Qué se puede hacer desde el panel de Administración?
              </p>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                <li>
                  Revisa el detalle de cada pedido en la sección <strong>Pedidos</strong>.
                </li>
                <li>
                  Actualiza stock, precios e imágenes en <strong>Ataúdes</strong>.
                </li>
                <li>
                  Marca pagos confirmados y pedidos entregados para mantener el control al día.
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

/* ------------------------- */
/*   Componente KpiCard      */
/* ------------------------- */

function KpiCard({ icon, label, value, description, accent = 'primary' }) {
  const accentClasses = {
    primary: 'bg-[#FDF5EE] border-[#F0CFA4]',
    secondary: 'bg-[#F3F6F4] border-[#C3D9C5]',
    neutral: 'bg-[#F5F2EF] border-[#E3D7CC]',
  }[accent] || 'bg-[#F5F2EF] border-[#E3D7CC]'

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border ${accentClasses} px-4 py-4 md:px-5 md:py-5 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
            {label}
          </p>
          <p className="mt-2 text-3xl md:text-4xl font-semibold text-[#5B3A20]">
            {value}
          </p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-[#B28153] shadow-sm">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-[#8A7A68]">
        {description}
      </p>

      {/* decor suave */}
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-20 w-20 rounded-full bg-white/40" />
    </article>
  )
}

/* ------------------------- */
/*   Skeleton mientras carga */
/* ------------------------- */

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[#E3D7CC]/70 bg-[#F9F4EF]/60 px-4 py-5 md:px-5 animate-pulse"
        >
          <div className="h-3 w-24 bg-[#E3D7CC]/80 rounded" />
          <div className="mt-4 h-7 w-16 bg-[#E3D7CC]/80 rounded" />
          <div className="mt-3 h-3 w-32 bg-[#E3D7CC]/60 rounded" />
        </div>
      ))}
    </div>
  )
}
