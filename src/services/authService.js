import { requireSupabase } from '../lib/supabaseClient.js'

export async function getCurrentSession() {
  const supabase = requireSupabase()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(`Não foi possível verificar a sessão: ${error.message}`)
  }

  return data.session
}

export function onAuthSessionChange(callback) {
  const supabase = requireSupabase()
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })

  return () => data.subscription.unsubscribe()
}

export async function signInWithEmailAndPassword(email, password) {
  const supabase = requireSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error('E-mail ou senha inválidos. Verifique os dados e tente novamente.')
  }

  return data.session
}

export async function signOut() {
  const supabase = requireSupabase()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Não foi possível sair: ${error.message}`)
  }
}
