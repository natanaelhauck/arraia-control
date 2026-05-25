import { useMemo, useState } from 'react'
import {
  calculateFinancialSummary,
  filterFinancialRentals,
  formatCurrencyBRL,
  formatDateBR,
  getCurrentMonthValue,
  getFinancialRentals,
  getOverdueReturns,
  getRentalPendingAmount,
  getRentalStatusLabel,
  getUpcomingReturns,
} from '../utils/finance.js'

const initialFilters = {
  period: 'este-mes',
  status: 'todos',
  month: getCurrentMonthValue(),
}

function FinancialMetricCard({ label, value, tone = 'default' }) {
  return (
    <article className={`financial-metric financial-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function ReturnList({ title, rentals, emptyText }) {
  return (
    <section className="financial-return-panel">
      <h3>{title}</h3>
      {rentals.length > 0 ? (
        <div className="financial-return-list">
          {rentals.map((rental) => (
            <article className="financial-return-card" key={`${title}-${rental.id}`}>
              <strong>{rental.vestidoCodigo}</strong>
              <span>{rental.clienteNome}</span>
              <small>{formatDateBR(rental.dataDevolucaoPrevista)}</small>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted-text">{emptyText}</p>
      )}
    </section>
  )
}

function FinancialRentalRow({ rental }) {
  return (
    <dl className="financial-rental-row">
      <div>
        <dt>Vestido</dt>
        <dd>{rental.vestidoCodigo}</dd>
      </div>
      <div>
        <dt>Cliente</dt>
        <dd title={rental.clienteNome}>{rental.clienteNome}</dd>
      </div>
      <div>
        <dt>Festa</dt>
        <dd>{formatDateBR(rental.partyDate || rental.dataFesta)}</dd>
      </div>
      <div>
        <dt>Devolução</dt>
        <dd>{formatDateBR(rental.dataDevolucaoPrevista)}</dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{formatCurrencyBRL(rental.valor)}</dd>
      </div>
      <div>
        <dt>Sinal</dt>
        <dd>{formatCurrencyBRL(rental.sinalPago)}</dd>
      </div>
      <div>
        <dt>Pendente</dt>
        <dd>{formatCurrencyBRL(getRentalPendingAmount(rental))}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>
          <span className={`rental-status rental-status-${rental.status || 'cancelado'}`}>
            {getRentalStatusLabel(rental.status)}
          </span>
        </dd>
      </div>
    </dl>
  )
}

export default function FinancialDashboard({ dresses, isLoading = false, showHeading = true }) {
  const [filters, setFilters] = useState(initialFilters)
  const currentMonthValue = useMemo(() => getCurrentMonthValue(), [])
  const rentals = useMemo(() => getFinancialRentals(dresses), [dresses])
  const filteredRentals = useMemo(
    () => filterFinancialRentals(rentals, filters),
    [filters, rentals],
  )
  const summary = useMemo(() => calculateFinancialSummary(filteredRentals), [filteredRentals])
  const upcomingReturns = useMemo(() => getUpcomingReturns(filteredRentals), [filteredRentals])
  const overdueReturns = useMemo(() => getOverdueReturns(filteredRentals), [filteredRentals])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <section
      className="financial-dashboard"
      aria-labelledby={showHeading ? 'financial-title' : undefined}
      aria-label={showHeading ? undefined : 'Conteudo financeiro'}
    >
      <div className={showHeading ? 'section-heading' : 'financial-toolbar'}>
        {showHeading ? (
          <div>
            <p className="eyebrow">Financeiro</p>
            <h2 id="financial-title">Resumo financeiro</h2>
          </div>
        ) : null}
        <div className="financial-filters">
          <label>
            Período
            <select name="period" value={filters.period} onChange={updateFilter}>
              <option value="este-mes">Este mês</option>
              <option value="proximo-mes">Próximo mês</option>
              <option value="ultimos-30-dias">Últimos 30 dias</option>
              <option value="mes-especifico">Mês específico</option>
              <option value="todos">Todos</option>
            </select>
          </label>
          {filters.period === 'mes-especifico' ? (
            <label>
              Mês
              <input
                type="month"
                name="month"
                value={filters.month || currentMonthValue}
                onChange={updateFilter}
              />
            </label>
          ) : null}
          <label>
            Status
            <select name="status" value={filters.status} onChange={updateFilter}>
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="devolvido">Devolvidos</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="empty-state empty-state-compact">
          <h3>Carregando financeiro</h3>
          <p>Buscando aluguéis e valores no Supabase.</p>
        </div>
      ) : rentals.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum aluguel registrado ainda</h3>
          <p>Quando os primeiros aluguéis forem cadastrados, os valores aparecerão aqui.</p>
        </div>
      ) : (
        <div className="financial-content">
          <div className="financial-metrics">
            <FinancialMetricCard
              label="Receita total prevista"
              value={formatCurrencyBRL(summary.expectedRevenue)}
            />
            <FinancialMetricCard
              label="Valor já recebido"
              value={formatCurrencyBRL(summary.receivedAmount)}
              tone="success"
            />
            <FinancialMetricCard
              label="Valor pendente"
              value={formatCurrencyBRL(summary.pendingAmount)}
              tone="warning"
            />
            <FinancialMetricCard label="Aluguéis ativos" value={summary.activeRentals} />
            <FinancialMetricCard label="Aluguéis devolvidos" value={summary.returnedRentals} />
          </div>

          <div className="financial-return-grid">
            <ReturnList
              title="Devoluções próximas"
              rentals={upcomingReturns}
              emptyText="Nenhuma devolução prevista para os próximos 7 dias."
            />
            <ReturnList
              title="Devoluções atrasadas"
              rentals={overdueReturns}
              emptyText="Nenhuma devolução atrasada no filtro atual."
            />
          </div>

          <section className="financial-rentals-section">
            <div className="section-heading compact-heading">
              <h3>Aluguéis no período</h3>
              <span className="result-count">{filteredRentals.length} registros</span>
            </div>

            {filteredRentals.length > 0 ? (
              <div className="financial-rental-list">
                {filteredRentals.map((rental) => (
                  <FinancialRentalRow rental={rental} key={rental.id} />
                ))}
              </div>
            ) : (
              <div className="empty-state empty-state-compact">
                <h3>Nenhum aluguel encontrado</h3>
                <p>Ajuste o período ou o status para visualizar outros registros.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
