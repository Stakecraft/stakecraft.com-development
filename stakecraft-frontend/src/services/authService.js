import { API_BASE_URL } from '../config/api.js'

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function setAuthToken(token) {
  localStorage.setItem('auth_token', token)
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

export function getAuthUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuthUser(user) {
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Login failed')
  }

  setAuthToken(data.token)
  setAuthUser(data.user)
  return data
}

export async function logout() {
  const token = getAuthToken()
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {
      // ignore logout errors
    }
  }
  clearAuthToken()
}

export async function fetchCurrentUser() {
  const token = getAuthToken()
  if (!token) return null

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!response.ok) {
    clearAuthToken()
    return null
  }

  const data = await response.json()
  setAuthUser(data.user)
  return data.user
}
