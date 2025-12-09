<!-- components/Auth/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <img src="/nv-product.ico" alt="New Vision Logo" class="logo-image">
        </div>
        <h1>New Vision Editor</h1>
        <p>Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="user@newvision.co.ug"
            required
            :class="{ error: emailError }"
            @input="clearErrors"
          />
          <div v-if="emailError" class="error-message">{{ emailError }}</div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            :class="{ error: passwordError }"
            @input="clearErrors"
          />
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </div>

        <button 
          type="submit" 
          class="login-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="button-spinner"></span>
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </button>

        <div class="login-hint">
          <p>💡 <strong>Demo credentials:</strong></p>
          <p>Email: any@newvision.co.ug (try: bukedde.editor@newvision.co.ug)</p>
          <p>Password: password</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')

const clearErrors = () => {
  emailError.value = ''
  passwordError.value = ''
}

const handleLogin = async () => {
  clearErrors()
  isLoading.value = true

  try {
    await authStore.login(email.value, password.value)
    // Navigation will be handled by the parent component
  } catch (error) {
    if (error.message.includes('email')) {
      emailError.value = error.message
    } else {
      passwordError.value = error.message
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  background: #3b82f6;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 16px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  color: #1a1d23;
  font-size: 1.5rem;
  font-weight: 700;
}

.login-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 4px;
}

.login-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.login-hint {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 16px;
}

.login-hint p {
  margin: 4px 0;
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
}
</style>