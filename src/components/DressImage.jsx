export default function DressImage({ dress, size = 'card' }) {
  const className = `dress-image dress-image-${size}`

  if (dress.photoUrl) {
    return (
      <div className={className}>
        <img src={dress.photoUrl} alt={`Vestido ${dress.code}`} />
      </div>
    )
  }

  return (
    <div className={`${className} dress-placeholder`} aria-label={`Vestido ${dress.code}`}>
      <span>{dress.code}</span>
    </div>
  )
}
