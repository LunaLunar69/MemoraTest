// src/features/orders/orders.service.js
import { supabase } from '../../lib/supabase'

/* =========================
   Constantes (Storage)
   ========================= */
const BUCKET_COMPROBANTES = 'comprobantes'
const PROFILES_REL = 'profiles!pedidos_user_id_profiles_fkey' // usa la FK explícita

/* =========================
   Cliente (mis pedidos / pago)
   ========================= */

/** Lista de pedidos del usuario logueado (para la cuenta) */
export async function getMyOrders(userId) {
  if (!userId) throw new Error('Falta userId para getMyOrders')

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id,
      public_id,
      user_id,
      ataud_id,
      precio_unitario,
      cantidad,
      order_status,
      comprobante_url,
      created_at,
      ataudes:ataud_id ( nombre, precio, slug )
    `)
    .eq('user_id', userId) // 👈 solo pedidos de ese usuario
    .neq('order_status', 'CANCELADO') // 👈 ocultar cancelados al cliente
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/** Obtiene un pedido por folio público (Payment) */
export async function getOrderByPublicId(publicId) {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id,
      public_id,
      user_id,
      ataud_id,
      precio_unitario,
      cantidad,
      order_status,
      comprobante_url,
      created_at,
      ataudes:ataud_id ( nombre, precio, slug )
    `)
    .eq('public_id', publicId)
    .single()
  if (error) throw error
  return data
}

/** Crea un pedido para el usuario logueado y devuelve { id, public_id } */
export async function createPedido({ ataud, user }) {
  const payload = {
    user_id: user.id,
    ataud_id: ataud.id,
    precio_unitario: ataud.precio,
    cantidad: 1,
    // si luego los llenas en un paso de checkout, déjalos null
    nombre: user.user_metadata?.full_name ?? null,
    email: user.email ?? null,
    telefono: null,
    direccion: null,
  }

  const { data, error } = await supabase
    .from('pedidos')
    .insert(payload)
    .select('id, public_id')
    .single()

  if (error) throw error
  return data
}

/* =========================
   Storage de comprobantes (cliente y admin)
   ========================= */

/** Sube el archivo a Storage y devuelve la ruta (path) */
export async function uploadComprobante(file, { user_id, public_id }) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const safeName = `recibo_${Date.now()}.${ext}`
  const path = `${user_id}/${public_id}/${safeName}`

  const { error: upErr } = await supabase
    .storage
    .from(BUCKET_COMPROBANTES)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    })

  if (upErr) throw upErr
  return path
}

/** Firma temporal para ver/descargar un comprobante */
export async function getSignedComprobanteURL(path, seconds = 60 * 60) {
  const { data, error } = await supabase
    .storage
    .from(BUCKET_COMPROBANTES)
    .createSignedUrl(path, seconds)
  if (error) throw error
  return data.signedUrl
}

/** Guarda la ruta del comprobante y cambia el estado (por defecto a PAGADO) */
export async function setComprobanteOnOrder(orderId, path, newStatus = 'PAGADO') {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ comprobante_url: path, order_status: newStatus })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

/* =========================
   Admin (panel)
   ========================= */

/** Lista de pedidos para admin (con filtros) */
export async function getAdminOrders({ status = null, search = '', limit = 50, from = 0 } = {}) {
  let query = supabase
    .from('pedidos')
    .select(`
      id,
      public_id,
      user_id,
      ataud_id,
      precio_unitario,
      cantidad,
      order_status,
      comprobante_url,
      created_at,
      ataudes:ataud_id ( nombre, precio, slug ),
      ${PROFILES_REL} ( nombre_completo )
    `)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (status && status !== 'Todos') {
    query = query.eq('order_status', status)
  }

  if (search) {
    const term = search.trim()
    if (term) {
      // ✅ Simple y sin errores: buscar solo por folio
      query = query.or(`public_id.ilike.%${term}%`)
    }
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

/** Cambia el estado de un pedido (admin) */
export async function setOrderStatus(id, order_status) {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ order_status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
