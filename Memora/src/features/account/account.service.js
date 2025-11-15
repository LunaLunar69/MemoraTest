import { supabase } from '../../lib/supabase.js'
export async function getMisPedidos(user_id){
const { data, error } = await supabase.from('pedidos').select('id, public_id, created_at, precio_unitario, order_status, ataudes(nombre)').eq('user_id', user_id).order('created_at', { ascending: false })
if (error) throw error
return data
}