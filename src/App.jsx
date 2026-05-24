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

export default function App() {
  const [dresses, setDresses] = useState(() => loadDresses())
  const [filters, setFilters] = useState(emptyFilters)
  const [selectedDressId, setSelectedDressId] = useState(null)

  function persist(nextDresses) {
    setDresses(nextDresses)
    saveDresses(nextDresses)
  }

  function handleCreateDress(dressData) {
    const nextDress = {
      id: crypto.randomUUID(),
      code: dressData.code.trim().toUpperCase(),
      size: dressData.size.trim().toUpperCase(),
      color: dressData.color.trim(),
      photoUrl: dressData.photoUrl.trim(),
      status: dressData.status,
      currentRental: null,
      rentalHistory: [],
      createdAt: new Date().toISOString(),
    }

    persist([nextDress, ...dresses])
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
          id: crypto.randomUUID(),
          ...rentalData,
          value: Number(rentalData.value),
          depositPaid: Number(rentalData.depositPaid),
          startedAt: new Date().toISOString(),
        },
      }
    })

    persist(nextDresses)
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

    persist(nextDresses)
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Gestão de aluguel</p>
          <h1>Arraiá Control</h1>
        </div>
        <p className="header-summary">
          Controle vestidos, reservas e devoluções em um fluxo simples para o dia a dia.
        </p>
      </header>

      <main className="app-main">
        <Dashboard dresses={dresses} />

        <section className="workspace-grid" aria-label="Area principal">
          <div className="content-stack">
            <Filters filters={filters} onChange={setFilters} />

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
                  <h3>Nenhum vestido encontrado</h3>
                  <p>Revise a busca ou selecione outro status.</p>
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
          onClose={() => setSelectedDressId(null)}
          onRegisterRental={handleRegisterRental}
          onMarkReturned={handleMarkReturned}
        />
      ) : null}
    </div>
  )
}
