export default function Filters({ filters, colorOptions, sizeOptions, onChange, onReset }) {
  const hasActiveFilters =
    filters.status !== 'todos' ||
    filters.color !== 'todas' ||
    filters.size !== 'todos' ||
    filters.query.trim() !== ''

  function updateField(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <section className="filters-panel" aria-label="Filtros de vestidos">
      <label className="search-filter">
        Buscar vestido
        <input
          name="query"
          value={filters.query}
          onChange={updateField}
          placeholder="Digite código, cor, tamanho ou observação"
          autoComplete="off"
        />
      </label>

      <label>
        Status
        <select name="status" value={filters.status} onChange={updateField}>
          <option value="todos">Todos</option>
          <option value="disponivel">Disponíveis</option>
          <option value="alugado">Alugados</option>
          <option value="reservado">Reservados</option>
        </select>
      </label>

      <label>
        Cor
        <select name="color" value={filters.color} onChange={updateField}>
          <option value="todas">Todas</option>
          {colorOptions.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tamanho
        <select name="size" value={filters.size} onChange={updateField}>
          <option value="todos">Todos</option>
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      {hasActiveFilters ? (
        <button className="button button-secondary" type="button" onClick={onReset}>
          Limpar
        </button>
      ) : null}
    </section>
  )
}
