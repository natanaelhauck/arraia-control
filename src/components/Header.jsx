export default function Header({ onCreateDress, onOpenFinancial, onSignOut, disabled = false }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Arraiá Control</h1>
        <p className="header-summary">
          Gestão prática e segura de vestidos, reservas, aluguéis e devoluções.
        </p>
      </div>
      <div className="header-actions">
        <span className="session-user" aria-label="Usuária logada: Gabi">
          Gabi
        </span>
        <button
          className="button button-primary button-featured"
          type="button"
          onClick={onCreateDress}
          disabled={disabled}
        >
          Cadastrar vestido
        </button>
        <button
          className="button button-secondary button-with-icon"
          type="button"
          onClick={onOpenFinancial}
          disabled={disabled}
        >
          <span className="button-icon" aria-hidden="true">
            R$
          </span>
          Financeiro
        </button>
        <button className="button button-secondary" type="button" onClick={onSignOut}>
          Sair
        </button>
      </div>
    </header>
  )
}
