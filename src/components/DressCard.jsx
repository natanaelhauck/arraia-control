import DressImage from './DressImage.jsx'
import StatusBadge from './StatusBadge.jsx'
import { formatDate } from '../utils/formatters.js'

export default function DressCard({ dress, onDetails }) {
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
            <dt>Tamanho</dt>
            <dd title={dress.tamanho}>{dress.tamanho}</dd>
          </div>
          <div>
            <dt>Cor</dt>
            <dd title={dress.cor}>{dress.cor}</dd>
          </div>
        </dl>

        {dress.currentRental ? (
          <p className="card-note">
            Cliente: {dress.currentRental.clienteNome} - devolução{' '}
            {formatDate(dress.currentRental.dataDevolucaoPrevista)}
          </p>
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
