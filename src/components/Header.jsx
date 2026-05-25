export default function Header({ onCreateDress, onSignOut, disabled = false }) {
  return (
    <header className="app-header">
      <div className="header-title">
        <p className="eyebrow">Gestão de aluguel</p>
        <h1>Arraiá Control</h1>
      </div>
      <p className="header-summary">
        Gestão prática e segura de vestidos, reservas, aluguéis e devoluções.
      </p>
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
        <button className="button button-secondary" type="button" onClick={onSignOut}>
          Sair
        </button>
      </div>
    </header>
  )
}
