export const genericColorOptions = [
  'Preto',
  'Azul',
  'Amarelo',
  'Rosa',
  'Vermelho',
  'Verde',
  'Branco',
  'Roxo',
  'Laranja',
  'Marrom',
  'Cinza',
]

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export function filterDresses(dresses, filters) {
  const search = normalizeSearch(filters.query)
  const colorSearch = normalizeSearch(filters.color)

  return dresses.filter((dress) => {
    const matchesStatus = filters.status === 'todos' || dress.status === filters.status
    const matchesColor =
      filters.color === 'todas' || normalizeSearch(dress.cor).includes(colorSearch)
    const matchesSize = filters.size === 'todos' || dress.tamanho === filters.size
    const searchableText = normalizeSearch(
      `${dress.codigo} ${dress.cor} ${dress.tamanho} ${dress.observacoes}`,
    )
    const matchesSearch = !search || searchableText.includes(search)

    return matchesStatus && matchesColor && matchesSize && matchesSearch
  })
}

export function getDressFilterOptions(dresses) {
  return {
    colors: genericColorOptions,
    sizes: Array.from(new Set(dresses.map((dress) => dress.tamanho).filter(Boolean))).sort(
      (first, second) => first.localeCompare(second, 'pt-BR', { numeric: true }),
    ),
  }
}
