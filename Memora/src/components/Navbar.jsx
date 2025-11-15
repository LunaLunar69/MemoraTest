// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '../features/auth/auth.service'  // <- tu servicio

export default function Navbar() {
  const { session, profile } = useAuth() || {}
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    if (!menuOpen) return
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    try {
      await signOut()
    } finally {
      setMenuOpen(false)
      navigate('/', { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">Ethereal Repose</Link>

        {/* Navegación principal */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-orange-600' : '')}>
            Inicio
          </NavLink>
          <NavLink to="/ataudes" className={({ isActive }) => (isActive ? 'text-orange-600' : '')}>
            Ataúdes
          </NavLink>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? 'text-orange-600' : '')}>
            Contacto
          </NavLink>
        </nav>

        {/* Área de usuario */}
        <div className="relative" ref={menuRef}>
          {!session ? (
            <Link
              to="/login"
              className="text-sm hover:text-orange-600 transition"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-xl hover:text-orange-600 transition"
              title="Cuenta"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              👤
            </button>
          )}

          {/* Dropdown */}
          {menuOpen && session && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg py-2 text-sm"
            >
              {profile?.role === 'admin' ? (
                <>
                  <Link
                    role="menuitem"
                    to="/admin"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    📊 Panel Admin
                  </Link>
                  <Link
                    role="menuitem"
                    to="/cuenta"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    👤 Mi Cuenta
                  </Link>
                </>
              ) : (
                <Link
                  role="menuitem"
                  to="/cuenta"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  👤 Mi Cuenta
                </Link>
              )}

              <hr className="my-1" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                🔒 Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
