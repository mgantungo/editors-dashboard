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

/*
  const transformApiArticle = (apiArticle) => {
  // Extract category ID
  const categoryId = apiArticle.category || null;
  
  // Extract publication ID from publication array
  const publicationId = apiArticle.publication?.[0]?.id || null;
  
  // Extract author IDs
  const authorIds = Array.isArray(apiArticle.authorIds) ? apiArticle.authorIds : [];
  
  // Determine status - use view_status from API, default to 'draft'
  const status = apiArticle.view_status || 'draft';
  
  // Determine live status - only true if both status is published AND live flag is true
  const live = (status === 'published' && apiArticle.live === true) ? true : false;
  
  return {
    // Core fields
    id: apiArticle.id,
    title: apiArticle.title,
    status: status,
    category: categoryId,
    authors: authorIds,
    publishedAt: apiArticle.wp_published_at || null,
    live: live,
    
    // Feature flags
    featured: apiArticle.featured || false,
    breakingNews: apiArticle.breakingNews || false,
    breakingDuration: apiArticle.breakingDuration || null,
    
    // Content fields
    premium: apiArticle.isPremium || false,
    tags: Array.isArray(apiArticle.tags) ? apiArticle.tags.map(t => t.name) : [],
    summary: apiArticle.excerpt || '',
    content: apiArticle.content || '',
    
    // Featured image
    featuredImage: apiArticle.featured_image || null,
    
    // Album
    album: Array.isArray(apiArticle.album) ? apiArticle.album : [],
    
    // Additional fields
    secondaryCategory: apiArticle.secondaryCategory || null,
    publicationId: publicationId,
    
    // Timestamps
    createdAt: apiArticle.createdAt,
    updatedAt: apiArticle.updatedAt,
    
    // Store original API data
    _raw: apiArticle,
    _authorsData: apiArticle.authors || []
  }
}
*/

