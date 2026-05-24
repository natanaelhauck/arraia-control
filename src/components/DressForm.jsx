import { useState } from 'react'

const initialForm = {
  code: '',
  size: '',
  color: '',
  photoUrl: '',
  status: 'disponivel',
}

export default function DressForm({ dresses, onSubmit }) {
  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const code = formData.code.trim().toUpperCase()
    const codeAlreadyExists = dresses.some((dress) => dress.code.toUpperCase() === code)

    if (!code || !formData.size.trim() || !formData.color.trim()) {
      setError('Preencha código, tamanho e cor.')
      return
    }

    if (codeAlreadyExists) {
      setError('Já existe um vestido com este código.')
      return
    }

    onSubmit(formData)
    setFormData(initialForm)
    setError('')
  }

  return (
    <section className="form-panel" aria-labelledby="new-dress-title">
      <div className="section-heading tight">
        <div>
          <p className="eyebrow">Novo item</p>
          <h2 id="new-dress-title">Cadastrar vestido</h2>
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
          <select name="status" value={formData.status} onChange={updateField}>
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
          </select>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="button button-primary" type="submit">
          Salvar vestido
        </button>
      </form>
    </section>
  )
}
