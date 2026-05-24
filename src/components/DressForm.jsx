import { useEffect, useMemo, useState } from 'react'

const emptyForm = {
  code: '',
  size: '',
  color: '',
  photoUrl: '',
  status: 'disponivel',
}

function getInitialForm(initialDress) {
  if (!initialDress) {
    return emptyForm
  }

  return {
    code: initialDress.code || '',
    size: initialDress.size || '',
    color: initialDress.color || '',
    photoUrl: initialDress.photoUrl || '',
    status: initialDress.status || 'disponivel',
  }
}

export default function DressForm({
  dresses,
  onSubmit,
  initialDress = null,
  title = 'Cadastrar vestido',
  eyebrow = 'Novo item',
  submitLabel = 'Salvar vestido',
  onCancel,
  statusLocked = false,
  statusHint = '',
  variant = 'panel',
}) {
  const [formData, setFormData] = useState(() => getInitialForm(initialDress))
  const [error, setError] = useState('')
  const isEditing = Boolean(initialDress)

  useEffect(() => {
    setFormData(getInitialForm(initialDress))
    setError('')
  }, [initialDress])

  const statusOptions = useMemo(() => {
    if (statusLocked) {
      return [{ value: formData.status, label: 'Alugado' }]
    }

    return [
      { value: 'disponivel', label: 'Disponível' },
      { value: 'reservado', label: 'Reservado' },
    ]
  }, [formData.status, statusLocked])

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const code = formData.code.trim().toUpperCase()
    const codeAlreadyExists = dresses.some(
      (dress) => dress.id !== initialDress?.id && dress.code.toUpperCase() === code,
    )

    if (!code || !formData.size.trim() || !formData.color.trim()) {
      setError('Preencha código, tamanho e cor.')
      return
    }

    if (codeAlreadyExists) {
      setError('Já existe um vestido com este código.')
      return
    }

    onSubmit(formData)
    setError('')

    if (!isEditing) {
      setFormData(emptyForm)
    }
  }

  const Wrapper = variant === 'panel' ? 'section' : 'div'

  return (
    <Wrapper className={variant === 'panel' ? 'form-panel' : 'inline-form'}>
      <div className="section-heading tight">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit}>
        <label>
          Código
          <input
            name="code"
            value={formData.code}
            onChange={updateField}
            placeholder="A23"
            autoComplete="off"
          />
        </label>

        <label>
          Tamanho
          <input
            name="size"
            value={formData.size}
            onChange={updateField}
            placeholder="P, M, G ou Infantil 10"
          />
        </label>

        <label>
          Cor
          <input
            name="color"
            value={formData.color}
            onChange={updateField}
            placeholder="Vermelho com branco"
          />
        </label>

        <label>
          Foto
          <input
            name="photoUrl"
            value={formData.photoUrl}
            onChange={updateField}
            placeholder="URL da foto, opcional"
          />
        </label>

        <label>
          Status
          <select
            name="status"
            value={formData.status}
            onChange={updateField}
            disabled={statusLocked}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {statusHint ? <p className="form-hint">{statusHint}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          {onCancel ? (
            <button className="button button-secondary" type="button" onClick={onCancel}>
              Cancelar
            </button>
          ) : null}
          <button className="button button-primary" type="submit">
            {submitLabel}
          </button>
        </div>
      </form>
    </Wrapper>
  )
}
