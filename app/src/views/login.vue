<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Welcome Back</h1>
      <p class="subtitle">Sign in to continue</p>

      <div class="error" v-if="error">{{ error }}</div>

      <div class="field">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="you@example.com" />
      </div>

      <div class="field">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="••••••••" />
      </div>

      <button class="submit-btn" @click="handleLogin" :disabled="loading">
        {{ loading ? 'Signing in...' : '▶ SIGN IN' }}
      </button>

      <button class="alt-btn" @click="handleSignup" :disabled="loading">
        No account? Sign Up
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (err) {
    error.value = err.message
  } else {
    router.push('/menu')
  }

  loading.value = false
}

async function handleSignup() {
  loading.value = true
  error.value = ''

  const { error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (err) {
    error.value = err.message
  } else {
    error.value = 'Check your email to confirm your account!'
  }

  loading.value = false
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
  opacity: 0.4;
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
  background: rgba(255, 255, 255, 0.25);
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