const transformApiArticle = (apiArticle) => {
  console.log('🔄 Transforming API article:', apiArticle)
  
  // Extract category ID
  const categoryId = apiArticle.category || null;
  
  // Extract publication ID
  const publicationId = apiArticle.publicationId || null;
  
  // Extract author IDs
  const authorIds = Array.isArray(apiArticle.authorIds) ? apiArticle.authorIds : [];
  
  // Determine status
  const status = apiArticle.view_status || apiArticle.status || 'draft';
  
  // Determine live status
  const live = apiArticle.live || false;
  
  // Format featured image
  let featuredImage = null;
  if (apiArticle.featuredImage) {
    console.log('🖼️ Featured image from API:', apiArticle.featuredImage);
    featuredImage = apiArticle.featuredImage;
  } else if (apiArticle.featured_image) {
    // Handle different response formats
    const img = apiArticle.featured_image;
    console.log('🖼️ Featured_image from API:', img);
    featuredImage = {
      id: img.id,
      url: img.url,
      alt: img.alternativeText || '',
      caption: img.caption || '',
      name: img.name,
      mime: img.mime,
      size: img.size
    };
  } else {
    console.log('⚠️ No featured image found in API response');
  }
  
  const transformed = {
    // Core fields
    id: apiArticle.id,
    wp_id: apiArticle.wp_id,
    title: apiArticle.title,
    slug: apiArticle.slug,
    status: status,
    category: categoryId,
    authors: authorIds,
    publishedAt: apiArticle.publishedAt || apiArticle.wp_published_at || null,
    live: live,
    
    // Feature flags
    featured: apiArticle.featured || false,
    breakingNews: apiArticle.breakingNews || false,
    breakingDuration: apiArticle.breakingDuration || null,
    
    // Content fields
    premium: apiArticle.premium || apiArticle.isPremium || false,
    tags: Array.isArray(apiArticle.tags) ? apiArticle.tags : [],
    summary: apiArticle.summary || apiArticle.excerpt || '',
    content: apiArticle.content || '',
    
    // Featured image
    featuredImage: featuredImage,
    
    // Album
    album: Array.isArray(apiArticle.album) ? apiArticle.album : [],
    
    // Additional fields
    secondaryCategory: apiArticle.secondaryCategory || null,
    publicationId: publicationId,
    
    // Timestamps
    createdAt: apiArticle.createdAt,
    updatedAt: apiArticle.updatedAt,
    
    // SEO fields
    seo_title: apiArticle.seo_title,
    seo_description: apiArticle.seo_description,
    
    // Views counter
    views: apiArticle.views || 0,
    
    // Store original API data
    _raw: apiArticle,
    _authorsData: apiArticle.authors || []
  }
  
  console.log('✅ Transformed article:', transformed)
  return transformed
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
  */

const createArticle = async (articleData) => {
  try {
    setLoading(true)
    const authStore = useAuthStore()
    const baseUrl = getBaseUrl()
    
    console.log('🆕 Creating new article:', articleData.title)
    console.log('📊 Article data for API:', articleData)
    console.log('🖼️ Featured image data:', articleData.featuredImage)
    
    // Create FormData for file upload
    const formData = new FormData()
    
    // Prepare the data object
    const postData = {
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
      authors: articleData.authors?.map(a => {
        if (typeof a === 'object' && a.id) {
          return a.id;
        }
        return a;
      }) || [],
      category: articleData.category || null,
      secondaryCategory: articleData.secondaryCategory || null,
      tags: articleData.tags || [],
      
      // Publication
      publicationId: articleData.publicationId || currentPublication.value?.id,
    }
    
    console.log('📝 Post data:', postData)
    
    // Add JSON data as a single field (stringified)
    formData.append('data', JSON.stringify(postData))
    
    // Add featured image file if exists
    if (articleData.featuredImage?.file) {
      console.log('📤 Adding featured image file to upload:', articleData.featuredImage.file.name)
      formData.append('files.featuredImage', articleData.featuredImage.file)
      
      // Log what's in FormData
      console.log('📁 FormData has featured image:', articleData.featuredImage.file instanceof File)
    } else if (articleData.featuredImage?.id) {
      console.log('🆔 Using existing featured image ID:', articleData.featuredImage.id)
      // If it's already an ID from media library, include it in the data
      const dataStr = formData.get('data')
      const dataObj = JSON.parse(dataStr)
      dataObj.featuredImage = { id: articleData.featuredImage.id }
      formData.set('data', JSON.stringify(dataObj))
    }
    
    // Log FormData contents for debugging
    console.log('📋 FormData entries:')
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`)
      } else if (key === 'data') {
        console.log(`  ${key}:`, JSON.parse(value))
      } else {
        console.log(`  ${key}:`, value)
      }
    }
    
    console.log('📤 Sending to API via FormData')
    
    // Call the save API endpoint with FormData
    // IMPORTANT: Don't use $fetch for FormData with files - use fetch directly
    const response = await fetch(`${baseUrl}/api/posts/save`, {
      method: 'POST',
      body: formData,
      // IMPORTANT: Don't set Content-Type header - let browser set it with boundary
      headers: {
        'Accept': 'application/json',
      }
    })
    
    console.log('📡 Response status:', response.status)
    
    if (!response.ok) {
      let errorText = 'Unknown error'
      try {
        const errorData = await response.json()
        console.error('❌ API error response:', errorData)
        errorText = errorData.message || JSON.stringify(errorData)
      } catch (e) {
        errorText = await response.text()
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const responseData = await response.json()
    console.log('✅ Article created successfully:', responseData)
    
    // Transform the response to match our format
    const newArticle = transformApiArticle(responseData)
    
    // Add to local articles array
    articles.value.unshift(newArticle)
    
    // Update authors if needed
    if (responseData.authors && responseData.authors.length > 0) {
      responseData.authors.forEach(author => {
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
    
    // Refresh articles list to ensure ArticleTable updates
    await fetchArticles()
    
    return newArticle
    
  } catch (err) {
    console.error('❌ Error creating article:', err)
    console.error('❌ Error details:', err.message)
    console.error('❌ Error stack:', err.stack)
    setError(err.message || 'Failed to create article')
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
*/

const updateArticle = async (articleId, articleData) => {
  try {
    setLoading(true)
    const authStore = useAuthStore()
    const baseUrl = getBaseUrl()
    
    console.log('🔄 Updating article:', articleId)
    console.log('📊 Update data:', articleData)
    
    // Create FormData
    const formData = new FormData()
    
    // Add JSON data with ID
    formData.append('data', JSON.stringify({
      id: articleId,
      title: articleData.title,
      content: articleData.content,
      summary: articleData.summary || '',
      status: articleData.status || 'draft',
      publishedAt: articleData.publishedAt || null,
      live: articleData.live || false,
      featured: articleData.featured || false,
      breakingNews: articleData.breakingNews || false,
      breakingDuration: articleData.breakingDuration || null,
      premium: articleData.premium || false,
      authors: articleData.authors?.map(a => typeof a === 'object' ? a.id : a) || [],
      category: articleData.category || null,
      secondaryCategory: articleData.secondaryCategory || null,
      tags: articleData.tags || [],
      publicationId: articleData.publicationId || currentPublication.value?.id,
    }))
    
    // Add featured image file if exists
    if (articleData.featuredImage?.file) {
      console.log('📤 Adding featured image file to upload')
      formData.append('files.featuredImage', articleData.featuredImage.file)
    } else if (articleData.featuredImage?.id) {
      const jsonData = JSON.parse(formData.get('data'))
      jsonData.featuredImage = { id: articleData.featuredImage.id }
      formData.set('data', JSON.stringify(jsonData))
    }
    
    // Add album files if they exist
    if (articleData.album && articleData.album.length > 0) {
      console.log('📸 Adding album images:', articleData.album.length)
      articleData.album.forEach((image, index) => {
        if (image.file) {
          formData.append('files.album', image.file)
        }
      })
    }
    
    console.log('📤 Sending update to API')
    
    const response = await $fetch(`${baseUrl}/api/posts/save`, {
      method: 'POST',
      body: formData,
    })
    
    console.log('✅ Article updated successfully:', response)
    
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
    
    // FIX: Refresh articles list
    await fetchArticles()
    
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