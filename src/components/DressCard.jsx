import DressImage from './DressImage.jsx'
import StatusBadge from './StatusBadge.jsx'

export default function DressCard({ dress, onDetails }) {
  return (
    <article className="dress-card">
      <DressImage dress={dress} size="card" />

      <div className="dress-card-body">
        <div className="dress-card-title">
          <div>
            <span className="code-label">Código</span>
            <h3>{dress.code}</h3>
          </div>
          <StatusBadge status={dress.status} />
        </div>

        <dl className="dress-meta">
          <div>
            <dt>Tamanho</dt>
            <dd>{dress.size}</dd>
          </div>
          <div>
            <dt>Cor</dt>
            <dd>{dress.color}</dd>
          </div>
        </dl>

        <button className="button button-primary" type="button" onClick={onDetails}>
          Ver detalhes
        </button>
      </div>
    </article>
  )
}
