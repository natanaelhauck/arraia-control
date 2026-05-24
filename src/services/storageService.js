import { initialDatabase } from '../data/initialDresses.js'

const DATABASE_KEY = 'arraia-control:database'
const LEGACY_DRESSES_KEY = 'arraia-control:dresses'
const manualDressStatuses = ['disponivel', 'reservado']
const allDressStatuses = ['disponivel', 'reservado', 'alugado']
const rentalStatuses = ['ativo', 'devolvido']

function hasLocalStorage() {
  return typeof localStorage !== 'undefined'
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createId(prefix) {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function now() {
  return new Date().toISOString()
}

export function sanitizeText(value) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeMultilineText(value) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function normalizeVestido(rawVestido, index = 0) {
  const source = rawVestido && typeof rawVestido === 'object' ? rawVestido : {}
  const codigo = sanitizeText(source.codigo ?? source.code ?? `V${index + 1}`).toUpperCase()
  const status = allDressStatuses.includes(source.status) ? source.status : 'disponivel'
  const timestamp = source.createdAt || now()

  return {
    id: source.id || createId('dress'),
    codigo,
    tamanho: sanitizeText(source.tamanho ?? source.size).toUpperCase(),
    cor: sanitizeText(source.cor ?? source.color),
    status,
    observacoes: sanitizeMultilineText(source.observacoes ?? source.notes),
    fotoUrl: sanitizeText(source.fotoUrl ?? source.photoUrl),
    fotoBase64Dev: source.fotoBase64Dev || '',
    createdAt: timestamp,
    updatedAt: source.updatedAt || timestamp,
  }
}

function normalizeAluguel(rawAluguel, vestidoId = '') {
  if (!rawAluguel || typeof rawAluguel !== 'object') {
    return null
  }

  const timestamp = rawAluguel.createdAt || rawAluguel.startedAt || now()
  const status = rentalStatuses.includes(rawAluguel.status)
    ? rawAluguel.status
    : rawAluguel.returnedAt || rawAluguel.dataDevolucaoReal
      ? 'devolvido'
      : 'ativo'

  return {
    id: rawAluguel.id || createId('rental'),
    vestidoId: rawAluguel.vestidoId || vestidoId,
    clienteNome: sanitizeText(rawAluguel.clienteNome ?? rawAluguel.customerName),
    clienteTelefone: sanitizeText(rawAluguel.clienteTelefone ?? rawAluguel.phone),
    clienteEndereco: sanitizeText(rawAluguel.clienteEndereco ?? rawAluguel.address),
    dataFesta: sanitizeText(rawAluguel.dataFesta ?? rawAluguel.partyDate),
    dataRetirada: sanitizeText(rawAluguel.dataRetirada ?? rawAluguel.pickupDate),
    dataDevolucaoPrevista: sanitizeText(
      rawAluguel.dataDevolucaoPrevista ?? rawAluguel.expectedReturnDate,
    ),
    dataDevolucaoReal: sanitizeText(rawAluguel.dataDevolucaoReal ?? rawAluguel.returnedAt ?? ''),
    valor: normalizeNumber(rawAluguel.valor ?? rawAluguel.value),
    sinalPago: normalizeNumber(rawAluguel.sinalPago ?? rawAluguel.depositPaid),
    observacoes: sanitizeMultilineText(rawAluguel.observacoes ?? rawAluguel.notes),
    status,
    createdAt: timestamp,
    updatedAt: rawAluguel.updatedAt || rawAluguel.returnedAt || timestamp,
  }
}

function normalizeDatabase(database) {
  const source = database && typeof database === 'object' ? database : initialDatabase
  const vestidos = Array.isArray(source.vestidos)
    ? source.vestidos.map(normalizeVestido)
    : clone(initialDatabase.vestidos)
  const alugueis = Array.isArray(source.alugueis)
    ? source.alugueis.map(normalizeAluguel).filter(Boolean)
    : clone(initialDatabase.alugueis)
  const activeRentalVestidos = new Set(
    alugueis.filter((aluguel) => aluguel.status === 'ativo').map((aluguel) => aluguel.vestidoId),
  )

  return {
    vestidos: vestidos.map((vestido) => ({
      ...vestido,
      status: activeRentalVestidos.has(vestido.id)
        ? 'alugado'
        : manualDressStatuses.includes(vestido.status)
          ? vestido.status
          : 'disponivel',
    })),
    alugueis,
  }
}

function migrateLegacyDresses(legacyDresses) {
  const vestidos = []
  const alugueis = []

  if (!Array.isArray(legacyDresses)) {
    return normalizeDatabase(initialDatabase)
  }

  legacyDresses.forEach((legacyDress, index) => {
    const vestido = normalizeVestido(legacyDress, index)
    vestidos.push(vestido)

    const currentRental = normalizeAluguel(legacyDress.currentRental, vestido.id)
    if (currentRental) {
      alugueis.push({ ...currentRental, status: 'ativo', dataDevolucaoReal: '' })
    }

    if (Array.isArray(legacyDress.rentalHistory)) {
      legacyDress.rentalHistory.forEach((legacyRental) => {
        const rental = normalizeAluguel(legacyRental, vestido.id)
        if (rental) {
          alugueis.push({ ...rental, status: 'devolvido' })
        }
      })
    }
  })

  return normalizeDatabase({ vestidos, alugueis })
}

function readRawDatabase() {
  if (!hasLocalStorage()) {
    return normalizeDatabase(initialDatabase)
  }

  const storedDatabase = localStorage.getItem(DATABASE_KEY)
  if (storedDatabase) {
    return normalizeDatabase(JSON.parse(storedDatabase))
  }

  const legacyDresses = localStorage.getItem(LEGACY_DRESSES_KEY)
  if (legacyDresses) {
    return migrateLegacyDresses(JSON.parse(legacyDresses))
  }

  return normalizeDatabase(initialDatabase)
}

function writeDatabase(database) {
  const normalizedDatabase = normalizeDatabase(database)

  if (!hasLocalStorage()) {
    return normalizedDatabase
  }

  try {
    localStorage.setItem(DATABASE_KEY, JSON.stringify(normalizedDatabase))
    return normalizedDatabase
  } catch {
    throw new Error(
      'Não foi possível salvar os dados no navegador. Tente remover fotos muito grandes.',
    )
  }
}

function readDatabase() {
  try {
    const database = readRawDatabase()
    writeDatabase(database)
    return database
  } catch {
    const fallbackDatabase = normalizeDatabase(initialDatabase)
    try {
      writeDatabase(fallbackDatabase)
    } catch {
      return fallbackDatabase
    }
    return fallbackDatabase
  }
}

function composeVestido(vestido, alugueis) {
  const currentRental = alugueis.find(
    (aluguel) => aluguel.vestidoId === vestido.id && aluguel.status === 'ativo',
  )
  const rentalHistory = alugueis
    .filter((aluguel) => aluguel.vestidoId === vestido.id && aluguel.status === 'devolvido')
    .sort((first, second) => String(second.updatedAt).localeCompare(String(first.updatedAt)))

  return {
    ...vestido,
    currentRental: currentRental || null,
    rentalHistory,
  }
}

export function fetchVestidos() {
  const database = readDatabase()
  return database.vestidos.map((vestido) => composeVestido(vestido, database.alugueis))
}

export function createVestido(vestidoData) {
  const database = readDatabase()
  const codigo = sanitizeText(vestidoData.codigo).toUpperCase()

  if (!codigo) {
    throw new Error('Informe o código do vestido.')
  }

  if (database.vestidos.some((vestido) => vestido.codigo.toUpperCase() === codigo)) {
    throw new Error('Já existe um vestido com este código.')
  }

  const timestamp = now()
  const nextVestido = normalizeVestido({
    ...vestidoData,
    id: createId('dress'),
    codigo,
    status: manualDressStatuses.includes(vestidoData.status) ? vestidoData.status : 'disponivel',
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  return writeDatabase({
    ...database,
    vestidos: [nextVestido, ...database.vestidos],
  })
}

export function updateVestido(vestidoId, vestidoData) {
  const database = readDatabase()
  const codigo = sanitizeText(vestidoData.codigo).toUpperCase()

  if (!codigo) {
    throw new Error('Informe o código do vestido.')
  }

  if (
    database.vestidos.some(
      (vestido) => vestido.id !== vestidoId && vestido.codigo.toUpperCase() === codigo,
    )
  ) {
    throw new Error('Já existe um vestido com este código.')
  }

  const hasActiveRental = database.alugueis.some(
    (aluguel) => aluguel.vestidoId === vestidoId && aluguel.status === 'ativo',
  )

  return writeDatabase({
    ...database,
    vestidos: database.vestidos.map((vestido) => {
      if (vestido.id !== vestidoId) {
        return vestido
      }

      return normalizeVestido({
        ...vestido,
        ...vestidoData,
        codigo,
        status: hasActiveRental
          ? 'alugado'
          : manualDressStatuses.includes(vestidoData.status)
            ? vestidoData.status
            : 'disponivel',
        updatedAt: now(),
      })
    }),
  })
}

export function deleteVestido(vestidoId) {
  const database = readDatabase()
  return writeDatabase({
    vestidos: database.vestidos.filter((vestido) => vestido.id !== vestidoId),
    alugueis: database.alugueis.filter((aluguel) => aluguel.vestidoId !== vestidoId),
  })
}

export function createAluguel(vestidoId, aluguelData) {
  const database = readDatabase()
  const targetVestido = database.vestidos.find((vestido) => vestido.id === vestidoId)
  const hasActiveRental = database.alugueis.some(
    (aluguel) => aluguel.vestidoId === vestidoId && aluguel.status === 'ativo',
  )

  if (!targetVestido) {
    throw new Error('Vestido não encontrado.')
  }

  if (hasActiveRental) {
    throw new Error('Este vestido já possui um aluguel ativo.')
  }

  const clienteNome = sanitizeText(aluguelData.clienteNome)
  const dataFesta = sanitizeText(aluguelData.dataFesta)

  if (!clienteNome || !dataFesta) {
    throw new Error('Informe o nome da cliente e a data da festa.')
  }

  const timestamp = now()
  const nextAluguel = normalizeAluguel(
    {
      ...aluguelData,
      id: createId('rental'),
      vestidoId,
      clienteNome,
      dataFesta,
      status: 'ativo',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    vestidoId,
  )

  return writeDatabase({
    vestidos: database.vestidos.map((vestido) =>
      vestido.id === vestidoId ? { ...vestido, status: 'alugado', updatedAt: timestamp } : vestido,
    ),
    alugueis: [nextAluguel, ...database.alugueis],
  })
}

export function updateAluguel(aluguelId, aluguelData) {
  const database = readDatabase()
  const clienteNome = sanitizeText(aluguelData.clienteNome)
  const dataFesta = sanitizeText(aluguelData.dataFesta)

  if (!clienteNome || !dataFesta) {
    throw new Error('Informe o nome da cliente e a data da festa.')
  }

  return writeDatabase({
    ...database,
    alugueis: database.alugueis.map((aluguel) =>
      aluguel.id === aluguelId
        ? normalizeAluguel({
            ...aluguel,
            ...aluguelData,
            clienteNome,
            dataFesta,
            status: aluguel.status,
            updatedAt: now(),
          })
        : aluguel,
    ),
  })
}

export function markAluguelReturned(aluguelId) {
  const database = readDatabase()
  const targetRental = database.alugueis.find((aluguel) => aluguel.id === aluguelId)

  if (!targetRental) {
    throw new Error('Aluguel não encontrado.')
  }

  const timestamp = now()
  const returnDate = timestamp.slice(0, 10)

  return writeDatabase({
    vestidos: database.vestidos.map((vestido) =>
      vestido.id === targetRental.vestidoId
        ? { ...vestido, status: 'disponivel', updatedAt: timestamp }
        : vestido,
    ),
    alugueis: database.alugueis.map((aluguel) =>
      aluguel.id === aluguelId
        ? {
            ...aluguel,
            status: 'devolvido',
            dataDevolucaoReal: returnDate,
            updatedAt: timestamp,
          }
        : aluguel,
    ),
  })
}

// Supabase futura etapa:
// - Substituir readDatabase/writeDatabase por chamadas ao Supabase Database.
// - Substituir fotoBase64Dev por upload no Supabase Storage e gravar apenas fotoUrl.
