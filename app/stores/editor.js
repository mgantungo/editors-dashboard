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

  // Transform API article to match component expectations
  const transformApiArticle = (apiArticle) => {
    // Extract category ID (already a number in API response)
    const categoryId = apiArticle.category || null
    
    // Extract publication ID (already a number in API response)
    const publicationId = apiArticle.publicationId || null
    
    // Extract author IDs from the authorIds array
    const authorIds = Array.isArray(apiArticle.authorIds) ? apiArticle.authorIds : []
    
    // Determine status
    const status = apiArticle.status || (apiArticle.publishedAt ? 'published' : 'draft')
    
    return {
      // Core fields
      id: apiArticle.id,
      title: apiArticle.title,
      status: status,
      category: categoryId,
      authors: authorIds, // Array of author IDs for ArticleRow lookup
      publishedAt: apiArticle.publishedAt || null,
      live: apiArticle.live !== undefined ? apiArticle.live : !!apiArticle.publishedAt,
      
      // Feature flags
      featured: apiArticle.featured || false,
      breakingNews: apiArticle.breakingNews || false,
      breakingDuration: apiArticle.breakingDuration || null,
      
      // Content fields
      premium: apiArticle.premium || false,
      tags: Array.isArray(apiArticle.tags) ? apiArticle.tags : [],
      summary: apiArticle.summary || '',
      content: apiArticle.content || '',
      
      // Featured image
      featuredImage: apiArticle.featuredImage || null,
      
      // Album
      album: Array.isArray(apiArticle.album) ? apiArticle.album : [],
      
      // Additional fields
      secondaryCategory: apiArticle.secondaryCategory || null,
      publicationId: publicationId,
      
      // Timestamps
      createdAt: apiArticle.createdAt,
      updatedAt: apiArticle.updatedAt,
      
      // Store original API data for reference
      _raw: apiArticle,
      // Store full author objects for reference
      _authorsData: apiArticle.authors || []
    }
  }

  // Extract and transform authors from articles
  const extractAuthorsFromArticles = (articlesArray) => {
    const authorMap = new Map()
    
    articlesArray.forEach(article => {
      // The API returns full author objects in the authors array
      if (article._authorsData && Array.isArray(article._authorsData)) {
        article._authorsData.forEach(author => {
          if (!authorMap.has(author.id)) {
            authorMap.set(author.id, {
              id: author.id,
              name: author.displayName || `${author.firstName} ${author.lastName}`.trim() || author.username,
              username: author.username,
              displayName: author.displayName,
              firstName: author.firstName,
              lastName: author.lastName,
              email: author.email,
              wpId: author.wpId
            })
          }
        })
      }
    })
    
    return Array.from(authorMap.values())
  }

  // Extract publications from user data
  const extractPublicationsFromUserData = (publicationsData) => {
    if (!Array.isArray(publicationsData)) return []
    
    return publicationsData.map(pub => ({
      id: pub.id,
      name: pub.name,
      slug: pub.slug,
      description: pub.description || ''
    }))
  }

  // Extract categories from publications
  const extractCategoriesFromPublications = (publicationsData) => {
    if (!Array.isArray(publicationsData)) return []
    
    const allCategories = []
    publicationsData.forEach(pub => {
      if (pub.categories && pub.categories.length > 0) {
        pub.categories.forEach(cat => {
          allCategories.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            publicationId: pub.id
          })
        })
      }
    })
    
    return allCategories
  }

  // Getters
  const currentArticles = computed(() => {
    if (!currentPublication.value) return articles.value
    return articles.value.filter(article => article.publicationId === currentPublication.value.id)
  })

  const publicationCategories = computed(() => {
    if (!currentPublication.value) return categories.value
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
      
      console.log('📡 Fetching user data for:', username)
      
      const response = await $fetch(`${baseUrl}/api/publications/author/${username}/call`)
      
      console.log('✅ User data response:', response)

      // Transform the API response
      if (response.publications) {
        publications.value = extractPublicationsFromUserData(response.publications)
        categories.value = extractCategoriesFromPublications(response.publications)
      }

      console.log('✅ Loaded publications:', publications.value.length)
      console.log('✅ Loaded categories:', categories.value.length)

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

      console.log('📡 Fetching articles for:', username, 'from', startDate, 'to', endDate)
      
      // Call the API endpoint
      const response = await $fetch(`${baseUrl}/api/posts/author/${username}/${startDate}/${endDate}`)
      
      console.log('✅ Articles API raw response:', response)

      // Handle different response structures
      let rawArticles = []
      
      if (Array.isArray(response)) {
        rawArticles = response
      } else if (response && typeof response === 'object' && response.articles) {
        rawArticles = response.articles
      } else if (response && response.data) {
        rawArticles = response.data.articles || response.data || []
      } else {
        console.warn('⚠️ Unexpected API response format:', response)
        rawArticles = []
      }
      
      console.log(`📊 Found ${rawArticles.length} raw articles from API`)
      
      // Log the first article to see its structure
      if (rawArticles.length > 0) {
        console.log('📋 First raw article structure:', rawArticles[0])
        console.log('📋 Authors in first article:', rawArticles[0].authors)
        console.log('📋 AuthorIds in first article:', rawArticles[0].authorIds)
      }
      
      // Transform articles to match component expectations
      articles.value = rawArticles.map(transformApiArticle)
      
      // Extract authors from all articles
      authors.value = extractAuthorsFromArticles(articles.value)
      
      console.log(`✅ Transformed ${articles.value.length} articles`)
      console.log(`✅ Extracted ${authors.value.length} unique authors`)
      console.log(`✅ Total categories: ${categories.value.length}`)
      
      if (articles.value.length > 0) {
        console.log('🔍 Sample transformed article:', {
          id: articles.value[0].id,
          title: articles.value[0].title,
          status: articles.value[0].status,
          category: articles.value[0].category,
          authors: articles.value[0].authors,
          publicationId: articles.value[0].publicationId,
          publishedAt: articles.value[0].publishedAt,
          live: articles.value[0].live
        })
      }
      
      if (authors.value.length > 0) {
        console.log('👤 Sample author:', authors.value[0])
      }

      return articles.value

    } catch (err) {
      console.error('❌ Error fetching articles:', err)
      setError(err.data?.message || err.message || 'Failed to fetch articles')
      return []
    } finally {
      setLoading(false)
    }
  }

  const setCurrentPublication = (publication) => {
    console.log(`📌 Setting current publication to:`, publication.name)
    currentPublication.value = publication
  }

  const fetchPublications = async () => {
    try {
      setLoading(true)
      await fetchUserData()
      return publications.value
    } catch (err) {
      setError(err.message || 'Failed to fetch publications')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async (publicationId = null) => {
    try {
      setLoading(true)
      const authStore = useAuthStore()
      
      if (!authStore.user) {
        throw new Error('No user logged in')
      }

      const username = authStore.user.username || authStore.user.name
      
      console.log(`📡 Fetching articles for user: ${username}`)
      await fetchArticlesByAuthor(username)
      
      return articles.value

    } catch (err) {
      console.error('❌ Error in fetchArticles:', err)
      setError(err.message || 'Failed to fetch articles')
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      // Authors are already extracted from articles
      console.log(`✅ Authors already loaded: ${authors.value.length}`)
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
      // Categories are already loaded
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

  // Create article
  /*
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
        updatedAt: new Date().toISOString(),
        status: articleData.status || 'draft',
        live: articleData.live || false,
        authors: articleData.authors || [authStore.user?.id || 1],
        publicationId: articleData.publicationId || currentPublication.value?.id,
        // Add full author data
        _authorsData: [{
          id: authStore.user?.id || 1,
          username: authStore.user?.username || 'user',
          displayName: authStore.user?.name || 'Current User',
          firstName: authStore.user?.name?.split(' ')[0] || 'Current',
          lastName: authStore.user?.name?.split(' ')[1] || 'User',
          email: authStore.user?.email || ''
        }]
      }
      articles.value.push(newArticle)
      
      // Update authors list if new author
      const newAuthor = {
        id: authStore.user?.id || 1,
        name: authStore.user?.name || 'Current User',
        username: authStore.user?.username || 'user',
        displayName: authStore.user?.name || 'Current User',
        email: authStore.user?.email || ''
      }
      if (!authors.value.some(a => a.id === newAuthor.id)) {
        authors.value.push(newAuthor)
      }
      
      return newArticle
    } catch (err) {
      setError(err.message || 'Failed to create article')
      throw err
    } finally {
      setLoading(false)
    }
  }
  */

const createArticle = async (articleData) => {
    try {
      setLoading(true)
      const authStore = useAuthStore()
      const baseUrl = getBaseUrl()
      
      console.log('🆕 Creating new article:', articleData.title)
      console.log('📊 Article data:', articleData)
      
      // Prepare the data to send to API
      const apiData = {
        // Basic fields
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary || '',
        
        // Status and publishing
        status: articleData.status || 'draft',
        publishedAt: articleData.publishedAt || null,
        live: articleData.live || false,
        
        // Feature flags
        featured: articleData.featured || false,
        breakingNews: articleData.breakingNews || false,
        breakingDuration: articleData.breakingDuration || null,
        premium: articleData.premium || false,
        
        // Relations
        authors: articleData.authors || [authStore.user?.id || 1],
        category: articleData.category || null,
        secondaryCategory: articleData.secondaryCategory || null,
        tags: articleData.tags || [],
        
        // Media
        featuredImage: articleData.featuredImage || null,
        album: articleData.album || [],
        
        // Publication
        publicationId: articleData.publicationId || currentPublication.value?.id,
        
        // User tracking
        createdBy: authStore.user?.id,
        createdByName: authStore.user?.name,
        updatedBy: authStore.user?.id,
        updatedByName: authStore.user?.name
      }
      
      console.log('📤 Sending to API:', apiData)
      
      // Call the save API endpoint
      const response = await $fetch(`${baseUrl}/api/posts/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: apiData
      })
      
      console.log('✅ Article created successfully:', response)
      
      // Transform the response to match our format
      const newArticle = transformApiArticle(response)
      
      // Add to local articles array
      articles.value.unshift(newArticle)
      
      // Update authors if needed
      if (response.authors && response.authors.length > 0) {
        response.authors.forEach(author => {
          if (!authors.value.some(a => a.id === author.id)) {
            authors.value.push({
              id: author.id,
              name: author.displayName || author.username,
              username: author.username,
              displayName: author.displayName,
              firstName: author.firstName,
              lastName: author.lastName,
              email: author.email
            })
          }
        })
      }
      
      console.log('📝 Article added to local store')
      
      return newArticle
      
    } catch (err) {
      console.error('❌ Error creating article:', err)
      setError(err.data?.message || err.message || 'Failed to create article')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update article
  /*
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

  */

const updateArticle = async (articleId, articleData) => {
  try {
    setLoading(true)
    const authStore = useAuthStore()
    const baseUrl = getBaseUrl()
    
    console.log('🔄 Updating article:', articleId)
    console.log('📊 Update data:', articleData)
    
    // Prepare the data to send to API
    const apiData = {
      // Include the ID for update
      id: articleId,
      
      // Basic fields
      title: articleData.title,
      content: articleData.content,
      summary: articleData.summary || '',
      
      // Status and publishing
      status: articleData.status || 'draft',
      publishedAt: articleData.publishedAt || null,
      live: articleData.live || false,
      
      // Feature flags
      featured: articleData.featured || false,
      breakingNews: articleData.breakingNews || false,
      breakingDuration: articleData.breakingDuration || null,
      premium: articleData.premium || false,
      
      // Relations
      authors: articleData.authors || [],
      category: articleData.category || null,
      secondaryCategory: articleData.secondaryCategory || null,
      tags: articleData.tags || [],
      
      // Media
      featuredImage: articleData.featuredImage || null,
      album: articleData.album || [],
      
      // Publication
      publicationId: articleData.publicationId || currentPublication.value?.id,
      
      // User tracking
      updatedBy: authStore.user?.id,
      updatedByName: authStore.user?.name
    }
    
    console.log('📤 Sending update to API:', apiData)
    
    // Call the save API endpoint (it handles both create and update)
    const response = await $fetch(`${baseUrl}/api/posts/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: apiData
    })
    
    console.log('✅ Article updated successfully:', response)
    
    // Transform the response
    const updatedArticle = transformApiArticle(response)
    
    // Update in local articles array
    const index = articles.value.findIndex(article => article.id === parseInt(articleId))
    if (index !== -1) {
      articles.value[index] = updatedArticle
      console.log('📝 Article updated in local store')
    } else {
      console.warn('⚠️ Article not found in local store, adding it')
      articles.value.unshift(updatedArticle)
    }
    
    // Update authors if needed
    if (response.authors && response.authors.length > 0) {
      response.authors.forEach(author => {
        if (!authors.value.some(a => a.id === author.id)) {
          authors.value.push({
            id: author.id,
            name: author.displayName || author.username,
            username: author.username,
            displayName: author.displayName,
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email
          })
        }
      })
    }
    
    return updatedArticle
    
  } catch (err) {
    console.error('❌ Error updating article:', err)
    setError(err.data?.message || err.message || 'Failed to update article')
    throw err
  } finally {
    setLoading(false)
  }
}



  const clearError = () => {
    error.value = null
  }

  const initializeStore = async () => {
    try {
      console.log('🚀 Initializing editor store...')
      
      // First, fetch user data (publications and categories)
      await fetchUserData()
      console.log(`✅ Fetched ${publications.value.length} publications from API`)
      
      // Then fetch articles (this also extracts authors)
      await fetchArticles()
      console.log(`✅ Fetched ${articles.value.length} articles`)
      
      // Fetch authors (already done in fetchArticles)
      await fetchAuthors()
      console.log(`✅ Loaded ${authors.value.length} authors`)
      
      // Set default publication if none is set
      if (publications.value.length > 0 && !currentPublication.value) {
        currentPublication.value = publications.value[0]
        console.log(`📌 Set default publication: ${currentPublication.value.name}`)
      }
      
      console.log('🎉 Store initialization complete!')
      console.log('📊 Final store state:')
      console.log('- Publications:', publications.value)
      console.log('- Current publication:', currentPublication.value)
      console.log('- Articles count:', articles.value.length)
      if (articles.value.length > 0) {
        console.log('- Sample article:', {
          id: articles.value[0].id,
          title: articles.value[0].title,
          status: articles.value[0].status,
          category: articles.value[0].category,
          authors: articles.value[0].authors,
          publicationId: articles.value[0].publicationId,
          live: articles.value[0].live
        })
      }
      console.log('- Authors count:', authors.value.length)
      if (authors.value.length > 0) {
        console.log('- Sample author:', authors.value[0])
      }
      console.log('- Categories count:', categories.value.length)
      
    } catch (error) {
      console.error('❌ Error initializing store:', error)
      setError('Failed to initialize editor. Please refresh the page.')
    }
  }

  // Debug function
  const debugStore = () => {
    console.log('🔍 STORE DEBUG:')
    console.log('Publications:', publications.value)
    console.log('Current Publication:', currentPublication.value)
    console.log('Articles count:', articles.value.length)
    console.log('Articles:', articles.value)
    console.log('Authors count:', authors.value.length)
    console.log('Authors:', authors.value)
    console.log('Categories count:', categories.value.length)
    console.log('Categories:', categories.value)
    console.log('Is loading:', isLoading.value)
    console.log('Error:', error.value)
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
    fetchPublications,
    fetchArticles,
    fetchAuthors,
    fetchCategories,
    createArticle,
    updateArticle,
    clearError,
    initializeStore,
    debugStore
  }
})