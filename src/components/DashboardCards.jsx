const counterConfig = [
  { label: 'Total de vestidos', key: 'total' },
  { label: 'Disponíveis', key: 'disponivel' },
  { label: 'Alugados', key: 'alugado' },
  { label: 'Reservados', key: 'reservado' },
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
          <span>{counter.label}</span>
          <strong>{counters[counter.key]}</strong>
        </article>
      ))}
    </section>
  )
}
