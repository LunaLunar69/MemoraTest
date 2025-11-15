// Admin: Pedidos
import { supabase } from '../../lib/supabase'

// lista completa con join de ataúd y (opcional) nombre del cliente
export async function adminGetOrders() {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id, public_id, user_id, ataud_id,
      precio_unitario, cantidad, order_status,
      referencia_pago, comprobante_url,
      observaciones_admin, created_at,
      ataudes:ataud_id ( nombre, slug, precio ),
      profiles:user_id ( nombre_completo )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function adminUpdateOrder(id, payload) {
  // payload: { order_status?, observaciones_admin?, referencia_pago?, comprobante_url? }
  const { data, error } = await supabase
    .from('pedidos')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminGetStats() {
  // Podemos hacer 4 lecturas sencillas y sumar en cliente
  const base = supabase.from('pedidos')
  const [total, sinPagar, pagado, entregado] = await Promise.all([
    base.select('*', { count: 'exact', head: true }),
    base.select('*', { count: 'exact', head: true }).eq('order_status', 'SIN_PAGAR'),
    base.select('*', { count: 'exact', head: true }).eq('order_status', 'PAGADO'),
    base.select('*', { count: 'exact', head: true }).eq('order_status', 'PAGADO_ENTREGADO')
  ])

  // Ingreso: traemos los pagados y sumamos en cliente
  const { data: paidRows, error } = await supabase
    .from('pedidos')
    .select('precio_unitario, cantidad, order_status')
    .in('order_status', ['PAGADO', 'PAGADO_ENTREGADO'])
  if (error) throw error

  const ingreso = (paidRows ?? []).reduce(
    (acc, r) => acc + Number(r.precio_unitario || 0) * Number(r.cantidad || 1),
    0
  )

  return {
    total: total.count ?? 0,
    sinPagar: sinPagar.count ?? 0,
    pagado: pagado.count ?? 0,
    entregado: entregado.count ?? 0,
    ingreso
  }
}
