import { useState } from 'react'
import { signInWithEmailAndPassword } from '../services/authService.js'

export default function Login({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const session = await signInWithEmailAndPassword(email, password)
      onAuthenticated(session)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div>
          <h1 id="login-title">Arraiá Control</h1>
        </div>

        <p className="login-summary">
          Entre com o e-mail e senha cadastrados no Supabase Auth para acessar o sistema.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="login-password">Senha</label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M3 3l18 18" />
                    <path d="M10.7 5.1A10.7 10.7 0 0 1 12 5c5 0 8.5 4.1 9.6 5.6a2.3 2.3 0 0 1 0 2.8 17.3 17.3 0 0 1-3 3.2" />
                    <path d="M6.6 6.7a17.3 17.3 0 0 0-4.2 3.9 2.3 2.3 0 0 0 0 2.8C3.5 14.9 7 19 12 19a10.7 10.7 0 0 0 4.1-.8" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M2.4 10.6C3.5 9.1 7 5 12 5s8.5 4.1 9.6 5.6a2.3 2.3 0 0 1 0 2.8C20.5 14.9 17 19 12 19s-8.5-4.1-9.6-5.6a2.3 2.3 0 0 1 0-2.8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
