// Admin: Ataúdes
import { supabase } from '../../lib/supabase'

export async function adminListAtaudes() {
  const { data, error } = await supabase
    .from('ataudes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function adminCreateAtaud(payload) {
  // { nombre, slug, precio, descripcion?, material?, interior?, dimensiones?, imagen_url?, stock? }
  const { data, error } = await supabase
    .from('ataudes')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminUpdateAtaud(id, payload) {
  const { data, error } = await supabase
    .from('ataudes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminDeleteAtaud(id) {
  const { error } = await supabase
    .from('ataudes')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}
