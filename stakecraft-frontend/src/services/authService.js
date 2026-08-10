import { ref, computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const TOKEN_KEY = 'stakecraft_admin_token'
const USER_KEY = 'stakecraft_admin_user'

// Reactive session state so the UI can react to login and logout without a
// page reload.
const token = ref(localStorage.getItem(TOKEN_KEY) || null)
const user = ref(readStoredUser())

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Reads the `exp` claim without verifying the signature.
 *
 * This is a user-experience helper only - it lets the app show the login form
 * instead of firing a request that is certain to fail. The signature is
 * verified on the server; nothing here is a security control, and a tampered
 * token simply gets rejected by the API.
 */
function getTokenExpiry(jwt) {
  try {
    const [, payload] = jwt.split('.')
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

function isExpired(jwt) {
  const expiry = getTokenExpiry(jwt)
  // Treat an unreadable token as expired: it cannot be useful.
  if (!expiry) return true
  // 10s of slack absorbs clock skew between browser and server.
  return Date.now() >= expiry - 10_000
}

function persist(newToken, newUser) {
  token.value = newToken
  user.value = newUser
  localStorage.setItem(TOKEN_KEY, newToken)
  localStorage.setItem(USER_KEY, JSON.stringify(newUser))
}

export function clearSession() {
  token.value = null
  user.value = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken() {
  if (!token.value) return null
  if (isExpired(token.value)) {
    clearSession()
    return null
  }
  return token.value
}

export const isAuthenticated = computed(() => Boolean(getToken()))
export const currentUser = computed(() => user.value)
export const isAdmin = computed(() => user.value?.role === 'admin')

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many attempts. Please wait a few minutes and try again.')
    }
    // The API returns a single generic message for both unknown users and bad
    // passwords; keep it that way rather than inventing a specific one.
    throw new Error(data.error || 'Login failed')
  }

  if (!data.token) {
    throw new Error('Login failed')
  }

  persist(data.token, data.user)
  return data.user
}

export async function logout() {
  const current = getToken()
  if (current) {
    // Best effort: the token is stateless, so the client discarding it is what
    // actually ends the session.
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${current}` }
      })
    } catch {
      /* network failure must not block logging out locally */
    }
  }
  clearSession()
}

/**
 * Confirms the stored token is still accepted by the server. Used by the
 * router guard so a revoked or deactivated account cannot linger on screen.
 */
export async function verifySession() {
  const current = getToken()
  if (!current) return false

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${current}` }
    })
    if (!response.ok) {
      clearSession()
      return false
    }
    const data = await response.json()
    if (data.user) {
      persist(current, data.user)
    }
    return true
  } catch {
    // A network error is not proof the session is invalid, so keep it and let
    // the next API call decide.
    return true
  }
}

export function authHeaders() {
  const current = getToken()
  return current ? { Authorization: `Bearer ${current}` } : {}
}

export const getAuthToken = getToken
export const clearAuthToken = clearSession
