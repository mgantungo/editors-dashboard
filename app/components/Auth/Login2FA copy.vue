<!-- components/Auth/Login2FA.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">NV</div>
        <h1>New Vision Editor</h1>
        <p v-if="currentStep === 'email'">Sign in to your account</p>
        <p v-else-if="currentStep === 'token'">Enter verification code</p>
        <p v-else>Login successful</p>
      </div>

      <!-- Error Message -->
      <div v-if="auth2FAStore.error" class="error-banner">
        {{ auth2FAStore.error }}
      </div>

      <!-- Email & Password Step -->
      <form v-if="currentStep === 'email'" @submit.prevent="handleEmailSubmit" class="login-form">
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
          :disabled="auth2FAStore.isLoading"
        >
          <span v-if="auth2FAStore.isLoading" class="button-spinner"></span>
          {{ auth2FAStore.isLoading ? 'Sending code...' : 'Continue' }}
        </button>

        <div class="login-hint">
          <p>💡 <strong>Two-factor authentication enabled</strong></p>
          <p>You'll receive a verification code via email</p>
        </div>
      </form>

      <!-- Token Verification Step -->
      <form v-else-if="currentStep === 'token'" @submit.prevent="handleTokenSubmit" class="login-form">
        <div class="verification-info">
          <p>We sent a verification code to:</p>
          <p class="user-email">{{ auth2FAStore.email }}</p>
          <p class="verification-instruction">Check your email and enter the 8-digit code below.</p>
        </div>

        <div class="form-group">
          <label for="token">Verification Code</label>
          <input
            id="token"
            v-model="tokenInput"
            type="text"
            placeholder="Enter 8-digit code"
            maxlength="8"
            required
            :class="{ error: tokenError }"
            @input="handleTokenInput"
          />
          <div v-if="tokenError" class="error-message">{{ tokenError }}</div>
        </div>

        <button 
          type="submit" 
          class="login-button"
          :disabled="auth2FAStore.isLoading"
        >
          <span v-if="auth2FAStore.isLoading" class="button-spinner"></span>
          {{ auth2FAStore.isLoading ? 'Verifying...' : 'Verify & Sign In' }}
        </button>

        <div class="resend-section">
          <p>Didn't receive the code?</p>
          <button 
            type="button" 
            @click="handleResend" 
            class="resend-link" 
            :disabled="auth2FAStore.isLoading || isResending"
          >
            <span v-if="isResending" class="button-spinner-small"></span>
            {{ isResending ? 'Sending...' : 'Resend verification code' }}
          </button>
        </div>

        <button type="button" @click="handleBack" class="back-link">
          ← Back to email entry
        </button>
      </form>

      <!-- Success Step -->
      <div v-else class="success-step">
        <div class="success-icon">✓</div>
        <h2>Login Successful!</h2>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import stores at the top
import { useAuth2FAStore } from '~/stores/auth2fa'
import { useAuthStore } from '~/stores/auth'

const auth2FAStore = useAuth2FAStore()
const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const tokenInput = ref('')
const emailError = ref('')
const passwordError = ref('')
const tokenError = ref('')
const isResending = ref(false)

const currentStep = computed(() => auth2FAStore.loginStep)

// Auto-redirect on success
watch(currentStep, (newStep) => {
  if (newStep === 'success') {
    setTimeout(() => {
      router.push('/editor/')
    }, 2000)
  }
})

const clearErrors = () => {
  emailError.value = ''
  passwordError.value = ''
  tokenError.value = ''
  auth2FAStore.error = ''
}

const handleTokenInput = (event) => {
  // Auto-uppercase and remove non-alphanumeric characters
  tokenInput.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  clearErrors()
}

const handleEmailSubmit = async () => {
  clearErrors()
  
  // Basic validation
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  
  if (!email.value.endsWith('@newvision.co.ug')) {
    emailError.value = 'Only @newvision.co.ug emails are allowed'
    return
  }
  
  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  const result = await auth2FAStore.initiateLogin(email.value, password.value)
  
  if (!result.success) {
    // Set appropriate error field based on error message
    if (result.error.includes('email') || result.error.includes('Email')) {
      emailError.value = result.error
    } else if (result.error.includes('password') || result.error.includes('Password')) {
      passwordError.value = result.error
    } else {
      emailError.value = result.error
    }
  }
}

const handleTokenSubmit = async () => {
  clearErrors()
  
  if (!tokenInput.value) {
    tokenError.value = 'Verification code is required'
    return
  }
  
  if (tokenInput.value.length !== 8) {
    tokenError.value = 'Verification code must be 8 characters'
    return
  }

  const result = await auth2FAStore.verifyToken(tokenInput.value)
  
  if (!result.success) {
    tokenError.value = result.error
  }
}

const handleResend = async () => {
  isResending.value = true
  clearErrors()
  
  const result = await auth2FAStore.resendToken()
  
  if (!result.success) {
    auth2FAStore.error = result.error
  }
  
  isResending.value = false
}

const handleBack = () => {
  auth2FAStore.resetFlow()
  clearErrors()
}

// Reset store when component is mounted
onMounted(() => {
  auth2FAStore.resetFlow()
})
</script>

<style scoped>
/* Your existing styles remain the same */
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
  position: relative;
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

.error-banner {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  text-align: center;
}

.verification-info {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.user-email {
  font-weight: bold;
  color: #1a1d23;
  margin: 8px 0;
  font-size: 1.1rem;
}

.verification-instruction {
  color: #64748b;
  font-size: 0.875rem;
  margin: 8px 0 0 0;
}

.success-step {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 16px;
}

.resend-section {
  text-align: center;
  margin: 16px 0;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.resend-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 8px;
  font-size: 0.875rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.resend-link:hover:not(:disabled) {
  color: #2563eb;
  background: #f8fafc;
}

.resend-link:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-link {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  margin-top: 16px;
  width: 100%;
  padding: 8px;
  font-size: 0.875rem;
}

.back-link:hover {
  color: #374151;
  background: #f8fafc;
  border-radius: 4px;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
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
  width: 100%;
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

.button-spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 4px;
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