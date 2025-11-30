// src/pages/Account.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { getProfile, upsertProfile, updatePassword, signOut } from '../features/auth/auth.service'
import { getMyOrders } from '../features/orders/orders.service'

// ===== Utilidad para dinero =====
const money = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
    .format(Number(v ?? 0))

// ===== Badge de estado =====
function StatusBadge({ status }) {
  const s = (status || '').toUpperCase()
  let label = s.replaceAll('_', ' ')
  let classes = 'bg-[#FFF8E1] text-[#8A6E1E]' // default amarillito

  if (s === 'PAGADO') {
    classes = 'bg-[#E3F2FD] text-[#1565C0]'
  } else if (s === 'PAGADO_ENTREGADO') {
    classes = 'bg-[#E8F5E9] text-[#2E7D32]'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${classes}`}>
      {label.toLowerCase()}
    </span>
  )
}

// -------- Mini-componente: lista de pedidos del usuario --------
function MisPedidos({ userId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getMyOrders(userId)
      .then(setRows)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <p className="text-sm text-[#8A7A68]">Cargando tus pedidos…</p>
  if (err) return <p className="text-sm text-red-600">{err}</p>
  if (!rows.length) {
    return (
      <div className="text-sm text-[#8A7A68] bg-[#FDF9F5] border border-[#E3D7CC] rounded-2xl p-6 text-center">
        Aún no has realizado ningún pedido.
        <br />
        <Link
          to="/ataudes"
          className="mt-3 inline-block text-[#B28153] font-medium hover:underline"
        >
          Ver ataúdes disponibles
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-3 overflow-hidden border border-[#E3D7CC] rounded-2xl bg-white">
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F5F2EF] text-[#5B3A20]">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide">Folio</th>
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide">Producto</th>
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide">Fecha</th>
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide">Importe</th>
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const cantidad = r.cantidad ?? 1
              const precio = r.precio_unitario ?? r.ataudes?.precio ?? 0
              const total = Number(precio) * Number(cantidad)

              return (
                <tr key={r.id} className="border-t border-[#F0E3D6]">
                  <td className="px-4 py-2 font-mono text-xs text-[#5B3A20]">{r.public_id}</td>
                  <td className="px-4 py-2 text-[#5B3A20]">
                    {r.ataudes?.nombre ?? r.ataud_id}
                  </td>
                  <td className="px-4 py-2 text-[#8A7A68]">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-[#5B3A20]">
                    {money(total)}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={r.order_status} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      className="text-xs text-[#B28153] underline hover:text-[#8C5F32]"
                      to={`/pago?pid=${encodeURIComponent(r.public_id)}`}
                    >
                      Ver detalles de pago
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Versión móvil: cards */}
      <div className="md:hidden divide-y divide-[#F0E3D6]">
        {rows.map(r => {
          const cantidad = r.cantidad ?? 1
          const precio = r.precio_unitario ?? r.ataudes?.precio ?? 0
          const total = Number(precio) * Number(cantidad)

          return (
            <div key={r.id} className="p-4 text-sm text-[#5B3A20]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-xs text-[#8A7A68]">
                  {r.public_id}
                </span>
                <StatusBadge status={r.order_status} />
              </div>
              <p className="font-semibold">
                {r.ataudes?.nombre ?? r.ataud_id}
              </p>
              <p className="text-xs text-[#8A7A68] mt-1">
                {new Date(r.created_at).toLocaleString()}
              </p>
              <p className="mt-2 text-sm">
                Total:&nbsp;
                <span className="font-semibold">{money(total)}</span>
              </p>
              <div className="mt-3">
                <Link
                  className="text-xs text-[#B28153] underline hover:text-[#8C5F32]"
                  to={`/pago?pid=${encodeURIComponent(r.public_id)}`}
                >
                  Ver detalles de pago
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --------------------- Página principal ---------------------
export default function Account() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState(null)
  const [nombre, setNombre] = useState('')
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msg, setMsg] = useState('')

  const [activeTab, setActiveTab] = useState('perfil')

  useEffect(() => {
    if (!userId) return
    setLoadingInfo(true)
    getProfile(userId)
      .then((p) => {
        setPerfil(p)
        setNombre(p?.nombre_completo || '')
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingInfo(false))
  }, [userId])

  async function handleSaveInfo(e) {
    e.preventDefault()
    if (!userId) return
    setSavingInfo(true)
    setMsg('')
    try {
      const p = await upsertProfile({ user_id: userId, nombre_completo: nombre })
      setPerfil(p)
      setMsg('Perfil actualizado.')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setSavingInfo(false)
    }
  }

  async function handleSavePass(e) {
    e.preventDefault()
    setMsg('')
    if (pass1.length < 6) return setMsg('La contraseña debe tener al menos 6 caracteres.')
    if (pass1 !== pass2) return setMsg('Las contraseñas no coinciden.')

    setSavingPass(true)
    try {
      await updatePassword(pass1)
      setPass1('')
      setPass2('')
      setMsg('Contraseña actualizada.')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setSavingPass(false)
    }
  }

  async function handleLogout() {
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (_) {}
  }

  if (!userId) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center text-sm text-[#5B3A20] bg-[#FDF9F5] border border-[#E3D7CC] rounded-2xl p-6">
          Necesitas iniciar sesión para ver tu cuenta.
          <div className="mt-3">
            <Link
              to="/login"
              className="inline-block text-[#B28153] font-medium hover:underline"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const displayName =
    perfil?.nombre_completo ||
    session.user.email ||
    ''
  const inicial = displayName ? displayName.charAt(0).toUpperCase() : 'U'

  return (
    <section className="min-h-[80vh] bg-[#F5F2EF] py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Tarjeta principal */}
        <div className="bg-white border border-[#E3D7CC] rounded-3xl shadow-sm p-6 sm:p-8 space-y-8">
          {/* Encabezado con avatar */}
          <header className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#B28153] text-[#F5F2EF] flex items-center justify-center text-lg font-semibold">
                {inicial}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#B28153]">
                  Mi cuenta
                </p>
                <h1 className="text-2xl font-semibold text-[#5B3A20]">
                  {displayName || 'Usuario'}
                </h1>
                <p className="text-xs text-[#8A7A68]">
                  {session.user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full border border-[#E3D7CC] px-4 py-2 text-xs font-medium text-[#B00020] hover:bg-[#FBE9E7] transition-colors"
            >
              Cerrar sesión
            </button>
          </header>

          {/* Tabs */}
          <div>
            <div className="flex gap-4 border-b border-[#E3D7CC] text-sm">
              <button
                onClick={() => setActiveTab('perfil')}
                className={`pb-2 px-1 -mb-[1px] ${
                  activeTab === 'perfil'
                    ? 'border-b-2 border-[#B28153] text-[#5B3A20] font-medium'
                    : 'text-[#8A7A68] hover:text-[#5B3A20]'
                }`}
              >
                Información de perfil
              </button>
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`pb-2 px-1 -mb-[1px] ${
                  activeTab === 'pedidos'
                    ? 'border-b-2 border-[#B28153] text-[#5B3A20] font-medium'
                    : 'text-[#8A7A68] hover:text-[#5B3A20]'
                }`}
              >
                Mis pedidos
              </button>
            </div>
          </div>

          {/* Contenido de pestañas */}
          {activeTab === 'perfil' && (
            <div className="space-y-8 pt-2">
              {/* Info de perfil */}
              <section className="bg-[#FDF9F5] border border-[#E3D7CC] rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-[#5B3A20]">
                  Información de perfil
                </h2>
                {loadingInfo ? (
                  <p className="text-sm text-[#8A7A68]">Cargando…</p>
                ) : (
                  <form onSubmit={handleSaveInfo} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-[#5B3A20]">Nombre completo</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E3D7CC] text-[#5B3A20]
                                   focus:outline-none focus:border-[#B28153] focus:ring-2 focus:ring-[#E9D5C5]
                                   text-sm"
                      />
                    </div>

                    <button
                      disabled={savingInfo}
                      className="inline-flex items-center justify-center rounded-full bg-[#B28153] text-[#F5F2EF] px-5 py-2 text-xs font-medium hover:bg-[#8C5F32] transition-colors disabled:opacity-60"
                    >
                      {savingInfo ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </form>
                )}
              </section>

              {/* Cambiar contraseña */}
              <section className="bg-[#FDF9F5] border border-[#E3D7CC] rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-[#5B3A20]">
                  Cambiar contraseña
                </h2>

                <form onSubmit={handleSavePass} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={pass1}
                    onChange={(e) => setPass1(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E3D7CC] text-[#5B3A20]
                               focus:outline-none focus:border-[#B28153] focus:ring-2 focus:ring-[#E9D5C5]
                               text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={pass2}
                    onChange={(e) => setPass2(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E3D7CC] text-[#5B3A20]
                               focus:outline-none focus:border-[#B28153] focus:ring-2 focus:ring-[#E9D5C5]
                               text-sm"
                  />
                  <button
                    disabled={savingPass}
                    className="inline-flex items-center justify-center rounded-full bg-[#5B3A20] text-[#F5F2EF] px-5 py-2 text-xs font-medium hover:bg-[#3C2815] transition-colors disabled:opacity-60"
                  >
                    {savingPass ? 'Actualizando…' : 'Actualizar contraseña'}
                  </button>
                </form>
              </section>

              {msg && (
                <p className="text-xs text-[#5B3A20]">{msg}</p>
              )}
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="pt-2 space-y-3">
              <p className="text-xs text-[#8A7A68]">
                Aquí puedes consultar el historial de pedidos realizados con tu cuenta.
              </p>
              <MisPedidos userId={userId} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
