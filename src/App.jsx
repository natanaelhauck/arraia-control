import { useMemo, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import DressCard from './components/DressCard.jsx'
import DressDetailsModal from './components/DressDetailsModal.jsx'
import DressForm from './components/DressForm.jsx'
import Filters from './components/Filters.jsx'
import { loadDresses, saveDresses } from './utils/storage.js'

const emptyFilters = {
  query: '',
  status: 'todos',
}

function normalizeSearch(value) {
  return value.trim().toLowerCase()
}

function createId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `id-${Date.now()}-${Math.random()}`
}

export default function App() {
  const [dresses, setDresses] = useState(() => loadDresses())
  const [filters, setFilters] = useState(emptyFilters)
  const [selectedDressId, setSelectedDressId] = useState(null)
  const [storageNotice, setStorageNotice] = useState(null)

  function persist(nextDresses, successMessage = 'Alterações salvas neste navegador.') {
    setDresses(nextDresses)

    const didSave = saveDresses(nextDresses)
    setStorageNotice(
      didSave
        ? { type: 'success', message: successMessage }
        : {
            type: 'error',
            message: 'Não foi possível salvar no localStorage. Verifique o navegador.',
          },
    )

    return didSave
  }

  function handleCreateDress(dressData) {
    const nextDress = {
      id: createId(),
      code: dressData.code.trim().toUpperCase(),
      size: dressData.size.trim().toUpperCase(),
      color: dressData.color.trim(),
      photoUrl: dressData.photoUrl.trim(),
      status: dressData.status,
      currentRental: null,
      rentalHistory: [],
      createdAt: new Date().toISOString(),
    }

    persist([nextDress, ...dresses], `Vestido ${nextDress.code} cadastrado.`)
  }

  function handleUpdateDress(dressId, dressData) {
    const nextDresses = dresses.map((dress) => {
      if (dress.id !== dressId) {
        return dress
      }

      return {
        ...dress,
        code: dressData.code.trim().toUpperCase(),
        size: dressData.size.trim().toUpperCase(),
        color: dressData.color.trim(),
        photoUrl: dressData.photoUrl.trim(),
        status: dress.currentRental ? 'alugado' : dressData.status,
        updatedAt: new Date().toISOString(),
      }
    })

    persist(nextDresses, 'Dados do vestido atualizados.')
  }

  function handleDeleteDress(dressId) {
    const dressToDelete = dresses.find((dress) => dress.id === dressId)
    const nextDresses = dresses.filter((dress) => dress.id !== dressId)

    setSelectedDressId(null)
    persist(nextDresses, `Vestido ${dressToDelete?.code || ''} excluído.`)
  }

  function handleRegisterRental(dressId, rentalData) {
    const nextDresses = dresses.map((dress) => {
      if (dress.id !== dressId) {
        return dress
      }

      return {
        ...dress,
        status: 'alugado',
        currentRental: {
          id: createId(),
          ...rentalData,
          value: Number(rentalData.value),
          depositPaid: Number(rentalData.depositPaid),
          startedAt: new Date().toISOString(),
        },
      }
    })

    persist(nextDresses, 'Aluguel registrado.')
  }

  function handleUpdateCurrentRental(dressId, rentalData) {
    const nextDresses = dresses.map((dress) => {
      if (dress.id !== dressId || !dress.currentRental) {
        return dress
      }

      return {
        ...dress,
        currentRental: {
          ...dress.currentRental,
          ...rentalData,
          value: Number(rentalData.value),
          depositPaid: Number(rentalData.depositPaid),
          updatedAt: new Date().toISOString(),
        },
      }
    })

    persist(nextDresses, 'Aluguel atual atualizado.')
  }

  function handleMarkReturned(dressId) {
    const nextDresses = dresses.map((dress) => {
      if (dress.id !== dressId || !dress.currentRental) {
        return dress
      }

      const returnedRental = {
        ...dress.currentRental,
        returnedAt: new Date().toISOString(),
      }

      return {
        ...dress,
        status: 'disponivel',
        currentRental: null,
        rentalHistory: [returnedRental, ...dress.rentalHistory],
      }
    })

    persist(nextDresses, 'Vestido marcado como devolvido.')
  }

  const selectedDress = useMemo(
    () => dresses.find((dress) => dress.id === selectedDressId),
    [dresses, selectedDressId],
  )

  const filteredDresses = useMemo(() => {
    const search = normalizeSearch(filters.query)

    return dresses.filter((dress) => {
      const matchesStatus = filters.status === 'todos' || dress.status === filters.status
      const searchableText = `${dress.code} ${dress.color} ${dress.size}`.toLowerCase()
      const matchesSearch = !search || searchableText.includes(search)

      return matchesStatus && matchesSearch
    })
  }, [dresses, filters])

  const hasActiveFilters = filters.status !== 'todos' || filters.query.trim() !== ''
  const emptyStateTitle =
    dresses.length === 0 ? 'Nenhum vestido cadastrado ainda' : 'Nenhum vestido encontrado'
  const emptyStateDescription =
    dresses.length === 0
      ? 'Cadastre o primeiro vestido usando o formulário de cadastro.'
      : 'Ajuste a busca ou limpe os filtros para ver o acervo completo.'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Gestão de aluguel</p>
          <h1>Arraiá Control</h1>
        </div>
        <div className="header-side">
          <p className="header-summary">
            Controle vestidos, reservas e devoluções em um fluxo simples para o dia a dia.
          </p>
          <p className="storage-pill">Dados salvos automaticamente neste navegador</p>
        </div>
      </header>

      <main className="app-main">
        {storageNotice ? (
          <div className={`notice notice-${storageNotice.type}`} role="status">
            {storageNotice.message}
          </div>
        ) : null}

        <Dashboard dresses={dresses} />

        <section className="workspace-grid" aria-label="Área principal">
          <div className="content-stack">
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
                  {hasActiveFilters ? (
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => setFilters(emptyFilters)}
                    >
                      Limpar filtros
                    </button>
                  ) : null}
                </div>
              )}
            </section>
          </div>

          <aside className="side-panel" aria-label="Cadastro de vestido">
            <DressForm dresses={dresses} onSubmit={handleCreateDress} />
          </aside>
        </section>
      </main>

      {selectedDress ? (
        <DressDetailsModal
          dress={selectedDress}
          dresses={dresses}
          onClose={() => setSelectedDressId(null)}
          onDeleteDress={handleDeleteDress}
          onRegisterRental={handleRegisterRental}
          onUpdateDress={handleUpdateDress}
          onUpdateCurrentRental={handleUpdateCurrentRental}
          onMarkReturned={handleMarkReturned}
        />
      ) : null}
    </div>
  )
}
