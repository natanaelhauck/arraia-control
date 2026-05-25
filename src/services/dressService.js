import { requireSupabase } from '../lib/supabaseClient.js'
import { uploadDressPhoto } from './imageService.js'
import { fetchRentals } from './rentalService.js'
import { sanitizeMultilineText, sanitizeText } from './sanitizeService.js'
import { DEFAULT_PIECE_TYPE, pieceTypeOptions } from '../utils/pieceTypes.js'

const manualStatuses = ['disponivel', 'reservado']

function mapDressRow(row) {
  return {
    id: row.id,
    codigo: row.code || '',
    tipoPeca: row.piece_type || DEFAULT_PIECE_TYPE,
    tamanho: row.size || '',
    cor: row.color || '',
    status: row.status,
    observacoes: row.notes || '',
    fotoUrl: row.photo_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function composeDress(dress, rentals) {
  const currentRental = rentals.find(
    (rental) => rental.vestidoId === dress.id && rental.status === 'ativo',
  )
  const rentalHistory = rentals
    .filter((rental) => rental.vestidoId === dress.id && rental.status !== 'ativo')
    .sort((first, second) => String(second.updatedAt).localeCompare(String(first.updatedAt)))

  return {
    ...dress,
    status: currentRental ? 'alugado' : dress.status,
    currentRental: currentRental || null,
    rentalHistory,
  }
}

async function ensureCodeIsAvailable(code, ignoredDressId = null) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('dresses')
    .select('id')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    throw new Error(`Não foi possível verificar o código do vestido: ${error.message}`)
  }

  if (data && data.id !== ignoredDressId) {
    throw new Error('Já existe um vestido com este código.')
  }
}

function normalizeDressPayload(dressData, photoUrl) {
  const code = sanitizeText(dressData.codigo).toUpperCase()
  const pieceType = sanitizeText(dressData.tipoPeca || DEFAULT_PIECE_TYPE)

  if (!code) {
    throw new Error('Informe o código do vestido.')
  }

  if (!pieceTypeOptions.includes(pieceType)) {
    throw new Error('Informe um tipo de peça válido.')
  }

  if (!sanitizeText(dressData.tamanho) || !sanitizeText(dressData.cor)) {
    throw new Error('Preencha tamanho e cor antes de salvar.')
  }

  return {
    code,
    piece_type: pieceType,
    size: sanitizeText(dressData.tamanho).toUpperCase(),
    color: sanitizeText(dressData.cor),
    status: manualStatuses.includes(dressData.status) ? dressData.status : 'disponivel',
    notes: sanitizeMultilineText(dressData.observacoes),
    photo_url: photoUrl || null,
  }
}

export async function fetchDresses() {
  const supabase = requireSupabase()
  const [{ data: dressRows, error: dressError }, rentals] = await Promise.all([
    supabase.from('dresses').select('*').order('created_at', { ascending: false }),
    fetchRentals(),
  ])

  if (dressError) {
    throw new Error(`Não foi possível carregar os vestidos: ${dressError.message}`)
  }

  return dressRows.map(mapDressRow).map((dress) => composeDress(dress, rentals))
}

export async function createDress(dressData) {
  const supabase = requireSupabase()
  const code = sanitizeText(dressData.codigo).toUpperCase()
  await ensureCodeIsAvailable(code)

  const photoUrl = dressData.fotoArquivo ? await uploadDressPhoto(dressData.fotoArquivo, code) : ''
  const payload = normalizeDressPayload(dressData, photoUrl)

  const { error } = await supabase.from('dresses').insert(payload)

  if (error) {
    throw new Error(`Não foi possível cadastrar o vestido: ${error.message}`)
  }
}

export async function updateDress(dressId, dressData) {
  const supabase = requireSupabase()
  const code = sanitizeText(dressData.codigo).toUpperCase()
  await ensureCodeIsAvailable(code, dressId)

  const photoUrl = dressData.fotoArquivo
    ? await uploadDressPhoto(dressData.fotoArquivo, code)
    : dressData.fotoUrl || ''
  const payload = normalizeDressPayload(dressData, photoUrl)
  const status = dressData.status === 'alugado' ? 'alugado' : payload.status

  const { error } = await supabase
    .from('dresses')
    .update({ ...payload, status })
    .eq('id', dressId)

  if (error) {
    throw new Error(`Não foi possível atualizar o vestido: ${error.message}`)
  }
}

export async function deleteDress(dressId) {
  const supabase = requireSupabase()
  const { error } = await supabase.from('dresses').delete().eq('id', dressId)

  if (error) {
    throw new Error(`Não foi possível excluir o vestido: ${error.message}`)
  }
}
