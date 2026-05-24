import { useEffect, useState } from 'react'

const emptyForm = {
  clienteNome: '',
  clienteTelefone: '',
  clienteEndereco: '',
  dataFesta: '',
  dataRetirada: '',
  dataDevolucaoPrevista: '',
  valor: '',
  sinalPago: '',
  observacoes: '',
}

function getInitialForm(rental) {
  if (!rental) {
    return emptyForm
  }

  return {
    clienteNome: rental.clienteNome || '',
    clienteTelefone: rental.clienteTelefone || '',
    clienteEndereco: rental.clienteEndereco || '',
    dataFesta: rental.dataFesta || '',
    dataRetirada: rental.dataRetirada || '',
    dataDevolucaoPrevista: rental.dataDevolucaoPrevista || '',
    valor: String(rental.valor ?? ''),
    sinalPago: String(rental.sinalPago ?? ''),
    observacoes: rental.observacoes || '',
  }
}

export default function RentalFormModal({
  open,
  dress,
  initialRental,
  isSaving = false,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => getInitialForm(initialRental))
  const [error, setError] = useState('')
  const isEditing = Boolean(initialRental)

  useEffect(() => {
    if (open) {
      setFormData(getInitialForm(initialRental))
      setError('')
    }
  }, [initialRental, open])

  if (!open || !dress) {
    return null
  }

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.clienteNome.trim() || !formData.dataFesta.trim()) {
      setError('Informe o nome da cliente e a data da festa.')
      return
    }

    if (Number(formData.sinalPago || 0) > Number(formData.valor || 0)) {
      setError('O sinal pago não pode ser maior que o valor do aluguel.')
      return
    }

    const didSave = await onSubmit({
      ...formData,
      valor: Number(formData.valor || 0),
      sinalPago: Number(formData.sinalPago || 0),
    })

    if (!didSave) {
      setError('Não foi possível salvar o aluguel agora. Revise os dados e tente novamente.')
    }
  }

  return (
    <div className="modal-backdrop modal-backdrop-top" role="presentation">
      <section className="modal rental-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{isEditing ? 'Correção de dados' : 'Novo aluguel'}</p>
            <h2>{isEditing ? 'Editar aluguel atual' : `Registrar aluguel - ${dress.codigo}`}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>

        <form className="rental-modal-body" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Cliente</h3>
            <div className="form-grid-two">
              <label>
                Nome da cliente
                <input name="clienteNome" value={formData.clienteNome} onChange={updateField} />
              </label>

              <label>
                Telefone
                <input
                  name="clienteTelefone"
                  value={formData.clienteTelefone}
                  onChange={updateField}
                />
              </label>
            </div>

            <label>
              Endereço
              <input
                name="clienteEndereco"
                value={formData.clienteEndereco}
                onChange={updateField}
              />
            </label>
          </div>

          <div className="form-section">
            <h3>Datas e valores</h3>
            <div className="form-grid-two">
              <label>
                Data da festa
                <input
                  name="dataFesta"
                  type="date"
                  value={formData.dataFesta}
                  onChange={updateField}
                />
              </label>

              <label>
                Data de retirada
                <input
                  name="dataRetirada"
                  type="date"
                  value={formData.dataRetirada}
                  onChange={updateField}
                />
              </label>

              <label>
                Devolução prevista
                <input
                  name="dataDevolucaoPrevista"
                  type="date"
                  value={formData.dataDevolucaoPrevista}
                  onChange={updateField}
                />
              </label>

              <label>
                Valor total
                <input
                  name="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor}
                  onChange={updateField}
                />
              </label>

              <label>
                Sinal pago
                <input
                  name="sinalPago"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sinalPago}
                  onChange={updateField}
                />
              </label>
            </div>
          </div>

          <div className="form-section wide">
            <label>
              Observações
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={updateField}
                rows="3"
              />
            </label>
          </div>

          {error ? <p className="form-error wide">{error}</p> : null}

          <div className="form-actions wide">
            <button className="button button-secondary" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="button button-primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : isEditing ? 'Salvar aluguel' : 'Registrar aluguel'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
