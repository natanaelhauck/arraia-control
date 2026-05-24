import { useEffect, useMemo, useState } from 'react'
import DressImage from './DressImage.jsx'
import {
  readPhotoAsBase64,
  validateDressPhoto,
} from '../services/photoService.js'

const emptyForm = {
  codigo: '',
  tamanho: '',
  cor: '',
  status: 'disponivel',
  observacoes: '',
  fotoUrl: '',
  fotoBase64Dev: '',
}

function getInitialForm(dress) {
  if (!dress) {
    return emptyForm
  }

  return {
    codigo: dress.codigo || '',
    tamanho: dress.tamanho || '',
    cor: dress.cor || '',
    status: dress.status || 'disponivel',
    observacoes: dress.observacoes || '',
    fotoUrl: dress.fotoUrl || '',
    fotoBase64Dev: dress.fotoBase64Dev || '',
  }
}

export default function DressFormModal({ open, dresses, initialDress, onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => getInitialForm(initialDress))
  const [error, setError] = useState('')
  const [isReadingPhoto, setIsReadingPhoto] = useState(false)
  const isEditing = Boolean(initialDress)
  const isRented = initialDress?.status === 'alugado'

  useEffect(() => {
    if (open) {
      setFormData(getInitialForm(initialDress))
      setError('')
      setIsReadingPhoto(false)
    }
  }, [initialDress, open])

  const previewDress = useMemo(
    () => ({
      codigo: formData.codigo || initialDress?.codigo || 'Novo',
      fotoUrl: formData.fotoUrl,
      fotoBase64Dev: formData.fotoBase64Dev,
    }),
    [formData, initialDress],
  )

  if (!open) {
    return null
  }

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    const validation = validateDressPhoto(file)

    if (!validation.valid) {
      setError(validation.message)
      event.target.value = ''
      return
    }

    if (!file) {
      return
    }

    try {
      setIsReadingPhoto(true)
      const base64Photo = await readPhotoAsBase64(file)
      setFormData((current) => ({
        ...current,
        fotoBase64Dev: base64Photo,
        fotoUrl: '',
      }))
      setError('')
    } catch (photoError) {
      setError(photoError.message)
    } finally {
      setIsReadingPhoto(false)
    }
  }

  function removePhoto() {
    setFormData((current) => ({ ...current, fotoUrl: '', fotoBase64Dev: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const codigo = formData.codigo.trim().toUpperCase()
    const codeAlreadyExists = dresses.some(
      (dress) => dress.id !== initialDress?.id && dress.codigo.toUpperCase() === codigo,
    )

    if (!codigo || !formData.tamanho.trim() || !formData.cor.trim()) {
      setError('Preencha código, tamanho e cor antes de salvar.')
      return
    }

    if (codeAlreadyExists) {
      setError('Já existe um vestido com este código.')
      return
    }

    const didSave = onSubmit({
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
            <label className="file-input-label">
              Foto do vestido
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />
            </label>
            <p className="form-hint">JPG, JPEG, PNG ou WEBP. Tamanho máximo: 3MB.</p>
            {formData.fotoBase64Dev || formData.fotoUrl ? (
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
              <button className="button button-primary" type="submit" disabled={isReadingPhoto}>
                {isReadingPhoto ? 'Carregando foto...' : 'Salvar vestido'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
