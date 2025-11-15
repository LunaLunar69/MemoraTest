// src/pages/Account.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { getProfile, upsertProfile, updatePassword, signOut } from '../features/auth/auth.service'
import { getMyOrders } from '../features/orders/orders.service'

// -------- Mini-componente: lista de pedidos del usuario --------
function MisPedidos() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    setLoading(true)
    getMyOrders()
      .then(setRows)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando pedidos…</p>
  if (err) return <p className="text-red-600">{err}</p>
  if (!rows.length) return <p>No tienes pedidos todavía.</p>

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2">Folio</th>
            <th className="text-left px-4 py-2">Producto</th>
            <th className="text-left px-4 py-2">Fecha</th>
            <th className="text-left px-4 py-2">Importe</th>
            <th className="text-left px-4 py-2">Estado</th>
            <th className="text-left px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const cantidad = r.cantidad ?? 1
            const total = Number(r.precio_unitario || 0) * cantidad
            const estado = (r.order_status || '').replaceAll('_', ' ')
            return (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.public_id}</td>
                <td className="px-4 py-2">{r.ataudes?.nombre ?? r.ataud_id}</td>
                <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">${total.toFixed(2)}</td>
                <td className="px-4 py-2 capitalize">{estado}</td>
                <td className="px-4 py-2">
                  <Link
                    className="underline text-orange-600"
                    to={`/pago?pid=${encodeURIComponent(r.public_id)}`}
                  >
                    Ver pago
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// --------------------- Página principal ---------------------
export default function Account() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [perfil, setPerfil] = useState(null)
  const [nombre, setNombre] = useState('')
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msg, setMsg] = useState('')

  // pestañas: 'perfil' | 'pedidos'
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
    try { await signOut() } catch (_) {}
  }

  if (!userId) return <div className="max-w-3xl mx-auto py-10">Necesitas iniciar sesión.</div>

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Mi Cuenta</h1>
        <p className="text-sm text-gray-600">Correo: {session.user.email}</p>

        {/* Tabs */}
        <div className="border-b mt-6">
          <nav className="flex gap-6 text-sm">
            <button
              onClick={() => setActiveTab('perfil')}
              className={activeTab === 'perfil' ? 'border-b-2 border-orange-500 pb-2' : 'pb-2 text-gray-500'}
            >
              Información de Perfil
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={activeTab === 'pedidos' ? 'border-b-2 border-orange-500 pb-2' : 'pb-2 text-gray-500'}
            >
              Mis Pedidos
            </button>
          </nav>
        </div>
      </header>

      {/* Tab: Perfil */}
      {activeTab === 'perfil' && (
        <>
          <section className="border rounded p-5">
            <h2 className="text-xl font-semibold mb-4">Información de Perfil</h2>
            {loadingInfo ? (
              <p>Cargando…</p>
            ) : (
              <form onSubmit={handleSaveInfo} className="space-y-3">
                <label className="block">
                  <span className="text-sm">Nombre completo</span>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </label>
                <button
                  disabled={savingInfo}
                  className="bg-orange-500 text-white rounded px-4 py-2 disabled:opacity-60"
                >
                  {savingInfo ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </form>
            )}
          </section>

          <section className="border rounded p-5">
            <h2 className="text-xl font-semibold mb-4">Cambiar contraseña</h2>
            <form onSubmit={handleSavePass} className="space-y-3">
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <button
                disabled={savingPass}
                className="bg-gray-800 text-white rounded px-4 py-2 disabled:opacity-60"
              >
                {savingPass ? 'Actualizando…' : 'Actualizar contraseña'}
              </button>
            </form>
          </section>

          {msg && <p className="text-sm">{msg}</p>}

          <div>
            <button onClick={handleLogout} className="text-red-600 underline">Cerrar sesión</button>
          </div>
        </>
      )}

      {/* Tab: Mis Pedidos */}
      {activeTab === 'pedidos' && <MisPedidos />}
    </div>
  )
}
