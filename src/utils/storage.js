import { initialDresses } from '../data/initialDresses.js'

const STORAGE_KEY = 'arraia-control:dresses'
const allowedManualStatuses = ['disponivel', 'reservado']

function cloneDresses(dresses) {
  return JSON.parse(JSON.stringify(dresses))
}

function normalizeRental(rental) {
  if (!rental || typeof rental !== 'object') {
    return null
  }

  return {
    id: rental.id || `rental-${Date.now()}`,
    customerName: rental.customerName || '',
    phone: rental.phone || '',
    address: rental.address || '',
    partyDate: rental.partyDate || '',
    pickupDate: rental.pickupDate || '',
    expectedReturnDate: rental.expectedReturnDate || '',
    value: Number(rental.value || 0),
    depositPaid: Number(rental.depositPaid || 0),
    notes: rental.notes || '',
    startedAt: rental.startedAt || new Date().toISOString(),
    returnedAt: rental.returnedAt,
    updatedAt: rental.updatedAt,
  }
}

function normalizeDress(dress, index) {
  const source = dress && typeof dress === 'object' ? dress : {}
  const currentRental = normalizeRental(source.currentRental)
  const status = currentRental
    ? 'alugado'
    : allowedManualStatuses.includes(source.status)
      ? source.status
      : 'disponivel'

  return {
    id: source.id || `dress-${index}-${Date.now()}`,
    code: String(source.code || `V${index + 1}`).trim().toUpperCase(),
    size: String(source.size || '').trim().toUpperCase(),
    color: String(source.color || '').trim(),
    photoUrl: String(source.photoUrl || '').trim(),
    status,
    currentRental,
    rentalHistory: Array.isArray(source.rentalHistory)
      ? source.rentalHistory.map(normalizeRental).filter(Boolean)
      : [],
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: source.updatedAt,
  }
}

function normalizeDresses(dresses) {
  if (!Array.isArray(dresses)) {
    return cloneDresses(initialDresses)
  }

  return dresses.map(normalizeDress)
}

export function loadDresses() {
  try {
    const storedDresses = localStorage.getItem(STORAGE_KEY)

    if (!storedDresses) {
      const starterDresses = cloneDresses(initialDresses)
      saveDresses(starterDresses)
      return starterDresses
    }

    const normalizedDresses = normalizeDresses(JSON.parse(storedDresses))
    saveDresses(normalizedDresses)
    return normalizedDresses
  } catch {
    const fallbackDresses = cloneDresses(initialDresses)
    saveDresses(fallbackDresses)
    return fallbackDresses
  }
}

export function saveDresses(dresses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDresses(dresses)))
    return true
  } catch {
    return false
  }
}
