import { useEffect, useState } from 'react'

const emptyForm = {
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

function getInitialForm(initialRental) {
  if (!initialRental) {
    return emptyForm
  }

  return {
    customerName: initialRental.customerName || '',
    phone: initialRental.phone || '',
    address: initialRental.address || '',
    partyDate: initialRental.partyDate || '',
    pickupDate: initialRental.pickupDate || '',
    expectedReturnDate: initialRental.expectedReturnDate || '',
    value: String(initialRental.value ?? ''),
    depositPaid: String(initialRental.depositPaid ?? ''),
    notes: initialRental.notes || '',
  }
}

export default function RentalForm({
  dress,
  onSubmit,
  initialRental = null,
  title = 'Registrar aluguel',
  submitLabel = 'Registrar aluguel',
  onCancel,
}) {
  const [formData, setFormData] = useState(() => getInitialForm(initialRental))
  const [error, setError] = useState('')
  const isEditing = Boolean(initialRental)

  useEffect(() => {
    setFormData(getInitialForm(initialRental))
    setError('')
  }, [initialRental])

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

    if (Number(formData.value) <= 0) {
      setError('Informe um valor de aluguel maior que zero.')
      return
    }

    if (Number(formData.depositPaid) > Number(formData.value)) {
      setError('O sinal pago não pode ser maior que o valor do aluguel.')
      return
    }

    onSubmit(dress.id, formData)
    setError('')

    if (!isEditing) {
      setFormData(emptyForm)
    }
  }

  return (
    <>
      <h3>{title}</h3>
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

        <div className="form-actions wide">
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
    </>
  )
}
