// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthCtx = createContext({
  session: null,
  profile: null,
  loading: true,
  setProfile: () => {}
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true) // loading cubre sesión + perfil

  // 1) Obtener sesión inicial y suscribirse a cambios
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!mounted) return
        setSession(data.session ?? null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      setSession(_session ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // 2) Cargar el profile cuando haya sesión; limpiarlo cuando no
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      // si no hay usuario, limpia y listo
      if (!session?.user?.id) {
        setProfile(null)
        return
      }

      // mientras cargamos el profile, marcamos loading
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, role, nombre_completo')
          .eq('user_id', session.user.id)
          .single()

        if (!cancelled) {
          if (error) {
            // si por alguna razón no existe fila (no debería), deja profile en null
            setProfile(null)
          } else {
            setProfile(data)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [session?.user?.id])

  const value = useMemo(
    () => ({ session, profile, setProfile, loading }),
    [session, profile, loading]
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
