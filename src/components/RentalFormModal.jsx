import { useEffect, useState } from 'react'

const emptyForm = {
  clienteNome: '',
  clienteTelefone: '',
  clienteCpf: '',
  clienteRua: '',
  clienteNumero: '',
  clienteComplemento: '',
  clienteBairro: '',
  clienteCidade: '',
  dataFesta: '',
  dataRetirada: '',
  dataDevolucaoPrevista: '',
  valor: '',
  sinalPago: '',
  observacoes: '',
}

function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) {
    return digits ? `(${digits}` : ''
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

function isValidCpf(value) {
  const cpf = onlyDigits(value)

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const calculateDigit = (factor) => {
    let total = 0

    for (let index = 0; index < factor - 1; index += 1) {
      total += Number(cpf[index]) * (factor - index)
    }

    const rest = (total * 10) % 11
    return rest === 10 ? 0 : rest
  }

  return calculateDigit(10) === Number(cpf[9]) && calculateDigit(11) === Number(cpf[10])
}

function formatCurrencyInput(value) {
  const digits = onlyDigits(value)
  const amount = Number(digits || 0) / 100

  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function moneyDigitsFromNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? String(Math.round(number * 100)) : ''
}

function moneyDigitsToNumber(value) {
  return Number(onlyDigits(value) || 0) / 100
}

function getInitialForm(rental) {
  if (!rental) {
    return emptyForm
  }

  return {
    clienteNome: rental.clienteNome || '',
    clienteTelefone: onlyDigits(rental.clienteTelefone),
    clienteCpf: onlyDigits(rental.clienteCpf),
    clienteRua: rental.clienteRua || '',
    clienteNumero: rental.clienteNumero || '',
    clienteComplemento: rental.clienteComplemento || '',
    clienteBairro: rental.clienteBairro || '',
    clienteCidade: rental.clienteCidade || '',
    dataFesta: rental.dataFesta || '',
    dataRetirada: rental.dataRetirada || '',
    dataDevolucaoPrevista: rental.dataDevolucaoPrevista || '',
    valor: moneyDigitsFromNumber(rental.valor),
    sinalPago: moneyDigitsFromNumber(rental.sinalPago),
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

  function updateDigitsField(event) {
    const { name, value } = event.target
    const limit = name === 'clienteTelefone' ? 11 : 11
    setFormData((current) => ({ ...current, [name]: onlyDigits(value).slice(0, limit) }))
  }

  function updateMoneyField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: onlyDigits(value).slice(0, 10) }))
  }

  function validateForm() {
    const nameWords = formData.clienteNome.trim().split(/\s+/).filter(Boolean)
    const phoneDigits = onlyDigits(formData.clienteTelefone)
    const cpfDigits = onlyDigits(formData.clienteCpf)
    const valor = moneyDigitsToNumber(formData.valor)
    const sinalPago = moneyDigitsToNumber(formData.sinalPago)

    if (nameWords.length < 2) {
      return 'Informe nome e sobrenome da cliente.'
    }

    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      return 'Informe um telefone com 10 ou 11 dígitos.'
    }

    if (cpfDigits && !isValidCpf(cpfDigits)) {
      return 'Informe um CPF válido com 11 dígitos.'
    }

    if (!formData.clienteRua.trim() || !formData.clienteNumero.trim()) {
      return 'Informe rua e número do endereço.'
    }

    if (!formData.dataFesta.trim()) {
      return 'Informe a data da festa.'
    }

    if (valor < 0 || sinalPago < 0) {
      return 'Os valores não podem ser negativos.'
    }

    if (sinalPago > valor) {
      return 'O sinal pago não pode ser maior que o valor total.'
    }

    if (
      formData.dataRetirada &&
      formData.dataDevolucaoPrevista &&
      formData.dataDevolucaoPrevista < formData.dataRetirada
    ) {
      return 'A devolução prevista não pode ser antes da retirada.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationMessage = validateForm()

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    const didSave = await onSubmit({
      ...formData,
      clienteTelefone: onlyDigits(formData.clienteTelefone),
      clienteCpf: onlyDigits(formData.clienteCpf),
      valor: moneyDigitsToNumber(formData.valor),
      sinalPago: moneyDigitsToNumber(formData.sinalPago),
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
            <h3>Dados da cliente</h3>
            <div className="form-grid-two">
              <label>
                Nome da cliente
                <input
                  name="clienteNome"
                  value={formData.clienteNome}
                  onChange={updateField}
                  placeholder="Nome e sobrenome"
                />
              </label>

              <label>
                Telefone
                <input
                  name="clienteTelefone"
                  inputMode="numeric"
                  value={formatPhone(formData.clienteTelefone)}
                  onChange={updateDigitsField}
                  placeholder="(31) 9 0000-0000"
                />
              </label>

              <label>
                CPF
                <input
                  name="clienteCpf"
                  inputMode="numeric"
                  value={formatCpf(formData.clienteCpf)}
                  onChange={updateDigitsField}
                  placeholder="000.000.000-00"
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Endereço</h3>
            <div className="form-grid-address">
              <label className="address-street">
                Rua
                <input name="clienteRua" value={formData.clienteRua} onChange={updateField} />
              </label>

              <label>
                Número
                <input name="clienteNumero" value={formData.clienteNumero} onChange={updateField} />
              </label>

              <label>
                Complemento
                <input
                  name="clienteComplemento"
                  value={formData.clienteComplemento}
                  onChange={updateField}
                  placeholder="Opcional"
                />
              </label>

              <label>
                Bairro
                <input name="clienteBairro" value={formData.clienteBairro} onChange={updateField} />
              </label>

              <label>
                Cidade
                <input name="clienteCidade" value={formData.clienteCidade} onChange={updateField} />
              </label>
            </div>
          </div>

          <div className="form-section wide">
            <h3>Datas e valores</h3>
            <div className="form-grid-three">
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
                <span className="money-input">
                  <span>R$</span>
                  <input
                    name="valor"
                    inputMode="numeric"
                    value={formatCurrencyInput(formData.valor)}
                    onChange={updateMoneyField}
                  />
                </span>
              </label>

              <label>
                Sinal pago
                <span className="money-input">
                  <span>R$</span>
                  <input
                    name="sinalPago"
                    inputMode="numeric"
                    value={formatCurrencyInput(formData.sinalPago)}
                    onChange={updateMoneyField}
                  />
                </span>
              </label>
            </div>
          </div>

          <div className="form-section wide">
            <h3>Observações</h3>
            <label>
              Observações do aluguel
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
