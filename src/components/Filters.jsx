export default function Filters({ filters, onChange }) {
  function updateField(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <section className="filters-panel" aria-label="Filtros de vestidos">
      <label>
        Buscar
        <input
          name="query"
          value={filters.query}
          onChange={updateField}
          placeholder="Código, cor ou tamanho"
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
    </section>
  )
}
