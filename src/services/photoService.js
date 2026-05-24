export const MAX_DRESS_PHOTO_SIZE = 3 * 1024 * 1024

const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp']

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

export function readPhotoAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Não foi possível carregar a imagem.'))
    reader.readAsDataURL(file)
  })
}

export function getDressPhotoSource(dress) {
  return dress?.fotoBase64Dev || dress?.fotoUrl || ''
}

// Supabase futura etapa:
// trocar readPhotoAsBase64 por upload no Supabase Storage e retornar a URL pública/assinada.
