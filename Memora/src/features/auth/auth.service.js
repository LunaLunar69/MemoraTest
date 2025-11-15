import { supabase } from '../../lib/supabase'

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

/*codigo a remplazar
export async function signUp({ email, password, nombre_completo }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre_completo } }
  })
  if (error) throw error
  const userId = data.user?.id
  if (userId && nombre_completo) {
    await upsertProfile({ user_id: userId, nombre_completo })
  }
  return data.user
}
*/

export async function signUp({ email, password, nombre_completo }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre_completo } }  // el trigger lo leerá de metadata
  })
  if (error) throw error
  return data.user   // ← sin upsert aquí, el trigger ya creó profiles
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return data.user
}

export async function getProfile(user_id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, nombre_completo, role')
    .eq('user_id', user_id)
    .single()
  if (error) throw error
  return data
}

export async function upsertProfile({ user_id, nombre_completo }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id, nombre_completo }, { onConflict: 'user_id' })
    .select('user_id, nombre_completo, role')
    .single()
  if (error) throw error
  return data
}
