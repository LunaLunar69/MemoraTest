// src/features/admin/admin.service.js
import { supabase } from '../../lib/supabase'

// —— Helpers ——
export const ORDER_STATUS = {
  SIN_PAGAR: 'SIN_PAGAR',
  PAGADO: 'PAGADO',
  PAGADO_ENTREGADO: 'PAGADO_ENTREGADO',
}

export async function adminGetKpis() {
  // conteos simples para dashboard
  const [{ count: cPedidos }, { count: cAtaudes }] = await Promise.all([
    supabase.from('pedidos').select('id', { count: 'exact', head: true }),
    supabase.from('ataudes').select('id', { count: 'exact', head: true }),
  ])
  return { pedidos: cPedidos || 0, ataudes: cAtaudes || 0 }
}

// —— Órdenes ——
export async function adminListOrders({ q = '', status = '', limit = 20, page = 1 } = {}) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('pedidos')
    .select(`
      id, public_id, created_at, order_status, cantidad,
      precio_unitario, user_id,
      ataudes:ataud_id ( nombre, precio, slug )
    `, { count: 'exact' }) // 👈 pedimos conteo total
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('order_status', status)
  if (q) query = query.or(`public_id.ilike.%${q}%,ataudes.nombre.ilike.%${q}%`)

  const { data, error, count } = await query
  if (error) throw error
  return { rows: data, total: count ?? 0 }
}

export async function adminSetOrderStatus(id, order_status) {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ order_status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// —— Ataúdes ——
export async function adminListAtaudes() {
  const { data, error } = await supabase
    .from('ataudes')
    .select('id, slug, nombre, precio, stock, material, interior, dimensiones, imagen_url, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function adminSaveAtaud(payload) {
  // si viene id -> update, si no -> insert
  if (payload.id) {
    const { data, error } = await supabase
      .from('ataudes')
      .update(payload)
      .eq('id', payload.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('ataudes')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function adminDeleteAtaud(id) {
  const { error } = await supabase.from('ataudes').delete().eq('id', id)
  if (error) throw error
  return true
}
