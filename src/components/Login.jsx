import { useState } from 'react'
import { signInWithEmailAndPassword } from '../services/authService.js'

export default function Login({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
          <p className="eyebrow">Acesso interno</p>
          <h1 id="login-title">Arraiá Control</h1>
        </div>

        <p className="login-summary">
          Entre com o e-mail e senha cadastrados no Supabase Auth para acessar o sistema.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
