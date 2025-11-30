// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { signUp } from '../features/auth/auth.service'

export default function Register() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/cuenta'

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp({ email, password, nombre_completo: nombre })
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-14 bg-[#F5F2EF]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-[#E3D7CC] p-8">
        {/* Encabezado */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#5B3A20]">
            Crear cuenta
          </h1>
          <p className="text-sm text-[#8A7A68] mt-2">
            Registra tus datos para continuar
          </p>
        </header>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-sm text-[#5B3A20]">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              required
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#E3D7CC] text-[#5B3A20]
                         focus:outline-none focus:border-[#B28153] focus:ring-2 focus:ring-[#E9D5C5]
                         placeholder:text-[#BFAF9F] transition"
              placeholder="Nombre y apellidos"
            />
          </div>

          {/* Correo */}
          <div className="space-y-1">
            <label className="text-sm text-[#5B3A20]">Correo electrónico</label>
            <input
              type="email"
              value={email}
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#E3D7CC] text-[#5B3A20]
                         focus:outline-none focus:border-[#B28153] focus:ring-2 focus:ring-[#E9D5C5]
                         placeholder:text-[#BFAF9F] transition"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-sm text-[#5B3A20]">Contraseña</label>
            <input
              type="password"
              value={password}
              required
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#E3D7CC] text-[#5B3A20]
                         focus:outline-none focus:border-[#B28153] focus:ring-2 focus:ring-[#E9D5C5]
                         placeholder:text-[#BFAF9F] transition"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Botón registrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-[#F5F2EF] bg-[#B28153] 
                       hover:bg-[#8C5F32] transition font-medium tracking-wide
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-[#E3D7CC]" />

        {/* Enlace a login */}
        <p className="text-center text-sm text-[#8A7A68]">
          ¿Ya tienes cuenta?
          <Link
            className="ml-1 text-[#B28153] font-medium hover:underline"
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  )
}
