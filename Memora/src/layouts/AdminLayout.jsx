// src/layouts/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { signOut } from '../features/auth/auth.service'

// Iconos lucide-react
import {
  LayoutDashboard,
  Receipt,
  Package,
  Home,
  LogOut
} from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { session } = useAuth() || {}

  async function handleLogout() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (_) {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F2EF] via-[#F1E6DA] to-[#F5F2EF]">
      {/* AHORA SIN max-w-6xl Y SIN mx-auto, USAMOS TODO EL ANCHO */}
      <div className="
        min-h-screen
        grid grid-cols-[260px_minmax(0,1fr)]
        bg-white/80
        shadow-[0_18px_60px_rgba(0,0,0,0.08)]
        md:rounded-3xl
        md:m-4 lg:m-8
        overflow-hidden
      ">

        {/* SIDEBAR */}
        <aside
          className="
            bg-gradient-to-b from-[#FDF8F3] via-white to-[#F4E7DB]
            border-r border-[#E3D7CC]
            shadow-[0_0_30px_rgba(91,58,32,0.06)]
            flex flex-col
          "
        >
          {/* Encabezado */}
          <div className="px-5 pt-5 pb-4 border-b border-[#E3D7CC]/70">
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#B28153]">
              MEMORA
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#5B3A20]">
              Panel de Administración
            </h2>
            <p className="mt-1 text-[11px] text-[#8A7A68] line-clamp-1">
              {session?.user?.email || 'Administrador'}
            </p>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            <AdminLink
              to="/admin"
              exact
              label="Dashboard"
              icon={<LayoutDashboard size={18} />}
            />
            <AdminLink
              to="/admin/pedidos"
              label="Pedidos"
              icon={<Receipt size={18} />}
            />
            <AdminLink
              to="/admin/ataudes"
              label="Ataúdes"
              icon={<Package size={18} />}
            />

            <hr className="my-4 border-[#E3D7CC]" />

            {/* Volver al sitio */}
            <button
              onClick={() => navigate('/')}
              className="
                w-full flex items-center gap-2 px-3 py-2 rounded-xl
                text-[#5B3A20] hover:bg-[#F5F2EF] hover:text-[#5B3A20]
                border border-transparent hover:border-[#E3D7CC]
                transition-all duration-200
              "
            >
              <Home size={17} />
              <span className="text-sm">Volver al sitio</span>
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={handleLogout}
              className="
                w-full flex items-center gap-2 px-3 py-2 rounded-xl mt-2
                text-[#B00020] hover:text-[#8C0018]
                bg-[#FBE9E7]/70 hover:bg-[#FBE9E7]
                border border-[#F5C6CB]/60
                transition-all duration-200
              "
            >
              <LogOut size={17} />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          </nav>

          {/* Pie sidebar */}
          <div className="px-4 py-3 border-t border-[#E3D7CC]/70 text-[11px] text-[#8A7A68]">
            <p>© {new Date().getFullYear()} Memora</p>
            <p className="text-[10px]">Uso interno del personal autorizado.</p>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="p-6 md:p-8 bg-[#F9F4EF]/60">
          {/* Barra superior dentro del main */}
          <div className="
            flex flex-wrap items-center justify-between gap-3
            border-b border-[#E3D7CC]/80 pb-4 mb-6
          ">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-[#5B3A20]">
                Administración
              </h1>
              <p className="text-xs md:text-sm text-[#8A7A68]">
                Gestiona pedidos, inventario y operaciones diarias.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F2EF] px-3 py-1 border border-[#E3D7CC] text-[#5B3A20]">
                <span className="h-2 w-2 rounded-full bg-[#4CAF50]"></span>
                Sesión activa
              </span>
            </div>
          </div>

          {/* Contenedor de las páginas internas */}
          <div className="rounded-2xl bg-white/90 border border-[#E3D7CC]/80 shadow-[0_14px_40px_rgba(0,0,0,0.05)] p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

/* -----------------------
   Link reutilizable sidebar
------------------------ */
function AdminLink({ to, label, icon, exact = false }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        [
          'group flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 border',
          isActive
            ? 'bg-[#5B3A20] text-[#FDF8F3] border-[#5B3A20] shadow-sm pl-[11px] border-l-[6px] border-l-[#D7A46A]'
            : 'text-[#5B3A20] border-transparent hover:border-[#E3D7CC] hover:bg-[#F5F2EF]'
        ].join(' ')
      }
    >
      <span className="opacity-90 group-hover:opacity-100">
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  )
}
