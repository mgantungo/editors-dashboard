// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const lastActivity = ref(Date.now())
  const isLocked = ref(false)
  const allowedPublications = ref([])

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userInitials = computed(() => {
    if (!user.value) return ''
    return user.value.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  })

  // Actions
  const complete2FALogin = async (userData) => {
    try {
      console.log('🔄 Completing 2FA login for:', userData.email)
      
      // Create user object without shadowing the ref
      const userObj = {
        id: userData.id,
        name: userData.display_name || `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
        email: userData.email,
        username: userData.username, // Store username for API calls
        role: 'editor'
      }

      console.log('✅ Created user object:', userObj)

      // Update the refs
      user.value = userObj
      token.value = 'strapi-jwt-token-' + Date.now()
      lastActivity.value = Date.now()
      isLocked.value = false
      
      // Fetch user publications from API and set allowed publications
      await fetchUserPublications(userObj.username)
      
      // Update user object with permissions
      userObj.permissions = {
        allowedPublications: allowedPublications.value
      }

      // Save to localStorage
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('auth_user', JSON.stringify(userObj))
      
      console.log('✅ 2FA login completed successfully')
      return userObj
      
    } catch (error) {
      console.error('❌ Error in complete2FALogin:', error)
      throw error
    }
  }

  // Fetch user publications from API and set allowed publications
  const fetchUserPublications = async (username) => {
    try {
      console.log('🔄 Fetching publications for user:', username)
      
      const baseUrl = getBaseUrl()
      const response = await $fetch(`${baseUrl}/api/publications/author/${username}/call`)
      
      console.log('✅ User publications response:', response)

      if (response.publications && response.publications.length > 0) {
        // Extract publication IDs from the response
        const publicationIds = response.publications.map(pub => pub.id)
        allowedPublications.value = publicationIds
        
        console.log('🔑 Allowed publications for user:', publicationIds)
      } else {
        allowedPublications.value = []
        console.log('⚠️ No publications found for user')
      }
      
      return allowedPublications.value

    } catch (error) {
      console.error('❌ Error fetching user publications:', error)
      allowedPublications.value = []
      throw error
    }
  }

  // Helper to get base URL
  const getBaseUrl = () => {
    const config = useRuntimeConfig()
    return config.public.strapiBaseUrl || 'https://cms-vgad.visiongroup.co.ug'
  }

  const logout = () => {
    user.value = null
    token.value = null
    isLocked.value = false
    allowedPublications.value = []
    lastActivity.value = Date.now()
    
    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    
    console.log('✅ User logged out successfully')
  }

  const initializeAuth = () => {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        lastActivity.value = Date.now()
        
        // Set allowed publications from saved user data
        if (user.value.permissions) {
          allowedPublications.value = user.value.permissions.allowedPublications
        }
        
        console.log('✅ Auth initialized from localStorage')
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error)
      // Clear corrupted auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  const updateActivity = () => {
    lastActivity.value = Date.now()
    isLocked.value = false
  }

  const checkInactivity = () => {
    const now = Date.now()
    const inactiveTime = now - lastActivity.value
    const fiveMinutes = 5 * 60 * 1000
    
    if (inactiveTime > fiveMinutes && isAuthenticated.value) {
      isLocked.value = true
      console.log('🔒 Session locked due to inactivity')
    }
  }

  const unlock = async (password) => {
    try {
      console.log('🔄 Attempting to unlock session for:', user.value?.email)
      
      const baseUrl = getBaseUrl()
      
      // Use the same authentication endpoint as login
      const response = await $fetch(`${baseUrl}/api/authors/initiate-login/${user.value.email}/${password}`)
      
      console.log('✅ Unlock verification response:', response)
      
      if (response.success) {
        // Password is correct, unlock the session
        updateActivity()
        console.log('✅ Session unlocked successfully')
        return true
      } else {
        console.log('❌ Unlock failed: Invalid password')
        return false
      }
      
    } catch (error) {
      console.error('❌ Error during unlock:', error)
      console.error('Error details:', error.data)
      return false
    }
  }

  return {
    // State
    user,
    token,
    isLocked,
    allowedPublications,
    
    // Getters
    isAuthenticated,
    userInitials,
    
    // Actions
    complete2FALogin,
    fetchUserPublications,
    logout,
    initializeAuth,
    updateActivity,
    checkInactivity,
    unlock
  }
})