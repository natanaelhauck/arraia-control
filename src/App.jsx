import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Login from './components/Login.jsx'
import DashboardCards from './components/DashboardCards.jsx'
import DressCard from './components/DressCard.jsx'
import DressDetailsModal from './components/DressDetailsModal.jsx'
import DressFormModal from './components/DressFormModal.jsx'
import Filters from './components/Filters.jsx'
import RentalFormModal from './components/RentalFormModal.jsx'
import {
  createDress,
  deleteDress,
  fetchDresses,
  updateDress,
} from './services/dressService.js'
import {
  createRental,
  markRentalReturned,
  updateRental,
} from './services/rentalService.js'
import { getCurrentSession, onAuthSessionChange, signOut } from './services/authService.js'
import { filterDresses, getDressFilterOptions } from './utils/filterDresses.js'

const emptyFilters = {
  query: '',
  status: 'todos',
  color: 'todas',
  size: 'todos',
}

export default function App() {
  const [session, setSession] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [dresses, setDresses] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [selectedDressId, setSelectedDressId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [dressFormState, setDressFormState] = useState({ open: false, dress: null })
  const [rentalFormState, setRentalFormState] = useState({
    open: false,
    dress: null,
    rental: null,
  })

  async function loadDresses() {
    setIsLoading(true)

    try {
      await refreshDresses()
    } catch (error) {
      setDresses([])
      setNotice({
        type: 'error',
        message: error.message || 'Não foi possível carregar os dados do Supabase.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshDresses() {
    const nextDresses = await fetchDresses()
    setDresses(nextDresses)
  }

  useEffect(() => {
    let unsubscribe = () => {}

    async function initializeAuth() {
      try {
        const currentSession = await getCurrentSession()
        setSession(currentSession)
        unsubscribe = onAuthSessionChange(setSession)
      } catch (error) {
        setNotice({
          type: 'error',
          message: error.message || 'Não foi possível verificar o acesso interno.',
        })
      } finally {
        setIsAuthLoading(false)
      }
    }

    initializeAuth()

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadDresses()
      return
    }

    setDresses([])
    setSelectedDressId(null)
    setIsLoading(false)
  }, [session])

  async function runAction(action, successMessage) {
    setIsSaving(true)

    try {
      await action()
      await refreshDresses()
      setNotice({ type: 'success', message: successMessage })
      return true
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Não foi possível concluir a ação.',
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  function closeDressForm() {
    setDressFormState({ open: false, dress: null })
  }

  function closeRentalForm() {
    setRentalFormState({ open: false, dress: null, rental: null })
  }

  async function handleSaveDress(dressData) {
    const isEditing = Boolean(dressFormState.dress)
    const didSave = await runAction(
      () => {
        if (isEditing) {
          return updateDress(dressFormState.dress.id, dressData)
        }

        return createDress(dressData)
      },
      isEditing ? 'Vestido atualizado com sucesso.' : 'Vestido cadastrado com sucesso.',
    )

    if (didSave) {
      closeDressForm()
    }

    return didSave
  }

  async function handleDeleteDress(dress) {
    const didDelete = await runAction(
      () => deleteDress(dress.id),
      `Vestido ${dress.codigo} excluído com sucesso.`,
    )

    if (didDelete) {
      setSelectedDressId(null)
    }
  }

  async function handleSaveRental(rentalData) {
    const isEditing = Boolean(rentalFormState.rental)
    const didSave = await runAction(
      () => {
        if (isEditing) {
          return updateRental(rentalFormState.rental.id, {
            ...rentalData,
            vestidoId: rentalFormState.rental.vestidoId,
          })
        }

        return createRental(rentalFormState.dress.id, rentalData)
      },
      isEditing ? 'Aluguel atualizado com sucesso.' : 'Aluguel registrado com sucesso.',
    )

    if (didSave) {
      closeRentalForm()
    }

    return didSave
  }

  async function handleMarkReturned(rental) {
    return runAction(
      () => markRentalReturned(rental),
      'Vestido marcado como devolvido e aluguel movido para o histórico.',
    )
  }

  async function handleSignOut() {
    try {
      setNotice(null)
      await signOut()
      setSession(null)
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Não foi possível sair.',
      })
    }
  }

  const selectedDress = useMemo(
    () => dresses.find((dress) => dress.id === selectedDressId),
    [dresses, selectedDressId],
  )

  const filteredDresses = useMemo(() => filterDresses(dresses, filters), [dresses, filters])
  const filterOptions = useMemo(() => getDressFilterOptions(dresses), [dresses])
  const hasActiveFilters =
    filters.status !== 'todos' ||
    filters.color !== 'todas' ||
    filters.size !== 'todos' ||
    filters.query.trim() !== ''
  const emptyStateTitle =
    dresses.length === 0 ? 'Nenhum vestido cadastrado ainda' : 'Nenhum vestido encontrado'
  const emptyStateDescription =
    dresses.length === 0
      ? 'Use o botão Cadastrar vestido para iniciar o acervo.'
      : 'Ajuste a busca ou limpe os filtros para ver o acervo completo.'

  if (isAuthLoading) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h1>Arraiá Control</h1>
          <p className="login-summary">Verificando sessão...</p>
        </section>
      </main>
    )
  }

  if (!session) {
    return <Login onAuthenticated={setSession} />
  }

  return (
    <div className="app-shell">
      <Header
        onCreateDress={() => setDressFormState({ open: true, dress: null })}
        onSignOut={handleSignOut}
        disabled={isSaving}
      />

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
            colorOptions={filterOptions.colors}
            sizeOptions={filterOptions.sizes}
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
                {isLoading ? 'Carregando...' : `${filteredDresses.length} de ${dresses.length}`}
              </span>
            </div>

            {isLoading ? (
              <div className="empty-state">
                <h3>Carregando acervo</h3>
                <p>Buscando vestidos e aluguéis no Supabase.</p>
              </div>
            ) : filteredDresses.length > 0 ? (
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
        isSaving={isSaving}
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
        isSaving={isSaving}
        onClose={closeRentalForm}
        onSubmit={handleSaveRental}
      />
    </div>
  )
}
