import { requireSupabase } from '../lib/supabaseClient.js'
import { sanitizeMultilineText, sanitizeText } from './sanitizeService.js'

function normalizeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function mapRentalToDb(rentalData, dressId) {
  return {
    dress_id: dressId,
    customer_name: sanitizeText(rentalData.clienteNome),
    customer_phone: sanitizeText(rentalData.clienteTelefone),
    customer_address: sanitizeText(rentalData.clienteEndereco),
    customer_cpf: sanitizeText(rentalData.clienteCpf),
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
    throw new Error(`Não foi possível carregar os aluguéis: ${error.message}`)
  }

  return data.map(mapRentalRow)
}

export async function createRental(dressId, rentalData) {
  const supabase = requireSupabase()
  const payload = mapRentalToDb(rentalData, dressId)

  if (!payload.customer_name || !payload.party_date) {
    throw new Error('Informe o nome da cliente e a data da festa.')
  }

  const { data: activeRental, error: activeError } = await supabase
    .from('rentals')
    .select('id')
    .eq('dress_id', dressId)
    .eq('status', 'ativo')
    .maybeSingle()

  if (activeError) {
    throw new Error(`Não foi possível verificar aluguel ativo: ${activeError.message}`)
  }

  if (activeRental) {
    throw new Error('Este vestido já possui um aluguel ativo.')
  }

  const { error: rentalError } = await supabase.from('rentals').insert({
    ...payload,
    status: 'ativo',
  })

  if (rentalError) {
    throw new Error(`Não foi possível registrar o aluguel: ${rentalError.message}`)
  }

  const { error: dressError } = await supabase
    .from('dresses')
    .update({ status: 'alugado' })
    .eq('id', dressId)

  if (dressError) {
    throw new Error(
      `Aluguel criado, mas o status do vestido não foi atualizado: ${dressError.message}`,
    )
  }
}

export async function updateRental(rentalId, rentalData) {
  const supabase = requireSupabase()
  const { dress_id: _dressId, ...payload } = mapRentalToDb(rentalData, rentalData.vestidoId)

  if (!payload.customer_name || !payload.party_date) {
    throw new Error('Informe o nome da cliente e a data da festa.')
  }

  const { error } = await supabase
    .from('rentals')
    .update(payload)
    .eq('id', rentalId)

  if (error) {
    throw new Error(`Não foi possível atualizar o aluguel: ${error.message}`)
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
    throw new Error(`Não foi possível marcar a devolução: ${rentalError.message}`)
  }

  const { error: dressError } = await supabase
    .from('dresses')
    .update({ status: 'disponivel' })
    .eq('id', rental.vestidoId)

  if (dressError) {
    throw new Error(
      `Devolução registrada, mas o vestido não voltou para disponível: ${dressError.message}`,
    )
  }
}
