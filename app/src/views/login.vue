<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Welcome Back</h1>
      <p class="subtitle">Sign in to continue</p>

      <div class="error" v-if="error">
        {{ error }}
      </div>

      <div class="field">
        <label>Email</label>
        <input v-model="email" type="text" placeholder="you@example.com" />
      </div>

      <div class="field">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="••••••••" />
      </div>

      <button class="submit-btn" @click="handleLogin" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>

      <button class="alt-btn" @click="handleSignup" :disabled="loading">No account? Sign Up</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Ensure a simple profile row exists for the user (username derived from email).
async function ensureProfile(userId, emailVal) {
  if (!userId) return
  var localName = String(emailVal || '').split('@')[0]
  if (!localName) localName = 'Guest'
  try {
    await supabase.from('profiles').upsert({ id: userId, username: localName }).select()
  } catch (e) {
    console.warn('profiles upsert failed', e)
  }
}

// Handle sign-in with email+password.
async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    var res = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (res && res.error) throw res.error

    var user = null
    if (res && res.data && res.data.user) user = res.data.user

    // Ensure profile row exists (use signup email as fallback)
    await ensureProfile(user && user.id ? user.id : null, (user && user.email) || email.value)

    // Set the user in the store (safe fallbacks)
    gameStore.setCurrentUser({
      id: user && user.id ? user.id : null,
      email: user && user.email ? user.email : email.value,
      username: String(((user && user.email) || email.value).split('@')[0] || 'Guest'),
    })

    await router.push('/menu')
  } catch (err) {
    error.value = err && err.message ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}

// Handle a signup request.
async function handleSignup() {
  loading.value = true
  error.value = ''
  try {
    var res = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (res && res.error) throw res.error

    // Try to obtain a user object (may require confirmation depending on Supabase settings).
    var user = null
    if (res && res.data && res.data.user) user = res.data.user
    if (!user) {
      try {
        user = await getCurrentUser()
      } catch (e) {
        user = null
      }
    }

    await ensureProfile(user && user.id ? user.id : null, email.value)

    gameStore.setCurrentUser({
      id: user && user.id ? user.id : null,
      email: email.value,
      username: String(email.value.split('@')[0] || 'Guest'),
    })

    await router.push('/menu')
  } catch (err) {
    error.value = err && err.message ? err.message : 'Signup failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1a001a;
}

.login-card {
  background: #920075;
  padding: 40px;
  border-radius: 20px;
  color: white;
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

h1 {
  margin: 0;
}

.subtitle {
  margin: 0;
  opacity: 0.7;
  font-size: 14px;
}

.error {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.5);
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 13px;
  opacity: 0.8;
}

input {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 16px;
  outline: none;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

input:focus {
  background: rgba(255, 255, 255, 0.25);
}

.submit-btn {
  padding: 15px;
  border-radius: 12px;
  border: none;
  background: #f6019d;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #ff2fb2;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alt-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.alt-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}
</style>
