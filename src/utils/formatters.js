export const statusLabels = {
  disponivel: 'Disponível',
  alugado: 'Alugado',
  reservado: 'Reservado',
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date)
}
