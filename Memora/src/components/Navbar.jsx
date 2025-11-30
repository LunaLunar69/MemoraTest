// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { signOut } from '../features/auth/auth.service'

// Ajusta ruta si tu logo está en otro directorio
import logoMemora from '../assets/logo-memora.png'

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'px-2 py-1 text-sm tracking-wide transition-colors',
          isActive
            ? 'text-[#5B3A20] font-semibold border-b-2 border-[#B28153]'
            : 'text-[#8A7A68] hover:text-[#5B3A20]',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { session, profile } = useAuth() || {}
  const isAdmin = profile?.role === 'admin'
  const navigate = useNavigate()

  const [openMenu, setOpenMenu] = useState(false)   // dropdown desktop
  const [mobileOpen, setMobileOpen] = useState(false) // menú hamburguesa

  const menuRef = useRef(null)

  const displayName =
    profile?.nombre_completo ||
    session?.user?.email ||
    ''
  const inicial = displayName ? displayName.charAt(0).toUpperCase() : 'U'

  async function handleLogout() {
    try {
      await signOut()
      setOpenMenu(false)
      setMobileOpen(false)
      navigate('/')
    } catch (e) {
      console.error(e)
    }
  }

  // Cerrar dropdown desktop al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[#E3D7CC] bg-[#F5F2EF]/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logoMemora}
            alt="Memora"
            className="w-9 h-9 rounded-full object-cover shadow-sm"
          />
          <span className="font-semibold tracking-[0.25em] text-xs text-[#5B3A20] uppercase">
            MEMORA
          </span>
        </Link>

        {/* NAV (desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          <NavItem to="/">Inicio</NavItem>
          <NavItem to="/ataudes">Ataúdes</NavItem>
          <NavItem to="/contacto">Contacto</NavItem>
        </nav>

        {/* BOTÓN HAMBURGUESA (solo móvil) */}
        <button
          className="md:hidden p-2 rounded-lg border border-[#D8C4B3] text-[#5B3A20]"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* USER (desktop) */}
        <div className="relative hidden md:block" ref={menuRef}>
          {!session ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#B28153] px-4 py-1.5 text-xs font-medium text-[#5B3A20] hover:bg-[#B28153] hover:text-[#F5F2EF] transition-colors"
            >
              Iniciar sesión
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setOpenMenu((v) => !v)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#B28153] text-[#F5F2EF] text-sm font-semibold shadow-sm hover:bg-[#8C5F32] transition-colors"
                title={displayName}
                aria-label="Cuenta"
              >
                {inicial}
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg border border-[#E3D7CC] text-sm">
                  <div className="px-3 py-2 border-b border-[#F5F2EF]">
                    <p className="text-[11px] uppercase tracking-wide text-[#8A7A68]">
                      Sesión activa
                    </p>
                    <p className="text-xs text-[#5B3A20] truncate">
                      {displayName}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/cuenta"
                      onClick={() => setOpenMenu(false)}
                      className="block px-3 py-1.5 hover:bg-[#F5F2EF] text-[#5B3A20]"
                    >
                      Mi cuenta
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpenMenu(false)}
                        className="block px-3 py-1.5 hover:bg-[#F5F2EF] text-[#5B3A20]"
                      >
                        Panel admin
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#FBE9E7] text-[#B00020]"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MENU MÓVIL */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E3D7CC] bg-[#F5F2EF]">
          <div className="flex flex-col px-4 py-3 gap-2">
            <NavItem to="/" onClick={() => setMobileOpen(false)}>
              Inicio
            </NavItem>
            <NavItem to="/ataudes" onClick={() => setMobileOpen(false)}>
              Ataúdes
            </NavItem>
            <NavItem to="/contacto" onClick={() => setMobileOpen(false)}>
              Contacto
            </NavItem>

            {!session ? (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-3 inline-flex justify-center rounded-full border border-[#B28153] px-4 py-2 text-xs font-medium text-[#5B3A20] hover:bg-[#B28153] hover:text-[#F5F2EF]"
              >
                Iniciar sesión
              </Link>
            ) : (
              <>
                <Link
                  to="/cuenta"
                  className="px-2 py-2 text-[#5B3A20] hover:bg-[#F5F2EF] rounded"
                  onClick={() => setMobileOpen(false)}
                >
                  Mi cuenta
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-2 py-2 text-[#5B3A20] hover:bg-[#F5F2EF] rounded"
                    onClick={() => setMobileOpen(false)}
                  >
                    Panel admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2 py-2 text-left text-[#B00020] hover:bg-[#FBE9E7] rounded"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
