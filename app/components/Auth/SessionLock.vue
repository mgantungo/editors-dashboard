<!-- components/Auth/SessionLock.vue -->
<template>
  <div class="session-lock">
    <div class="lock-overlay">
      <div class="lock-card">
        <div class="lock-header">
          <div class="user-avatar">
            {{ authStore.userInitials }}
          </div>
          <h2>Session Locked</h2>
          <p>Welcome back, {{ authStore.user?.name }}</p>
        </div>

        <form @submit.prevent="handleUnlock" class="lock-form">
          <div class="form-group">
            <label for="lock-password">Password</label>
            <input
              id="lock-password"
              v-model="password"
              type="password"
              placeholder="Enter your password to continue"
              required
              :class="{ error: unlockError }"
              @input="clearErrors"
            />
            <div v-if="unlockError" class="error-message">{{ unlockError }}</div>
          </div>

          <button 
            type="submit" 
            class="unlock-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="button-spinner"></span>
            {{ isLoading ? 'Unlocking...' : 'Unlock Session' }}
          </button>
        </form>

        <div class="lock-footer">
          <p>Session locked due to inactivity</p>
          <button @click="handleLogout" class="logout-link" :disabled="isLoggingOut">
            <span v-if="isLoggingOut" class="button-spinner-small"></span>
            {{ isLoggingOut ? 'Signing out...' : 'Sign in as different user' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()

const password = ref('')
const isLoading = ref(false)
const isLoggingOut = ref(false)
const unlockError = ref('')

const clearErrors = () => {
  unlockError.value = ''
}

const handleUnlock = async () => {
  isLoading.value = true
  unlockError.value = ''

  try {
    const success = await authStore.unlock(password.value)
    if (!success) {
      unlockError.value = 'Invalid password'
    } else {
      password.value = ''
    }
  } catch (error) {
    unlockError.value = 'Failed to unlock session'
    console.error('Unlock error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  try {
    // Clear the session lock state first
    authStore.isLocked = false
    
    // Then logout
    await authStore.logout()
    
    // Force a page reload to reset all states completely
    window.location.reload()
    
  } catch (error) {
    console.error('Logout error:', error)
    // Fallback: still reload the page
    window.location.reload()
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.session-lock {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lock-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.lock-header {
  margin-bottom: 32px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 16px;
}

.lock-header h2 {
  margin: 0 0 8px 0;
  color: #1a1d23;
  font-size: 1.5rem;
  font-weight: 700;
}

.lock-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.lock-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
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
  text-align: left;
}

.unlock-button {
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

.unlock-button:hover:not(:disabled) {
  background: #2563eb;
}

.unlock-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.lock-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.lock-footer p {
  margin: 0 0 12px 0;
  color: #64748b;
  font-size: 0.875rem;
}

.logout-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  transition: color 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.logout-link:hover:not(:disabled) {
  color: #2563eb;
  background: #f8fafc;
}

.logout-link:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>