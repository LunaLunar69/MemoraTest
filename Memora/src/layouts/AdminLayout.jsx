// src/layouts/AdminLayout.jsx
import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-[calc(100vh-56px)] grid grid-cols-[220px_1fr]">
      <aside className="border-r bg-gray-50/60">
        <div className="p-4 font-semibold">Admin</div>
        <nav className="px-2 space-y-1 text-sm">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-white border' : 'hover:bg-white'}`
            }
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/admin/pedidos"
            className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-white border' : 'hover:bg-white'}`
            }
          >
            🧾 Pedidos
          </NavLink>
          <NavLink
            to="/admin/ataudes"
            className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-white border' : 'hover:bg-white'}`
            }
          >
            ⚰️ Ataúdes
          </NavLink>
        </nav>
      </aside>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
