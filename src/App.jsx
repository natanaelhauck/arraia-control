import { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import DashboardCards from './components/DashboardCards.jsx'
import DressCard from './components/DressCard.jsx'
import DressDetailsModal from './components/DressDetailsModal.jsx'
import DressFormModal from './components/DressFormModal.jsx'
import Filters from './components/Filters.jsx'
import RentalFormModal from './components/RentalFormModal.jsx'
import {
  createAluguel,
  createVestido,
  deleteVestido,
  fetchVestidos,
  markAluguelReturned,
  updateAluguel,
  updateVestido,
} from './services/storageService.js'

const emptyFilters = {
  query: '',
  status: 'todos',
}

function normalizeSearch(value) {
  return value.trim().toLowerCase()
}

export default function App() {
  const [dresses, setDresses] = useState(() => fetchVestidos())
  const [filters, setFilters] = useState(emptyFilters)
  const [selectedDressId, setSelectedDressId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [dressFormState, setDressFormState] = useState({ open: false, dress: null })
  const [rentalFormState, setRentalFormState] = useState({
    open: false,
    dress: null,
    rental: null,
  })

  function refreshDresses() {
    const nextDresses = fetchVestidos()
    setDresses(nextDresses)
    return nextDresses
  }

  function runAction(action, successMessage) {
    try {
      action()
      refreshDresses()
      setNotice({ type: 'success', message: successMessage })
      return true
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Não foi possível concluir a ação.',
      })
      return false
    }
  }

  function closeDressForm() {
    setDressFormState({ open: false, dress: null })
  }

  function closeRentalForm() {
    setRentalFormState({ open: false, dress: null, rental: null })
  }

  function handleSaveDress(dressData) {
    const isEditing = Boolean(dressFormState.dress)
    const didSave = runAction(
      () => {
        if (isEditing) {
          updateVestido(dressFormState.dress.id, dressData)
        } else {
          createVestido(dressData)
        }
      },
      isEditing ? 'Vestido atualizado com sucesso.' : 'Vestido cadastrado com sucesso.',
    )

    if (didSave) {
      closeDressForm()
    }

    return didSave
  }

  function handleDeleteDress(dress) {
    const didDelete = runAction(
      () => deleteVestido(dress.id),
      `Vestido ${dress.codigo} excluído com sucesso.`,
    )

    if (didDelete) {
      setSelectedDressId(null)
    }
  }

  function handleSaveRental(rentalData) {
    const isEditing = Boolean(rentalFormState.rental)
    const didSave = runAction(
      () => {
        if (isEditing) {
          updateAluguel(rentalFormState.rental.id, rentalData)
        } else {
          createAluguel(rentalFormState.dress.id, rentalData)
        }
      },
      isEditing ? 'Aluguel atualizado com sucesso.' : 'Aluguel registrado com sucesso.',
    )

    if (didSave) {
      closeRentalForm()
    }

    return didSave
  }

  function handleMarkReturned(rental) {
    runAction(
      () => markAluguelReturned(rental.id),
      'Vestido marcado como devolvido e aluguel movido para o histórico.',
    )
  }

  const selectedDress = useMemo(
    () => dresses.find((dress) => dress.id === selectedDressId),
    [dresses, selectedDressId],
  )

  const filteredDresses = useMemo(() => {
    const search = normalizeSearch(filters.query)

    return dresses.filter((dress) => {
      const matchesStatus = filters.status === 'todos' || dress.status === filters.status
      const searchableText =
        `${dress.codigo} ${dress.cor} ${dress.tamanho} ${dress.observacoes}`.toLowerCase()
      const matchesSearch = !search || searchableText.includes(search)

      return matchesStatus && matchesSearch
    })
  }, [dresses, filters])

  const hasActiveFilters = filters.status !== 'todos' || filters.query.trim() !== ''
  const emptyStateTitle =
    dresses.length === 0 ? 'Nenhum vestido cadastrado ainda' : 'Nenhum vestido encontrado'
  const emptyStateDescription =
    dresses.length === 0
      ? 'Use o botão Cadastrar vestido para iniciar o acervo.'
      : 'Ajuste a busca ou limpe os filtros para ver o acervo completo.'

  return (
    <div className="app-shell">
      <Header onCreateDress={() => setDressFormState({ open: true, dress: null })} />

      <main className="app-main">
        {notice ? (
          <div className={`notice notice-${notice.type}`} role="status">
            {notice.message}
          </div>
        ) : null}

        <DashboardCards dresses={dresses} />

        <section className="content-stack" aria-label="Área principal">
          <Filters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(emptyFilters)}
          />

          <section className="dress-list-section" aria-labelledby="dress-list-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Acervo</p>
                <h2 id="dress-list-title">Vestidos cadastrados</h2>
              </div>
              <span className="result-count">
                {filteredDresses.length} de {dresses.length}
              </span>
            </div>

            {filteredDresses.length > 0 ? (
              <div className="dress-grid">
                {filteredDresses.map((dress) => (
                  <DressCard
                    key={dress.id}
                    dress={dress}
                    onDetails={() => setSelectedDressId(dress.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>{emptyStateTitle}</h3>
                <p>{emptyStateDescription}</p>
                <div className="button-row">
                  {hasActiveFilters ? (
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => setFilters(emptyFilters)}
                    >
                      Limpar filtros
                    </button>
                  ) : null}
                  {dresses.length === 0 ? (
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => setDressFormState({ open: true, dress: null })}
                    >
                      Cadastrar vestido
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>

      <DressFormModal
        open={dressFormState.open}
        dresses={dresses}
        initialDress={dressFormState.dress}
        onClose={closeDressForm}
        onSubmit={handleSaveDress}
      />

      {selectedDress ? (
        <DressDetailsModal
          dress={selectedDress}
          onClose={() => setSelectedDressId(null)}
          onDeleteDress={handleDeleteDress}
          onEditDress={(dress) => setDressFormState({ open: true, dress })}
          onRegisterRental={(dress) => setRentalFormState({ open: true, dress, rental: null })}
          onEditRental={(dress, rental) => setRentalFormState({ open: true, dress, rental })}
          onMarkReturned={handleMarkReturned}
        />
      ) : null}

      <RentalFormModal
        open={rentalFormState.open}
        dress={rentalFormState.dress}
        initialRental={rentalFormState.rental}
        onClose={closeRentalForm}
        onSubmit={handleSaveRental}
      />
    </div>
  )
}
