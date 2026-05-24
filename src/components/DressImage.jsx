import { getDressPhotoSource } from '../services/photoService.js'

export default function DressImage({ dress, size = 'card' }) {
  const className = `dress-image dress-image-${size}`
  const photoSource = getDressPhotoSource(dress)
  const code = dress?.codigo || dress?.code || 'Vestido'

  if (photoSource) {
    return (
      <div className={className}>
        <img src={photoSource} alt={`Vestido ${code}`} />
      </div>
    )
  }

  return (
    <div className={`${className} dress-placeholder`} aria-label={`Vestido ${code}`}>
      <span>{code}</span>
    </div>
  )
}
