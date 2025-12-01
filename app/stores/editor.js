//stores/editor.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  // State
  const publications = ref([])
  const currentPublication = ref(null)
  const articles = ref([])
  const authors = ref([])
  const categories = ref([])
  const media = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Helper to get base URL
  const getBaseUrl = () => {
    const config = useRuntimeConfig()
    return config.public.strapiBaseUrl || 'https://cms-vgad.visiongroup.co.ug'
  }

  // Getters
  const currentArticles = computed(() => {
    if (!currentPublication.value) return []
    return articles.value.filter(article => article.publicationId === currentPublication.value.id)
  })

  const publicationCategories = computed(() => {
    if (!currentPublication.value) return []
    return categories.value.filter(cat => cat.publicationId === currentPublication.value.id)
  })

  const articleCounts = computed(() => {
    const counts = {}
    publications.value.forEach(pub => {
      counts[pub.id] = articles.value.filter(a => a.publicationId === pub.id).length
    })
    return counts
  })

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (err) => {
    error.value = err
    setTimeout(() => { error.value = null }, 5000)
  }

  // Fetch user publications and categories from API
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const authStore = useAuthStore()
      
      if (!authStore.user) {
        throw new Error('No user logged in')
      }

      const baseUrl = getBaseUrl()
      const username = authStore.user.username || authStore.user.name
      
      console.log('🔄 Fetching user data for:', username)
      
      const response = await $fetch(`${baseUrl}/api/publications/author/${username}/call`)
      
      console.log('✅ User data response:', response)

      // Transform the API response to match our store structure
      if (response.publications) {
        publications.value = response.publications.map(pub => ({
          id: pub.id,
          name: pub.name,
          slug: pub.slug,
          description: pub.description
        }))

        // Extract and flatten all categories from publications
        const allCategories = []
        response.publications.forEach(pub => {
          if (pub.categories && pub.categories.length > 0) {
            pub.categories.forEach(cat => {
              allCategories.push({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                publicationId: pub.id
              })
            })
          }
        })
        
        categories.value = allCategories
      }

      console.log('✅ Transformed publications:', publications.value)
      console.log('✅ Transformed categories:', categories.value)

      return {
        publications: publications.value,
        categories: categories.value
      }

    } catch (err) {
      console.error('❌ Error fetching user data:', err)
      setError(err.data?.message || err.message || 'Failed to fetch user publications')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch articles by author with date range
  const fetchArticlesByAuthor = async (username, startDate = null, endDate = null) => {
    try {
      setLoading(true)
      const baseUrl = getBaseUrl()
      
      // Calculate default date range (last 6 months)
      if (!endDate) {
        endDate = new Date().toISOString().split('T')[0]
      }
      if (!startDate) {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        startDate = sixMonthsAgo.toISOString().split('T')[0]
      }

      console.log('🔄 Fetching articles for:', username, 'from', startDate, 'to', endDate)
      
      const response = await $fetch(`${baseUrl}/api/posts/author/${username}/${startDate}/${endDate}`)
      
      console.log('✅ Articles API response:', response)

      // Use the exact structure from the API response
      if (response.data && response.data.articles) {
        articles.value = response.data.articles
        console.log(`✅ Articles loaded into store: ${articles.value.length}`)
      } else if (response.articles) {
        // Fallback for different response structure
        articles.value = response.articles
        console.log(`✅ Articles loaded into store (fallback): ${articles.value.length}`)
      } else {
        console.warn('⚠️ No articles found in response')
        articles.value = []
      }

      return articles.value

    } catch (err) {
      console.error('❌ Error fetching articles:', err)
      setError(err.data?.message || err.message || 'Failed to fetch articles')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const setCurrentPublication = async (publication) => {
    currentPublication.value = publication
    // Filter articles for the current publication
    await fetchArticles(publication.id)
  }

  const fetchArticles = async (publicationId = null) => {
    try {
      setLoading(true)
      const authStore = useAuthStore()
      
      if (!authStore.user) {
        throw new Error('No user logged in')
      }

      const username = authStore.user.username || authStore.user.name
      
      // Fetch articles for the current user
      await fetchArticlesByAuthor(username)
      
      // Filter by publication if specified
      if (publicationId) {
        const filteredArticles = articles.value.filter(article => article.publicationId === publicationId)
        return filteredArticles
      }
      
      return articles.value

    } catch (err) {
      setError(err.message || 'Failed to fetch articles')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      // Extract authors from articles
      const allAuthors = []
      const authorMap = new Map()
      
      articles.value.forEach(article => {
        if (article.authors && article.authors.length > 0) {
          article.authors.forEach(author => {
            if (!authorMap.has(author.id)) {
              authorMap.set(author.id, true)
              allAuthors.push({
                id: author.id,
                name: author.display_name || author.username,
                slug: author.username,
                bio: author.bio || 'n/a'
              })
            }
          })
        }
      })
      
      authors.value = allAuthors
      return authors.value

    } catch (err) {
      setError(err.message || 'Failed to fetch authors')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async (publicationId = null) => {
    try {
      setLoading(true)
      // Categories are already loaded from user data
      if (publicationId) {
        return categories.value.filter(cat => cat.publicationId === publicationId)
      } else {
        return categories.value
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch categories')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createArticle = async (articleData) => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const authStore = useAuthStore()
      const newArticle = {
        id: Date.now(),
        ...articleData,
        createdBy: authStore.user?.id,
        createdByName: authStore.user?.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      articles.value.push(newArticle)
      return newArticle
    } catch (err) {
      setError(err.message || 'Failed to create article')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateArticle = async (articleId, articleData) => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const authStore = useAuthStore()
      const index = articles.value.findIndex(article => article.id === parseInt(articleId))
      if (index === -1) throw new Error('Article not found')
      
      const updatedArticle = {
        ...articles.value[index],
        ...articleData,
        updatedBy: authStore.user?.id,
        updatedByName: authStore.user?.name,
        updatedAt: new Date().toISOString()
      }
      articles.value[index] = updatedArticle
      return updatedArticle
    } catch (err) {
      setError(err.message || 'Failed to update article')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const initializeStore = async () => {
    await fetchUserData() // This replaces the dummy data initialization
    await fetchArticles() // Fetch real articles after login
    await fetchAuthors()
  }

  return {
    // State
    publications,
    currentPublication,
    articles,
    authors,
    categories,
    media,
    isLoading,
    error,
    
    // Getters
    currentArticles,
    publicationCategories,
    articleCounts,
    
    // Actions
    fetchUserData,
    fetchArticlesByAuthor,
    setCurrentPublication,
    fetchPublications: fetchUserData,
    fetchArticles,
    fetchAuthors,
    fetchCategories,
    createArticle,
    updateArticle,
    clearError,
    initializeStore
  }
})