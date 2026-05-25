import { useEffect, useMemo, useRef, useState } from 'react'
import DressImage from './DressImage.jsx'
import { validateDressPhoto } from '../services/imageService.js'
import { DEFAULT_PIECE_TYPE, pieceTypeOptions } from '../utils/pieceTypes.js'

const emptyForm = {
  codigo: '',
  tipoPeca: DEFAULT_PIECE_TYPE,
  tamanho: '',
  cor: '',
  status: 'disponivel',
  observacoes: '',
  fotoUrl: '',
  fotoArquivo: null,
}

function getInitialForm(dress) {
  if (!dress) {
    return emptyForm
  }

  return {
    codigo: dress.codigo || '',
    tipoPeca: dress.tipoPeca || DEFAULT_PIECE_TYPE,
    tamanho: dress.tamanho || '',
    cor: dress.cor || '',
    status: dress.status || 'disponivel',
    observacoes: dress.observacoes || '',
    fotoUrl: dress.fotoUrl || '',
    fotoArquivo: null,
  }
}

export default function DressFormModal({
  open,
  dresses,
  initialDress,
  isSaving = false,
  onClose,
  onSubmit,
}) {
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(() => getInitialForm(initialDress))
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const isEditing = Boolean(initialDress)
  const isRented = initialDress?.status === 'alugado'

  useEffect(() => {
    if (!open) {
      return undefined
    }

    setFormData(getInitialForm(initialDress))
    setError('')
    setPreviewUrl('')
    setIsDragActive(false)

    return undefined
  }, [initialDress, open])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const previewDress = useMemo(
    () => ({
      codigo: formData.codigo || initialDress?.codigo || 'Novo',
      fotoUrl: previewUrl || formData.fotoUrl,
    }),
    [formData, initialDress, previewUrl],
  )

  if (!open) {
    return null
  }

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function setPhotoFile(file) {
    const validation = validateDressPhoto(file)

    if (!validation.valid) {
      setError(validation.message)
      return
    }

    if (!file) {
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(URL.createObjectURL(file))
    setFormData((current) => ({
      ...current,
      fotoArquivo: file,
      fotoUrl: current.fotoUrl,
    }))
    setError('')
  }

  function handlePhotoChange(event) {
    setPhotoFile(event.target.files?.[0])
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragActive(false)
    setPhotoFile(event.dataTransfer.files?.[0])
  }

  function removePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl('')
    setFormData((current) => ({ ...current, fotoUrl: '', fotoArquivo: null }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const codigo = formData.codigo.trim().toUpperCase()
    const codeAlreadyExists = dresses.some(
      (dress) => dress.id !== initialDress?.id && dress.codigo.toUpperCase() === codigo,
    )

    if (!codigo || !formData.tipoPeca || !formData.tamanho.trim() || !formData.cor.trim()) {
      setError('Preencha código, tipo de peça, tamanho e cor antes de salvar.')
      return
    }

    if (codeAlreadyExists) {
      setError('Já existe um vestido com este código.')
      return
    }

    const didSave = await onSubmit({
      ...formData,
      codigo,
    })

    if (!didSave) {
      setError('Não foi possível salvar agora. Revise os dados e tente novamente.')
    }
  }

  return (
    <div className="modal-backdrop modal-backdrop-top" role="presentation">
      <section className="modal form-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{isEditing ? 'Editar vestido' : 'Novo cadastro'}</p>
            <h2>{isEditing ? `Vestido ${initialDress.codigo}` : 'Cadastrar vestido'}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>

        <form className="modal-form-grid" onSubmit={handleSubmit}>
          <div className="photo-upload-panel">
            <DressImage dress={previewDress} size="large" />
            <button
              className={`upload-dropzone ${isDragActive ? 'is-drag-active' : ''}`}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragActive(true)
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
            >
              <span className="upload-icon" aria-hidden="true">
                ↑
              </span>
              <strong>Clique para selecionar ou arraste uma foto</strong>
              <small>JPG, PNG ou WEBP até 3MB</small>
            </button>
            <input
              ref={fileInputRef}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
            />
            {formData.fotoArquivo ? (
              <p className="form-hint">Arquivo selecionado: {formData.fotoArquivo.name}</p>
            ) : null}
            {previewUrl || formData.fotoUrl ? (
              <button className="button button-secondary" type="button" onClick={removePhoto}>
                Remover foto
              </button>
            ) : null}
          </div>

          <div className="modal-form-fields">
            <div className="form-grid-two">
              <label>
                Código do vestido
                <input
                  name="codigo"
                  value={formData.codigo}
                  onChange={updateField}
                  placeholder="A23"
                  autoComplete="off"
                />
              </label>

              <label>
                Tipo de peça
                <select
                  name="tipoPeca"
                  value={formData.tipoPeca}
                  onChange={updateField}
                  required
                >
                  {pieceTypeOptions.map((pieceType) => (
                    <option key={pieceType} value={pieceType}>
                      {pieceType}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tamanho
                <input
                  name="tamanho"
                  value={formData.tamanho}
                  onChange={updateField}
                  placeholder="P, M, G ou Infantil 10"
                />
              </label>

              <label>
                Cor
                <input
                  name="cor"
                  value={formData.cor}
                  onChange={updateField}
                  placeholder="Vermelho com branco"
                />
              </label>

              <label>
                {isEditing ? 'Status' : 'Status inicial'}
                <select
                  name="status"
                  value={isRented ? 'alugado' : formData.status}
                  onChange={updateField}
                  disabled={isRented}
                >
                  {isRented ? <option value="alugado">Alugado</option> : null}
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                </select>
              </label>
            </div>

            {isRented ? (
              <p className="form-hint">O status fica como alugado enquanto existir aluguel ativo.</p>
            ) : null}

            <label>
              Observações
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={updateField}
                rows="4"
                placeholder="Detalhes de ajuste, acessórios ou condição do vestido"
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="form-actions">
              <button className="button button-secondary" type="button" onClick={onClose}>
                Cancelar
              </button>
              <button className="button button-primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar vestido'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
