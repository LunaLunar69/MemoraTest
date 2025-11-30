// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const redirect = sp.get('redirect') || ''

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      if (error) throw error

      const userId = data.user?.id

      // Si viene con redirect
      if (redirect) {
        navigate(redirect, { replace: true })
        return
      }

      if (!userId) {
        navigate('/cuenta', { replace: true })
        return
      }

      // Conocer el rol del usuario
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (prof?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/cuenta', { replace: true })
      }
    } catch (err) {
      setMsg(err?.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-14 bg-[#F5F2EF]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-[#E3D7CC] p-8">

        {/* Encabezado */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#5B3A20]">Iniciar Sesión</h1>
          <p className="text-sm text-[#8A7A68] mt-2">
            Bienvenido nuevamente
          </p>
        </header>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
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

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-sm text-[#5B3A20]">Contraseña</label>
            <input
              type="password"
              value={password}
              required
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#E3D7CC] text-[#5B3A20]
                         focus:outline-none focus:border-[#B28153] focus:ring-2 focus:ring-[#E9D5C5]
                         placeholder:text-[#BFAF9F] transition"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          {msg && (
            <p className="text-red-600 text-sm text-center">{msg}</p>
          )}

          {/* Botón de entrar */}
          <button
            disabled={loading}
            className="w-full py-3 rounded-full text-[#F5F2EF] bg-[#B28153] 
                       hover:bg-[#8C5F32] transition font-medium tracking-wide
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-[#E3D7CC]"></div>

        {/* Registro */}
        <p className="text-center text-sm text-[#8A7A68]">
          ¿Aún no tienes una cuenta?
          <Link
          to={`/register?redirect=${encodeURIComponent(redirect || '/cuenta')}`}
          className="ml-1 text-[#B28153] font-medium hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </section>
  )
}
