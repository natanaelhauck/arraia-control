export default function Filters({ filters, onChange, onReset }) {
  const hasActiveFilters = filters.status !== 'todos' || filters.query.trim() !== ''

  function updateField(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <section className="filters-panel" aria-label="Filtros de vestidos">
      <label>
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

      {hasActiveFilters ? (
        <button className="button button-secondary" type="button" onClick={onReset}>
          Limpar filtros
        </button>
      ) : null}
    </section>
  )
}
