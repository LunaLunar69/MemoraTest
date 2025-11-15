// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

      // Si hay redirect, respetarlo
      if (redirect) {
        navigate(redirect, { replace: true })
        return
      }

      // Si no hay redirect, checamos el rol para decidir adónde ir
      const userId = data.user?.id
      if (!userId) {
        navigate('/cuenta', { replace: true })
        return
      }

      const { data: prof, error: pErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (pErr) {
        // Si falla, mejor mandarlo a su cuenta (AdminRoute luego decidirá)
        navigate('/cuenta', { replace: true })
        return
      }

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
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Iniciar sesión</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm">Correo</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Contraseña</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </label>

        {msg && <p className="text-red-600 text-sm">{msg}</p>}

        <button
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
