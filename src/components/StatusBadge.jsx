import { statusLabels } from '../utils/formatters.js'

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{statusLabels[status]}</span>
}
