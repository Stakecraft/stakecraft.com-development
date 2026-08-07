<template>
  <div class="login-page" :class="`van-theme-${theme}`">
    <div class="login-card">
      <h1 class="login-title">StakeCraft Admin</h1>
      <p class="login-subtitle">Sign in to manage site content</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field-label">Username or email</span>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            required
            :disabled="loading"
            class="field-input"
          />
        </label>

        <label class="field">
          <span class="field-label">Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            :disabled="loading"
            class="field-input"
          />
        </label>

        <p v-if="error" class="login-error" role="alert">{{ error }}</p>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../services/authService'

const theme = inject('theme', 'light')
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(username.value, password.value)

    // Only follow a same-site path. Taking an arbitrary URL from the query
    // string would turn this page into an open redirect that a phishing link
    // could point at an external site after a genuine login.
    const target = route.query.redirect
    const safeTarget =
      typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
        ? target
        : '/notadmin'

    router.replace(safeTarget)
  } catch (err) {
    error.value = err.message || 'Login failed'
    password.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: #f4f5f7;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.login-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.login-subtitle {
  margin: 0.35rem 0 1.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.field-input {
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #111827;
  background: #ffffff;
  transition: border-color 0.15s ease;
}

.field-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.field-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.login-error {
  margin: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.85rem;
}

.login-button {
  margin-top: 0.25rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.login-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.login-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Dark theme */
.login-page.van-theme-dark {
  background: #0f172a;
}

.van-theme-dark .login-card {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.van-theme-dark .login-title {
  color: #f1f5f9;
}

.van-theme-dark .login-subtitle {
  color: #94a3b8;
}

.van-theme-dark .field-label {
  color: #cbd5e1;
}

.van-theme-dark .field-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.van-theme-dark .field-input:disabled {
  background: #1e293b;
}

.van-theme-dark .login-error {
  background: rgba(185, 28, 28, 0.15);
  color: #fca5a5;
}
</style>
