// stores/auth2fa.js - Using runtime config
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuth2FAStore = defineStore('auth2fa', () => {
  // State
  const loginStep = ref('email')
  const email = ref('')
  const token = ref('')
  const isLoading = ref(false)
  const error = ref('')
  const pendingUserId = ref(null)

  // Getters
  const currentStep = computed(() => loginStep.value)

  // Helper to get base URL
  const getBaseUrl = () => {
    const config = useRuntimeConfig()
    return config.public.strapiBaseUrl || 'https://cms-vgad.visiongroup.co.ug'
  }

  // Actions
  const initiateLogin = async (userEmail, password) => {
    isLoading.value = true
    error.value = ''

    try {
      const baseUrl = getBaseUrl()
      console.log('🔄 Initiating login for:', userEmail, 'using URL:', baseUrl)
      
      const response = await $fetch(`${baseUrl}/api/authors/initiate-login/${userEmail}/${password}`)
      
      console.log('✅ Login initiation response:', response)
      
      if (response.success) {
        email.value = userEmail
        pendingUserId.value = response.userId
        loginStep.value = 'token'

        console.log(`${pendingUserId.value} - ${loginStep.value} - `);
        return { success: true }
      } else {
        throw new Error(response.error?.message || 'Login initiation failed')
      }
    } catch (err) {
      console.error('❌ Login initiation error:', err)
      console.error('Error details:', err.data)
      error.value = err.data?.message || err.message || 'Login failed. Please try again.'
      //return { success: false, error: error.value }
      return { success: false, error:"Login failed. Please try again" }
    } finally {
      isLoading.value = false
    }
  }

  const verifyToken = async (verificationToken) => {
    isLoading.value = true
    error.value = ''

    try {
      const baseUrl = getBaseUrl()
      console.log('🔄 Verifying token for:', email.value)
      
      const response = await $fetch(`${baseUrl}/api/authors/verify-token`, {
        method: 'POST',
        body: {
          email: email.value,
          token: verificationToken
        }
      })

      console.log('✅ Token verification response:', response)

      if (response.success) {
        loginStep.value = 'success'
        
        const authStore = useAuthStore()
        await authStore.complete2FALogin(response.user)
        
        return { success: true, user: response.user }
      } else {
        throw new Error(response.error?.message || 'Token verification failed')
      }
    } catch (err) {
      console.error('❌ Token verification error:', err)
      console.error('Error details:', err.data)
      error.value = err.data?.message || err.message || 'Token verification failed. Please try again.'
      //return { success: false, error: error.value }
      return { success: false, error: "Token verification failed. Please try again" }
    } finally {
      isLoading.value = false
    }
  }

  const resendToken = async () => {
    isLoading.value = true
    error.value = ''

    try {
      const baseUrl = getBaseUrl()
      console.log('🔄 Resending token for:', email.value)
      
      const response = await $fetch(`${baseUrl}/api/authors/resend-token`, {
        method: 'POST',
        body: {
          email: email.value
        }
      })

      console.log('✅ Resend token response:', response)

      if (response.success) {
        error.value = 'New verification code sent to your email'
        return { success: true }
      } else {
        throw new Error(response.error?.message || 'Failed to resend token')
      }
    } catch (err) {
      console.error('❌ Resend token error:', err)
      console.error('Error details:', err.data)
      error.value = err.data?.message || err.message || 'Failed to resend token. Please try again.'
      //return { success: false, error: error.value }
      return { success: false, error: "Failed to resend token. Please try again"}
    } finally {
      isLoading.value = false
    }
  }

  const resetFlow = () => {
    loginStep.value = 'email'
    email.value = ''
    token.value = ''
    error.value = ''
    pendingUserId.value = null
    isLoading.value = false
    console.log('🔄 Login flow reset')
  }

  return {
    // State
    loginStep,
    email,
    token,
    isLoading,
    error,
    pendingUserId,
    
    // Getters
    currentStep,
    
    // Actions
    initiateLogin,
    verifyToken,
    resendToken,
    resetFlow
  }
})