const counterConfig = [
  { label: 'Total de vestidos', key: 'total', icon: 'T' },
  { label: 'Disponíveis', key: 'disponivel', icon: 'D' },
  { label: 'Alugados', key: 'alugado', icon: 'A' },
  { label: 'Reservados', key: 'reservado', icon: 'R' },
]

export default function DashboardCards({ dresses }) {
  const counters = dresses.reduce(
    (accumulator, dress) => {
      accumulator.total += 1
      accumulator[dress.status] += 1
      return accumulator
    },
    { total: 0, disponivel: 0, alugado: 0, reservado: 0 },
  )

  return (
    <section className="dashboard" aria-label="Resumo dos vestidos">
      {counterConfig.map((counter) => (
        <article className="metric-card" key={counter.key}>
          <div className="metric-card-header">
            <span>{counter.label}</span>
            <i aria-hidden="true">{counter.icon}</i>
          </div>
          <strong>{counters[counter.key]}</strong>
        </article>
      ))}
    </section>
  )
}
