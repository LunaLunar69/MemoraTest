// src/routes/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function AdminRoute() {
  const { profile, loading, session } = useAuth()

  // Espera a que cargue (sesión + perfil)
  if (loading) return null

  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent('/admin')}`} replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
