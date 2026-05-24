import { requireSupabase } from '../lib/supabaseClient.js'

export const DRESS_PHOTOS_BUCKET = 'dress-photos'
export const MAX_DRESS_PHOTO_SIZE = 3 * 1024 * 1024

const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp']

function getFileExtension(file) {
  const extensionByType = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  return extensionByType[file.type] || 'jpg'
}

function sanitizePathPart(value) {
  return String(value || 'vestido')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function validateDressPhoto(file) {
  if (!file) {
    return { valid: true, message: '' }
  }

  if (!acceptedPhotoTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Escolha uma imagem em JPG, JPEG, PNG ou WEBP.',
    }
  }

  if (file.size > MAX_DRESS_PHOTO_SIZE) {
    return {
      valid: false,
      message: 'A foto deve ter no máximo 3MB. Escolha uma imagem menor.',
    }
  }

  return { valid: true, message: '' }
}

export async function uploadDressPhoto(file, dressCode) {
  if (!file) {
    return ''
  }

  const validation = validateDressPhoto(file)
  if (!validation.valid) {
    throw new Error(validation.message)
  }

  const supabase = requireSupabase()
  const extension = getFileExtension(file)
  const path = `${sanitizePathPart(dressCode)}/${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(DRESS_PHOTOS_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(`Não foi possível enviar a foto: ${error.message}`)
  }

  const { data } = supabase.storage.from(DRESS_PHOTOS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export function getDressPhotoSource(dress) {
  return dress?.fotoUrl || ''
}

// Para bucket privado no futuro, substituir getPublicUrl por createSignedUrl.
