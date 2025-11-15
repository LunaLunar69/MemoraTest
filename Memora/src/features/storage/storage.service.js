// src/features/storage/storage.service.js
import { supabase } from '../../lib/supabase'

// util slugify para filenames seguros
export function slugify(str = '') {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function uploadAtaudImage(file, { slug, folder = '' } = {}) {
  if (!file) throw new Error('No file')
  const safeSlug = slugify(slug || file.name.split('.')[0])
  const ts = Date.now()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${folder ? folder + '/' : ''}${safeSlug}/${ts}.${ext}`

  // Sube al bucket "ataudes"
  const { error: upErr } = await supabase.storage
    .from('ataudes')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (upErr) throw upErr

  // Si el bucket es público:
  const { data } = supabase.storage.from('ataudes').getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }

  // Si lo tuvieras privado, usarías:
  // const { data: signed } = await supabase.storage.from('ataudes').createSignedUrl(path, 60*60*24)
  // return { path, publicUrl: signed.signedUrl }
}
