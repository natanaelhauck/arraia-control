const ACTIVE_STATUS = 'ativo'
const RETURNED_STATUS = 'devolvido'
const CANCELED_STATUS = 'cancelado'

function normalizeDateString(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

export function getTodayString(today = new Date()) {
  if (typeof today === 'string') {
    return normalizeDateString(today)
  }

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getRentalStartDate(rental) {
  return normalizeDateString(
    rental.dataRetirada || rental.pickup_date || rental.dataFesta || rental.party_date,
  )
}

export function getRentalEndDate(rental) {
  return normalizeDateString(
    rental.dataDevolucaoPrevista ||
      rental.expected_return_date ||
      rental.dataFesta ||
      rental.party_date,
  )
}

export function getRentalPartyDate(rental) {
  return normalizeDateString(rental.dataFesta || rental.party_date)
}

export function getRentalInterval(rental) {
  const start = getRentalStartDate(rental)
  const end = getRentalEndDate(rental)

  if (!start || !end) {
    return null
  }

  return start <= end ? { start, end } : { start: end, end: start }
}

export function doRentalIntervalsOverlap(firstRental, secondRental) {
  const firstInterval = getRentalInterval(firstRental)
  const secondInterval = getRentalInterval(secondRental)

  if (!firstInterval || !secondInterval) {
    return false
  }

  return firstInterval.start <= secondInterval.end && secondInterval.start <= firstInterval.end
}

export function findConflictingRental(rentals, rentalData, ignoredRentalId = null) {
  return rentals.find(
    (rental) =>
      rental.status === ACTIVE_STATUS &&
      rental.id !== ignoredRentalId &&
      doRentalIntervalsOverlap(rental, rentalData),
  )
}

function compareByStartDate(first, second) {
  const firstStart = getRentalStartDate(first) || getRentalPartyDate(first) || ''
  const secondStart = getRentalStartDate(second) || getRentalPartyDate(second) || ''

  if (firstStart === secondStart) {
    return String(first.createdAt || first.created_at || '').localeCompare(
      String(second.createdAt || second.created_at || ''),
    )
  }

  return firstStart.localeCompare(secondStart)
}

function compareByRecentActivity(first, second) {
  const firstDate =
    normalizeDateString(first.dataDevolucaoReal || first.actual_return_date) ||
    normalizeDateString(first.updatedAt || first.updated_at) ||
    normalizeDateString(first.createdAt || first.created_at)
  const secondDate =
    normalizeDateString(second.dataDevolucaoReal || second.actual_return_date) ||
    normalizeDateString(second.updatedAt || second.updated_at) ||
    normalizeDateString(second.createdAt || second.created_at)

  return String(secondDate).localeCompare(String(firstDate))
}

export function getRentalSchedule(rentals, today = new Date()) {
  const currentDate = getTodayString(today)
  const activeRentals = rentals
    .filter((rental) => rental.status === ACTIVE_STATUS)
    .sort(compareByStartDate)
  const currentRentals = activeRentals.filter((rental) => {
    const startDate = getRentalStartDate(rental) || getRentalPartyDate(rental)
    return startDate && startDate <= currentDate
  })
  const futureReservations = activeRentals.filter((rental) => {
    const startDate = getRentalStartDate(rental) || getRentalPartyDate(rental)
    return startDate && startDate > currentDate
  })
  const rentalHistory = rentals
    .filter((rental) => rental.status === RETURNED_STATUS || rental.status === CANCELED_STATUS)
    .sort(compareByRecentActivity)

  return {
    activeRentals,
    currentRental: currentRentals[0] || null,
    currentRentals,
    futureReservations,
    nextReservation: futureReservations[0] || null,
    rentalHistory,
  }
}

export function calculateVisualDressStatus(dressStatus, rentals, today = new Date()) {
  const schedule = getRentalSchedule(rentals, today)

  if (schedule.currentRentals.length > 0) {
    return 'alugado'
  }

  if (schedule.futureReservations.length > 0) {
    return 'reservado'
  }

  return dressStatus === 'reservado' ? 'reservado' : 'disponivel'
}
