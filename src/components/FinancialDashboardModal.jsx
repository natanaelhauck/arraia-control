import { useEffect } from 'react'
import FinancialDashboard from './FinancialDashboard.jsx'

export default function FinancialDashboardModal({ open, dresses, isLoading, onClose }) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="modal-backdrop financial-modal-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <section
        className="modal financial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="financial-modal-title"
      >
        <div className="modal-header financial-modal-header">
          <div>
            <p className="eyebrow">FINANCEIRO</p>
            <h2 id="financial-modal-title">Resumo financeiro</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>

        <div className="financial-modal-body">
          <FinancialDashboard dresses={dresses} isLoading={isLoading} showHeading={false} />
        </div>
      </section>
    </div>
  )
}
