import DressImage from './DressImage.jsx'
import RentalInfo from './RentalInfo.jsx'
import StatusBadge from './StatusBadge.jsx'
import { formatDate } from '../utils/formatters.js'

const rentalStatusLabels = {
  ativo: 'Ativo',
  devolvido: 'Devolvido',
  cancelado: 'Cancelado',
}

function RentalCard({ rental, actions, date }) {
  return (
    <article className="history-card">
      <div className="history-card-header">
        <span className={`rental-status rental-status-${rental.status || 'cancelado'}`}>
          {rentalStatusLabels[rental.status] || 'Cancelado'}
        </span>
        <span>{formatDate(date || rental.dataFesta)}</span>
      </div>
      <RentalInfo rental={rental} />
      {actions ? <div className="button-row rental-card-actions">{actions}</div> : null}
    </article>
  )
}

export default function DressDetailsModal({
  dress,
  onClose,
  onDeleteDress,
  onEditDress,
  onRegisterRental,
  onEditRental,
  onMarkReturned,
  onCancelRental,
}) {
  if (!dress) {
    return null
  }

  function confirmReturn(rental) {
    const didConfirm = window.confirm(
      `Confirmar devolução do aluguel de ${rental.clienteNome}?\n\nSomente este aluguel será finalizado e movido para o histórico.`,
    )

    if (didConfirm) {
      onMarkReturned(rental)
    }
  }

  function confirmCancel(rental, isCurrentRental = false) {
    const message = isCurrentRental
      ? 'Tem certeza que deseja cancelar este aluguel? Essa ação removerá este aluguel da agenda ativa.'
      : `Cancelar o aluguel/reserva de ${rental.clienteNome} para ${formatDate(rental.dataFesta)}?\n\nSomente este registro será cancelado.`
    const didConfirm = window.confirm(message)

    if (didConfirm) {
      onCancelRental(rental)
    }
  }

  function confirmDelete() {
    const hasActiveRentals = (dress.activeRentals || []).length > 0
    const warning = hasActiveRentals
      ? 'Este vestido possui aluguéis/reservas ativos. A exclusão removerá também esses registros e todo o histórico.'
      : 'Esta ação removerá o vestido e todo o histórico de aluguéis.'

    if (window.confirm(`Excluir definitivamente o vestido ${dress.codigo}?\n\n${warning}`)) {
      onDeleteDress(dress)
    }
  }

  const futureReservations = dress.futureReservations || []
  const rentalHistory = dress.rentalHistory || []

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dress-details-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Detalhes do vestido</p>
            <h2 id="dress-details-title">{dress.codigo}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-media">
            <DressImage dress={dress} size="large" />
            <div className="detail-media-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => onEditDress(dress)}
              >
                Editar vestido
              </button>
              <button className="button button-danger" type="button" onClick={confirmDelete}>
                Excluir vestido
              </button>
            </div>
          </div>

          <div className="detail-content">
            <section className="detail-section">
              <div className="detail-title-row">
                <h3>Informações do vestido</h3>
                <StatusBadge status={dress.status} />
              </div>

              <dl className="detail-list compact">
                <div>
                  <dt>Código</dt>
                  <dd>{dress.codigo}</dd>
                </div>
                <div>
                  <dt>Tipo de peça</dt>
                  <dd>{dress.tipoPeca}</dd>
                </div>
                <div>
                  <dt>Tamanho</dt>
                  <dd>{dress.tamanho}</dd>
                </div>
                <div>
                  <dt>Cor</dt>
                  <dd>{dress.cor}</dd>
                </div>
                <div className="wide">
                  <dt>Observações</dt>
                  <dd>{dress.observacoes || 'Sem observações cadastradas.'}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-section">
              <div className="detail-title-row">
                <h3>Aluguel atual</h3>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => onRegisterRental(dress)}
                >
                  Registrar aluguel
                </button>
              </div>

              {dress.currentRental ? (
                <RentalCard
                  rental={dress.currentRental}
                  actions={
                    <>
                      <button
                        className="button button-secondary"
                        type="button"
                        onClick={() => onEditRental(dress, dress.currentRental)}
                      >
                        Editar aluguel
                      </button>
                      <button
                        className="button button-success"
                        type="button"
                        onClick={() => confirmReturn(dress.currentRental)}
                      >
                        Marcar como devolvido
                      </button>
                      <button
                        className="button button-danger"
                        type="button"
                        onClick={() => confirmCancel(dress.currentRental, true)}
                      >
                        Cancelar aluguel
                      </button>
                    </>
                  }
                />
              ) : (
                <p className="muted-text">Não existe aluguel em andamento para este vestido.</p>
              )}
            </section>

            <section className="detail-section">
              <div className="detail-title-row">
                <h3>Próximas reservas</h3>
                <span className="result-count">{futureReservations.length} registros</span>
              </div>

              {futureReservations.length > 0 ? (
                <div className="history-scroll history-scroll-compact">
                  <div className="history-list">
                    {futureReservations.map((rental) => (
                      <RentalCard
                        key={rental.id}
                        rental={rental}
                        date={rental.dataFesta}
                        actions={
                          <>
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => onEditRental(dress, rental)}
                            >
                              Editar aluguel
                            </button>
                            <button
                              className="button button-danger"
                              type="button"
                              onClick={() => confirmCancel(rental)}
                            >
                              Cancelar reserva
                            </button>
                          </>
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="muted-text">Nenhuma reserva futura cadastrada.</p>
              )}
            </section>

            <section className="detail-section">
              <h3>Histórico de aluguéis</h3>

              {rentalHistory.length > 0 ? (
                <div className="history-scroll">
                  <div className="history-list">
                    {rentalHistory.map((rental) => (
                      <RentalCard
                        key={rental.id}
                        rental={rental}
                        date={rental.dataDevolucaoReal || rental.updatedAt}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="muted-text">
                  Quando um vestido alugado for devolvido ou cancelado, o registro aparecerá aqui.
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
