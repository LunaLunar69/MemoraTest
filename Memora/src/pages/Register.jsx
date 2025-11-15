import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { signUp } from '../features/auth/auth.service'

export default function Register() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await signUp({ email, password, nombre_completo: nombre })
      navigate(redirect)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" type="text" placeholder="Nombre completo" value={nombre} onChange={e=>setNombre(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="tu@correo.com" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-orange-500 text-white rounded py-2 disabled:opacity-60" disabled={loading}>
          {loading ? 'Creando…' : 'Registrarse'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link className="text-orange-600 underline" to={`/login?redirect=${encodeURIComponent(redirect)}`}>Inicia sesión</Link>
      </p>
    </div>
  )
}
