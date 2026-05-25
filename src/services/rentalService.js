import { requireSupabase } from '../lib/supabaseClient.js'
import { sanitizeMultilineText, sanitizeText } from './sanitizeService.js'

function normalizeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function buildCustomerAddress(rentalData) {
  const street = sanitizeText(rentalData.clienteRua)
  const number = sanitizeText(rentalData.clienteNumero)
  const complement = sanitizeText(rentalData.clienteComplemento)
  const neighborhood = sanitizeText(rentalData.clienteBairro)
  const city = sanitizeText(rentalData.clienteCidade)
  const streetLine = [street, number].filter(Boolean).join(', ')
  const details = [complement, neighborhood, city].filter(Boolean).join(' - ')

  return [streetLine, details].filter(Boolean).join(' - ') || sanitizeText(rentalData.clienteEndereco)
}

function getFriendlySupabaseMessage(action, error) {
  console.error(action, error)
  return `${action}. Verifique os dados e tente novamente.`
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function mapRentalToDb(rentalData, dressId) {
  return {
    dress_id: dressId,
    customer_name: sanitizeText(rentalData.clienteNome),
    customer_phone: sanitizeText(rentalData.clienteTelefone),
    customer_cpf: sanitizeText(rentalData.clienteCpf),
    customer_street: sanitizeText(rentalData.clienteRua),
    customer_number: sanitizeText(rentalData.clienteNumero),
    customer_address_complement: sanitizeText(rentalData.clienteComplemento),
    customer_neighborhood: sanitizeText(rentalData.clienteBairro),
    customer_city: sanitizeText(rentalData.clienteCidade),
    customer_address: buildCustomerAddress(rentalData),
    party_date: sanitizeText(rentalData.dataFesta) || null,
    pickup_date: sanitizeText(rentalData.dataRetirada) || null,
    expected_return_date: sanitizeText(rentalData.dataDevolucaoPrevista) || null,
    total_amount: normalizeNumber(rentalData.valor),
    deposit_amount: normalizeNumber(rentalData.sinalPago),
    notes: sanitizeMultilineText(rentalData.observacoes),
  }
}

export function mapRentalRow(row) {
  return {
    id: row.id,
    vestidoId: row.dress_id,
    clienteNome: row.customer_name || '',
    clienteTelefone: row.customer_phone || '',
    clienteEndereco: row.customer_address || '',
    clienteCpf: row.customer_cpf || '',
    clienteRua: row.customer_street || '',
    clienteNumero: row.customer_number || '',
    clienteComplemento: row.customer_address_complement || '',
    clienteBairro: row.customer_neighborhood || '',
    clienteCidade: row.customer_city || '',
    dataFesta: row.party_date || '',
    dataRetirada: row.pickup_date || '',
    dataDevolucaoPrevista: row.expected_return_date || '',
    dataDevolucaoReal: row.actual_return_date || '',
    valor: normalizeNumber(row.total_amount),
    sinalPago: normalizeNumber(row.deposit_amount),
    observacoes: row.notes || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchRentals() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(getFriendlySupabaseMessage('Não foi possível carregar os aluguéis', error))
  }

  return data.map(mapRentalRow)
}

export async function createRental(dressId, rentalData) {
  const supabase = requireSupabase()
  const payload = mapRentalToDb(rentalData, dressId)

  if (!payload.customer_name || !payload.party_date) {
    throw new Error('Informe o nome da cliente e a data da festa.')
  }

  if (!payload.customer_street || !payload.customer_number) {
    throw new Error('Informe rua e número do endereço.')
  }

  const { data: activeRental, error: activeError } = await supabase
    .from('rentals')
    .select('id')
    .eq('dress_id', dressId)
    .eq('status', 'ativo')
    .maybeSingle()

  if (activeError) {
    throw new Error(
      getFriendlySupabaseMessage('Não foi possível verificar se já existe aluguel ativo', activeError),
    )
  }

  if (activeRental) {
    throw new Error('Este vestido já possui um aluguel ativo.')
  }

  const { error: rentalError } = await supabase.from('rentals').insert({
    ...payload,
    status: 'ativo',
  })

  if (rentalError) {
    throw new Error(getFriendlySupabaseMessage('Não foi possível registrar o aluguel', rentalError))
  }

  const { error: dressError } = await supabase
    .from('dresses')
    .update({ status: 'alugado' })
    .eq('id', dressId)

  if (dressError) {
    throw new Error(
      getFriendlySupabaseMessage(
        'Aluguel criado, mas o status do vestido não foi atualizado',
        dressError,
      ),
    )
  }
}

export async function updateRental(rentalId, rentalData) {
  const supabase = requireSupabase()
  const { dress_id: _dressId, ...payload } = mapRentalToDb(rentalData, rentalData.vestidoId)

  if (!payload.customer_name || !payload.party_date) {
    throw new Error('Informe o nome da cliente e a data da festa.')
  }

  if (!payload.customer_street || !payload.customer_number) {
    throw new Error('Informe rua e número do endereço.')
  }

  const { error } = await supabase
    .from('rentals')
    .update(payload)
    .eq('id', rentalId)

  if (error) {
    throw new Error(getFriendlySupabaseMessage('Não foi possível atualizar o aluguel', error))
  }
}

export async function markRentalReturned(rental) {
  const supabase = requireSupabase()
  const { error: rentalError } = await supabase
    .from('rentals')
    .update({
      status: 'devolvido',
      actual_return_date: getTodayDate(),
    })
    .eq('id', rental.id)

  if (rentalError) {
    throw new Error(getFriendlySupabaseMessage('Não foi possível marcar a devolução', rentalError))
  }

  const { error: dressError } = await supabase
    .from('dresses')
    .update({ status: 'disponivel' })
    .eq('id', rental.vestidoId)

  if (dressError) {
    throw new Error(
      getFriendlySupabaseMessage(
        'Devolução registrada, mas o vestido não voltou para disponível',
        dressError,
      ),
    )
  }
}
