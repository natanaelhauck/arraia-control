const rentalStatusLabels = {
  ativo: 'Ativo',
  devolvido: 'Devolvido',
  cancelado: 'Cancelado',
}

export function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

export function formatDateBR(dateValue) {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function parseDate(dateValue) {
  if (!dateValue) {
    return null
  }

  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export function getCurrentMonthValue(today = new Date()) {
  const currentDate = startOfDay(today)
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function parseMonthValue(monthValue, today = new Date()) {
  const safeMonthValue = monthValue || getCurrentMonthValue(today)
  const match = String(safeMonthValue).match(/^(\d{4})-(\d{2})$/)

  if (!match) {
    return parseMonthValue(getCurrentMonthValue(today), today)
  }

  const year = Number(match[1])
  const month = Number(match[2])

  if (month < 1 || month > 12) {
    return parseMonthValue(getCurrentMonthValue(today), today)
  }

  return { year, monthIndex: month - 1 }
}

function getPeriodRange(period, monthValue, today = new Date()) {
  const currentDate = startOfDay(today)
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  if (period === 'este-mes') {
    return {
      start: new Date(currentYear, currentMonth, 1),
      end: new Date(currentYear, currentMonth + 1, 0),
    }
  }

  if (period === 'proximo-mes') {
    return {
      start: new Date(currentYear, currentMonth + 1, 1),
      end: new Date(currentYear, currentMonth + 2, 0),
    }
  }

  if (period === 'ultimos-30-dias') {
    return {
      start: addDays(currentDate, -30),
      end: currentDate,
    }
  }

  if (period === 'mes-especifico') {
    const selectedMonth = parseMonthValue(monthValue, today)

    return {
      start: new Date(selectedMonth.year, selectedMonth.monthIndex, 1),
      end: new Date(selectedMonth.year, selectedMonth.monthIndex + 1, 0),
    }
  }

  return null
}

function isInsideRange(date, range) {
  if (!range || !date) {
    return true
  }

  return date >= range.start && date <= range.end
}

export function getRentalStatusLabel(status) {
  return rentalStatusLabels[status] || 'Cancelado'
}

export function getFinancialRentals(dresses) {
  return dresses
    .flatMap((dress) => {
      const rentals = dress.allRentals || [
        ...(dress.activeRentals || []),
        ...(dress.rentalHistory || []),
      ]

      return rentals.map((rental) => ({
        ...rental,
        vestidoCodigo: dress.codigo,
      }))
    })
    .sort((first, second) => {
      const secondDate = second.partyDate || second.dataFesta || second.createdAt || ''
      const firstDate = first.partyDate || first.dataFesta || first.createdAt || ''
      return String(secondDate).localeCompare(String(firstDate))
    })
}

export function filterFinancialRentals(rentals, filters) {
  const range = getPeriodRange(filters.period, filters.month)

  return rentals.filter((rental) => {
    const rentalDate = parseDate(rental.partyDate || rental.dataFesta || rental.createdAt)
    const matchesPeriod = isInsideRange(rentalDate, range)
    const matchesStatus = filters.status === 'todos' || rental.status === filters.status

    return matchesPeriod && matchesStatus
  })
}

export function calculateFinancialSummary(rentals) {
  return rentals.reduce(
    (summary, rental) => {
      const totalAmount = Number(rental.valor || 0)
      const depositAmount = Number(rental.sinalPago || 0)

      if (rental.status === 'cancelado') {
        return summary
      }

      if (rental.status === 'ativo' || rental.status === 'devolvido') {
        summary.expectedRevenue += totalAmount
      }

      if (rental.status === 'devolvido' && totalAmount > 0) {
        summary.receivedAmount += totalAmount
      } else {
        summary.receivedAmount += depositAmount
      }

      if (rental.status === 'ativo') {
        summary.pendingAmount += Math.max(totalAmount - depositAmount, 0)
        summary.activeRentals += 1
      }

      if (rental.status === 'devolvido') {
        summary.returnedRentals += 1
      }

      return summary
    },
    {
      expectedRevenue: 0,
      receivedAmount: 0,
      pendingAmount: 0,
      activeRentals: 0,
      returnedRentals: 0,
    },
  )
}

export function getUpcomingReturns(rentals, today = new Date()) {
  const currentDate = startOfDay(today)
  const limitDate = addDays(currentDate, 7)

  return rentals
    .filter((rental) => {
      const returnDate = parseDate(rental.dataDevolucaoPrevista)
      return (
        rental.status === 'ativo' &&
        returnDate &&
        returnDate >= currentDate &&
        returnDate <= limitDate
      )
    })
    .sort((first, second) =>
      String(first.dataDevolucaoPrevista || '').localeCompare(
        String(second.dataDevolucaoPrevista || ''),
      ),
    )
}

export function getOverdueReturns(rentals, today = new Date()) {
  const currentDate = startOfDay(today)

  return rentals
    .filter((rental) => {
      const returnDate = parseDate(rental.dataDevolucaoPrevista)
      return rental.status === 'ativo' && returnDate && returnDate < currentDate
    })
    .sort((first, second) =>
      String(first.dataDevolucaoPrevista || '').localeCompare(
        String(second.dataDevolucaoPrevista || ''),
      ),
    )
}

export function getRentalPendingAmount(rental) {
  return rental.status === 'ativo'
    ? Math.max(Number(rental.valor || 0) - Number(rental.sinalPago || 0), 0)
    : 0
}
