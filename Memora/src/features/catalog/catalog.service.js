import { supabase } from '../../lib/supabase.js'


export async function getAtaudes() {
// TODO: add .select fields you need; keep public RLS on table
const { data, error } = await supabase.from('ataudes').select('*').order('created_at', { ascending: false })
if (error) throw error
return data
}