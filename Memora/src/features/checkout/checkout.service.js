import { supabase } from '../../lib/supabase.js'


export async function createPedido({ ataud_id, user_id, precio_unitario }){
// TODO: generate public_id like ER-XXXX; insert with status SIN_PAGAR
const { data, error } = await supabase.from('pedidos').insert([{ ataud_id, user_id, precio_unitario }]).select().single()
if (error) throw error
return data
}