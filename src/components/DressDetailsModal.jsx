import RentalForm from './RentalForm.jsx'
import DressImage from './DressImage.jsx'
import StatusBadge from './StatusBadge.jsx'
import { formatCurrency, formatDate } from '../utils/formatters.js'

function RentalInfo({ rental }) {
  return (
    <dl className="detail-list">
      <div>
        <dt>Cliente</dt>
        <dd>{rental.customerName}</dd>
      </div>
      <div>
        <dt>Telefone</dt>
        <dd>{rental.phone}</dd>
      </div>
      <div>
        <dt>Endereço</dt>
        <dd>{rental.address}</dd>
      </div>
      <div>
        <dt>Data da festa</dt>
        <dd>{formatDate(rental.partyDate)}</dd>
      </div>
      <div>
        <dt>Retirada</dt>
        <dd>{formatDate(rental.pickupDate)}</dd>
      </div>
      <div>
        <dt>Devolução prevista</dt>
        <dd>{formatDate(rental.expectedReturnDate)}</dd>
      </div>
      <div>
        <dt>Valor</dt>
        <dd>{formatCurrency(rental.value)}</dd>
      </div>
      <div>
        <dt>Sinal pago</dt>
        <dd>{formatCurrency(rental.depositPaid)}</dd>
      </div>
      {rental.notes ? (
        <div className="wide">
        <dt>Observações</dt>
          <dd>{rental.notes}</dd>
        </div>
      ) : null}
    </dl>
  )
}

export default function DressDetailsModal({ dress, onClose, onRegisterRental, onMarkReturned }) {
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
            <h2 id="dress-details-title">{dress.code}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-media">
            <DressImage dress={dress} size="large" />
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
                  <dd>{dress.code}</dd>
                </div>
                <div>
                  <dt>Tamanho</dt>
                  <dd>{dress.size}</dd>
                </div>
                <div>
                  <dt>Cor</dt>
                  <dd>{dress.color}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-section">
              <div className="detail-title-row">
                <h3>Aluguel atual</h3>
                {dress.status === 'alugado' ? (
                  <button
                    className="button button-success"
                    type="button"
                    onClick={() => onMarkReturned(dress.id)}
                  >
                    Marcar como devolvido
                  </button>
                ) : null}
              </div>

              {dress.currentRental ? (
                <RentalInfo rental={dress.currentRental} />
              ) : (
                <p className="muted-text">Não existe aluguel ativo para este vestido.</p>
              )}
            </section>

            {dress.status !== 'alugado' ? (
              <section className="detail-section">
                <RentalForm dress={dress} onSubmit={onRegisterRental} />
              </section>
            ) : null}

            <section className="detail-section">
              <h3>Histórico de aluguéis</h3>

              {dress.rentalHistory.length > 0 ? (
                <div className="history-list">
                  {dress.rentalHistory.map((rental) => (
                    <article className="history-card" key={rental.id}>
                      <div className="history-card-header">
                        <strong>{rental.customerName}</strong>
                        <span>Devolvido em {formatDate(rental.returnedAt)}</span>
                      </div>
                      <RentalInfo rental={rental} />
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-text">Ainda não há aluguéis finalizados para este vestido.</p>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
