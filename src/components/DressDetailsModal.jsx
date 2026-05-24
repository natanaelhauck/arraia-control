import { useEffect, useState } from 'react'
import DressForm from './DressForm.jsx'
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

export default function DressDetailsModal({
  dress,
  dresses,
  onClose,
  onDeleteDress,
  onRegisterRental,
  onUpdateDress,
  onUpdateCurrentRental,
  onMarkReturned,
}) {
  const [mode, setMode] = useState('details')

  useEffect(() => {
    setMode('details')
  }, [dress.id])

  function confirmReturn() {
    const didConfirm = window.confirm(
      `Confirmar devolução do vestido ${dress.code}? O aluguel atual será movido para o histórico.`,
    )

    if (didConfirm) {
      onMarkReturned(dress.id)
      setMode('details')
    }
  }

  function confirmDelete() {
    const warning = dress.currentRental
      ? 'Este vestido está alugado. A exclusão removerá também o aluguel atual e o histórico.'
      : 'Esta ação removerá o vestido e o histórico de aluguéis.'

    const didConfirm = window.confirm(`Excluir o vestido ${dress.code}?\n\n${warning}`)

    if (didConfirm) {
      onDeleteDress(dress.id)
    }
  }

  function submitDressEdit(dressData) {
    onUpdateDress(dress.id, dressData)
    setMode('details')
  }

  function submitRentalEdit(dressId, rentalData) {
    onUpdateCurrentRental(dressId, rentalData)
    setMode('details')
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
            <h2 id="dress-details-title">{dress.code}</h2>
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
                onClick={() => setMode('editDress')}
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
              {mode === 'editDress' ? (
                <DressForm
                  dresses={dresses}
                  initialDress={dress}
                  onSubmit={submitDressEdit}
                  onCancel={() => setMode('details')}
                  title="Editar vestido"
                  eyebrow="Ajustes"
                  submitLabel="Salvar alterações"
                  statusLocked={dress.status === 'alugado'}
                  statusHint={
                    dress.status === 'alugado'
                      ? 'O status fica como alugado enquanto existir aluguel ativo.'
                      : ''
                  }
                  variant="inline"
                />
              ) : (
                <>
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
                </>
              )}
            </section>

            <section className="detail-section">
              <div className="detail-title-row">
                <h3>Aluguel atual</h3>
                {dress.currentRental && mode !== 'editRental' ? (
                  <div className="button-row">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => setMode('editRental')}
                    >
                      Editar aluguel
                    </button>
                    <button className="button button-success" type="button" onClick={confirmReturn}>
                      Marcar como devolvido
                    </button>
                  </div>
                ) : null}
              </div>

              {mode === 'editRental' && dress.currentRental ? (
                <RentalForm
                  dress={dress}
                  initialRental={dress.currentRental}
                  title="Editar aluguel atual"
                  submitLabel="Salvar aluguel"
                  onSubmit={submitRentalEdit}
                  onCancel={() => setMode('details')}
                />
              ) : dress.currentRental ? (
                <RentalInfo rental={dress.currentRental} />
              ) : (
                <p className="muted-text">Não existe aluguel ativo para este vestido.</p>
              )}
            </section>

            {dress.status !== 'alugado' && mode === 'details' ? (
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
