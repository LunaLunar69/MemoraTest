import { supabase } from '../../lib/supabase.js'
export async function createMessage({ nombre, email, mensaje }){
const { error } = await supabase.from('contact_messages').insert([{ nombre, email, mensaje }])
if (error) throw error
return true
}