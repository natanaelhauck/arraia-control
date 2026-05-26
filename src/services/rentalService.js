import { requireSupabase } from '../lib/supabaseClient.js'
import { sanitizeMultilineText, sanitizeText } from './sanitizeService.js'
import {
  calculateVisualDressStatus,
  findConflictingRental,
  getTodayString,
} from '../utils/rentalSchedule.js'

const RENTAL_CONFLICT_MESSAGE =
  'Esta peça já possui aluguel/reserva nesse período. Escolha outra data ou verifique a agenda.'

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
  return getTodayString()
}

function validateRentalPeriod(payload) {
  const periodStart = payload.pickup_date || payload.party_date
  const periodEnd = payload.expected_return_date || payload.party_date

  if (periodStart && periodEnd && periodEnd < periodStart) {
    throw new Error('A devolução prevista não pode ser antes do início do período.')
  }
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

async function fetchActiveRentalsForDress(dressId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('rentals')
    .select('id, status, party_date, pickup_date, expected_return_date')
    .eq('dress_id', dressId)
    .eq('status', 'ativo')

  if (error) {
    throw new Error(
      getFriendlySupabaseMessage('Não foi possível verificar a agenda da peça', error),
    )
  }

  return data || []
}

async function ensureRentalDoesNotConflict(dressId, rentalData, ignoredRentalId = null) {
  const activeRentals = await fetchActiveRentalsForDress(dressId)
  const conflictingRental = findConflictingRental(activeRentals, rentalData, ignoredRentalId)

  if (conflictingRental) {
    throw new Error(RENTAL_CONFLICT_MESSAGE)
  }
}

async function syncDressStatusFromRentals(dressId) {
  const supabase = requireSupabase()
  const activeRentals = await fetchActiveRentalsForDress(dressId)
  const status = calculateVisualDressStatus('disponivel', activeRentals)

  const { error } = await supabase.from('dresses').update({ status }).eq('id', dressId)

  if (error) {
    throw new Error(
      getFriendlySupabaseMessage(
        'Aluguel atualizado, mas o status da peça não foi sincronizado',
        error,
      ),
    )
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

  validateRentalPeriod(payload)
  await ensureRentalDoesNotConflict(dressId, payload)

  const { error: rentalError } = await supabase.from('rentals').insert({
    ...payload,
    status: 'ativo',
  })

  if (rentalError) {
    throw new Error(getFriendlySupabaseMessage('Não foi possível registrar o aluguel', rentalError))
  }

  await syncDressStatusFromRentals(dressId)
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

  validateRentalPeriod(payload)
  await ensureRentalDoesNotConflict(rentalData.vestidoId, payload, rentalId)

  const { error } = await supabase
    .from('rentals')
    .update(payload)
    .eq('id', rentalId)

  if (error) {
    throw new Error(getFriendlySupabaseMessage('Não foi possível atualizar o aluguel', error))
  }

  await syncDressStatusFromRentals(rentalData.vestidoId)
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

  await syncDressStatusFromRentals(rental.vestidoId)
}

export async function cancelRental(rental) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('rentals')
    .update({ status: 'cancelado' })
    .eq('id', rental.id)

  if (error) {
    throw new Error(getFriendlySupabaseMessage('Não foi possível cancelar o aluguel', error))
  }

  await syncDressStatusFromRentals(rental.vestidoId)
}
