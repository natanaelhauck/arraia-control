import { useState } from 'react'

const initialForm = {
  customerName: '',
  phone: '',
  address: '',
  partyDate: '',
  pickupDate: '',
  expectedReturnDate: '',
  value: '',
  depositPaid: '',
  notes: '',
}

export default function RentalForm({ dress, onSubmit }) {
  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const requiredFields = [
      'customerName',
      'phone',
      'address',
      'partyDate',
      'pickupDate',
      'expectedReturnDate',
      'value',
      'depositPaid',
    ]
    const hasMissingField = requiredFields.some((field) => String(formData[field]).trim() === '')

    if (hasMissingField) {
      setError('Preencha todos os campos obrigatórios do aluguel.')
      return
    }

    if (Number(formData.depositPaid) > Number(formData.value)) {
      setError('O sinal pago não pode ser maior que o valor do aluguel.')
      return
    }

    onSubmit(dress.id, formData)
    setFormData(initialForm)
    setError('')
  }

  return (
    <>
      <h3>Registrar aluguel</h3>
      <form className="rental-form" onSubmit={handleSubmit}>
        <label>
          Nome da cliente
          <input name="customerName" value={formData.customerName} onChange={updateField} />
        </label>

        <label>
          Telefone
          <input name="phone" value={formData.phone} onChange={updateField} />
        </label>

        <label className="wide">
          Endereço
          <input name="address" value={formData.address} onChange={updateField} />
        </label>

        <label>
          Data da festa
          <input
            name="partyDate"
            type="date"
            value={formData.partyDate}
            onChange={updateField}
          />
        </label>

        <label>
          Data de retirada
          <input
            name="pickupDate"
            type="date"
            value={formData.pickupDate}
            onChange={updateField}
          />
        </label>

        <label>
          Devolução prevista
          <input
            name="expectedReturnDate"
            type="date"
            value={formData.expectedReturnDate}
            onChange={updateField}
          />
        </label>

        <label>
          Valor
          <input
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={formData.value}
            onChange={updateField}
          />
        </label>

        <label>
          Sinal pago
          <input
            name="depositPaid"
            type="number"
            min="0"
            step="0.01"
            value={formData.depositPaid}
            onChange={updateField}
          />
        </label>

        <label className="wide">
          Observações
          <textarea name="notes" value={formData.notes} onChange={updateField} rows="3" />
        </label>

        {error ? <p className="form-error wide">{error}</p> : null}

        <button className="button button-primary wide" type="submit">
          Registrar aluguel
        </button>
      </form>
    </>
  )
}
