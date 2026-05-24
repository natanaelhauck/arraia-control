import { initialDresses } from '../data/initialDresses.js'

const STORAGE_KEY = 'arraia-control:dresses'

export function loadDresses() {
  try {
    const storedDresses = localStorage.getItem(STORAGE_KEY)
    return storedDresses ? JSON.parse(storedDresses) : initialDresses
  } catch {
    return initialDresses
  }
}

export function saveDresses(dresses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dresses))
}
