<template>
  <div class="login-overlay">
    <div class="login-card">
      <h2>StakeCraft Admin</h2>
      <p class="login-sub">Sign in to manage site content.</p>
      <form @submit.prevent="handleLogin">
        <label>
          Username or email
          <input v-model="username" type="text" required autocomplete="username" />
        </label>
        <label>
          Password
          <input v-model="password" type="password" required autocomplete="current-password" />
        </label>
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { login } from '../services/authService.js'

export default {
  name: 'AdminLogin',
  emits: ['authenticated'],
  setup(_, { emit }) {
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      error.value = ''
      loading.value = true
      try {
        await login(username.value, password.value)
        emit('authenticated')
      } catch (err) {
        error.value = err.message || 'Login failed'
      } finally {
        loading.value = false
      }
    }

    return { username, password, error, loading, handleLogin }
  }
}
</script>

<style scoped>
.login-overlay {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1d1e27;
  padding: 2rem;
}
.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
h2 { margin: 0 0 0.25rem; font-size: 1.5rem; }
.login-sub { color: #5b666f; margin-bottom: 1.5rem; font-size: 0.95rem; }
form { display: flex; flex-direction: column; gap: 1rem; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.875rem; font-weight: 600; }
input {
  padding: 0.65rem 0.75rem;
  border: 1px solid #dfe4e8;
  border-radius: 6px;
  font-size: 1rem;
}
.login-error { color: #b3261e; font-size: 0.875rem; margin: 0; }
.login-btn {
  background: #0e7c86;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
