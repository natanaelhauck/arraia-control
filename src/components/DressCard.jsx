import DressImage from './DressImage.jsx'
import StatusBadge from './StatusBadge.jsx'
import { formatDate } from '../utils/formatters.js'

export default function DressCard({ dress, onDetails }) {
  const hasCurrentRental = Boolean(dress.currentRental)
  const nextReservation = dress.nextReservation

  return (
    <article className="dress-card">
      <DressImage dress={dress} size="card" />

      <div className="dress-card-body">
        <div className="dress-card-title">
          <div>
            <span className="code-label">Código</span>
            <h3>{dress.codigo}</h3>
          </div>
          <StatusBadge status={dress.status} />
        </div>

        <dl className="dress-meta">
          <div>
            <dt>Tipo</dt>
            <dd title={dress.tipoPeca}>{dress.tipoPeca}</dd>
          </div>
          <div>
            <dt>Tamanho</dt>
            <dd title={dress.tamanho}>{dress.tamanho}</dd>
          </div>
          <div>
            <dt>Cor</dt>
            <dd title={dress.cor}>{dress.cor}</dd>
          </div>
        </dl>

        {hasCurrentRental ? (
          <div className="card-note card-note-rental">
            <p className="card-note-line">
              <strong>Cliente:</strong>
              <span title={dress.currentRental.clienteNome}>{dress.currentRental.clienteNome}</span>
            </p>
            <p className="card-note-line">
              <strong>Devolução:</strong>
              <span>{formatDate(dress.currentRental.dataDevolucaoPrevista)}</span>
            </p>
            {nextReservation ? (
              <p className="card-note-line">
                <strong>Próxima reserva:</strong>
                <span>{formatDate(nextReservation.dataFesta)}</span>
              </p>
            ) : null}
          </div>
        ) : nextReservation ? (
          <div className="card-note card-note-rental">
            <p className="card-note-line">
              <strong>Próxima reserva:</strong>
              <span>{formatDate(nextReservation.dataFesta)}</span>
            </p>
            <p className="card-note-line">
              <strong>Cliente:</strong>
              <span title={nextReservation.clienteNome}>{nextReservation.clienteNome}</span>
            </p>
          </div>
        ) : (
          <p className="card-note card-note-muted">
            {dress.observacoes || 'Sem observações cadastradas.'}
          </p>
        )}

        <button className="button button-primary" type="button" onClick={onDetails}>
          Ver detalhes
        </button>
      </div>
    </article>
  )
}
