function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase()
}

export function filterDresses(dresses, filters) {
  const search = normalizeSearch(filters.query)

  return dresses.filter((dress) => {
    const matchesStatus = filters.status === 'todos' || dress.status === filters.status
    const matchesColor = filters.color === 'todas' || dress.cor === filters.color
    const matchesSize = filters.size === 'todas' || dress.tamanho === filters.size
    const searchableText =
      `${dress.codigo} ${dress.cor} ${dress.tamanho} ${dress.observacoes}`.toLowerCase()
    const matchesSearch = !search || searchableText.includes(search)

    return matchesStatus && matchesColor && matchesSize && matchesSearch
  })
}

export function getDressFilterOptions(dresses) {
  return {
    colors: Array.from(new Set(dresses.map((dress) => dress.cor).filter(Boolean))).sort(
      (first, second) => first.localeCompare(second, 'pt-BR'),
    ),
    sizes: Array.from(new Set(dresses.map((dress) => dress.tamanho).filter(Boolean))).sort(
      (first, second) => first.localeCompare(second, 'pt-BR', { numeric: true }),
    ),
  }
}
