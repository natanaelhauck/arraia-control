import DressImage from './DressImage.jsx'
import RentalInfo from './RentalInfo.jsx'
import StatusBadge from './StatusBadge.jsx'
import { formatDate } from '../utils/formatters.js'

export default function DressDetailsModal({
  dress,
  onClose,
  onDeleteDress,
  onEditDress,
  onRegisterRental,
  onEditRental,
  onMarkReturned,
}) {
  if (!dress) {
    return null
  }

  function confirmReturn() {
    const didConfirm = window.confirm(
      `Confirmar devolução do vestido ${dress.codigo}?\n\nO aluguel atual será finalizado e movido para o histórico.`,
    )

    if (didConfirm && dress.currentRental) {
      onMarkReturned(dress.currentRental)
    }
  }

  function confirmDelete() {
    const warning = dress.currentRental
      ? 'Este vestido está alugado. A exclusão removerá também o aluguel atual e todo o histórico.'
      : 'Esta ação removerá o vestido e todo o histórico de aluguéis.'

    if (window.confirm(`Excluir definitivamente o vestido ${dress.codigo}?\n\n${warning}`)) {
      onDeleteDress(dress)
    }
  }

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
                {dress.currentRental ? (
                  <div className="button-row">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => onEditRental(dress, dress.currentRental)}
                    >
                      Editar aluguel
                    </button>
                    <button className="button button-success" type="button" onClick={confirmReturn}>
                      Marcar como devolvido
                    </button>
                  </div>
                ) : (
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => onRegisterRental(dress)}
                  >
                    Registrar aluguel
                  </button>
                )}
              </div>

              {dress.currentRental ? (
                <RentalInfo rental={dress.currentRental} />
              ) : (
                <p className="muted-text">Não existe aluguel ativo para este vestido.</p>
              )}
            </section>

            <section className="detail-section">
              <h3>Histórico de aluguéis</h3>

              {dress.rentalHistory.length > 0 ? (
                <div className="history-list">
                  {dress.rentalHistory.map((rental) => (
                    <article className="history-card" key={rental.id}>
                      <div className="history-card-header">
                        <strong>{rental.clienteNome}</strong>
                        <span>Devolvido em {formatDate(rental.dataDevolucaoReal)}</span>
                      </div>
                      <RentalInfo rental={rental} />
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-text">
                  Quando um vestido alugado for devolvido, o registro aparecerá aqui.
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
