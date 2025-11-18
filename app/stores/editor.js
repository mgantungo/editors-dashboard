import { defineStore } from 'pinia'

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

  // Enhanced dummy data
  const dummyPublications = [
    { id: 1, name: 'Bukedde', slug: 'bukedde', description: 'Luganda newspaper' },
    { id: 2, name: 'New Vision', slug: 'new-vision', description: 'National newspaper' },
    { id: 3, name: 'Bride & Groom', slug: 'bride-groom', description: 'Wedding magazine' },
    { id: 4, name: 'Harvest Money', slug: 'harvest-money', description: 'Agriculture magazine' }
  ]

  const dummyAuthors = [
    { id: 1, name: 'John Mugisha', slug: 'john-mugisha', bio: 'Senior news reporter' },
    { id: 2, name: 'Sarah Nakato', slug: 'sarah-nakato', bio: 'Feature writer' },
    { id: 3, name: 'David Omondi', slug: 'david-omondi', bio: 'Sports journalist' },
    { id: 4, name: 'Grace Nalwanga', slug: 'grace-nalwanga', bio: 'Entertainment editor' }
  ]

  const dummyCategories = [
    { id: 1, name: 'News', slug: 'news', publicationId: 1 },
    { id: 2, name: 'Sports', slug: 'sports', publicationId: 1 },
    { id: 3, name: 'Entertainment', slug: 'entertainment', publicationId: 1 },
    { id: 4, name: 'Politics', slug: 'politics', publicationId: 2 },
    { id: 5, name: 'Business', slug: 'business', publicationId: 2 },
    { id: 6, name: 'Wedding Tips', slug: 'wedding-tips', publicationId: 3 },
    { id: 7, name: 'Fashion', slug: 'fashion', publicationId: 3 },
    { id: 8, name: 'Farming', slug: 'farming', publicationId: 4 },
    { id: 9, name: 'Agribusiness', slug: 'agribusiness', publicationId: 4 }
  ]

  const dummyArticles = [
    {
      id: 1,
      title: 'Breaking: Major Development in National News',
      status: 'published',
      category: 1,
      authors: [1, 2],
      publishedAt: '2024-01-15T10:30:00Z',
      live: true,
      featured: true,
      breakingNews: true,
      breakingDuration: 120,
      premium: false,
      tags: ['breaking', 'national', 'news'],
      summary: '<p>This is a summary of the breaking news article.</p>',
      content: '<p>Full article content goes here with <strong>bold text</strong> and <em>italic text</em>.</p>',
      featuredImage: {
        url: '/images/news-1.jpg',
        alt: 'News image',
        caption: 'This is a featured image',
        credit: 'John Photographer'
      },
      album: [
        {
          id: 1,
          url: '/images/album-1.jpg',
          alt: 'Album image 1',
          caption: 'First album image',
          credit: 'Sarah Photographer',
          order: 0
        }
      ],
      secondaryCategory: null,
      publicationId: 1,
      createdAt: '2024-01-14T15:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Draft Article About Sports',
      status: 'draft',
      category: 2,
      authors: [3],
      publishedAt: null,
      live: false,
      featured: false,
      breakingNews: false,
      breakingDuration: null,
      premium: false,
      tags: ['sports', 'draft'],
      summary: '<p>This is a draft article summary.</p>',
      content: '<p>Draft content being worked on.</p>',
      featuredImage: null,
      album: [],
      secondaryCategory: null,
      publicationId: 1,
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z'
    },
    {
      id: 3,
      title: 'Deleted Article Example',
      status: 'deleted',
      category: 3,
      authors: [4],
      publishedAt: '2024-01-10T08:00:00Z',
      live: false,
      featured: false,
      breakingNews: false,
      breakingDuration: null,
      premium: false,
      tags: ['deleted'],
      summary: '<p>This article was deleted.</p>',
      content: '<p>Deleted content.</p>',
      featuredImage: null,
      album: [],
      secondaryCategory: null,
      publicationId: 1,
      createdAt: '2024-01-09T10:00:00Z',
      updatedAt: '2024-01-11T14:00:00Z'
    }
  ]

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

  const fetchPublications = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      publications.value = dummyPublications
      return publications.value
    } catch (err) {
      setError(err.message || 'Failed to fetch publications')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const setCurrentPublication = async (publication) => {
    currentPublication.value = publication
    await fetchArticles(publication.id)
    await fetchCategories(publication.id)
  }

  const fetchArticles = async (publicationId = null) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      if (publicationId) {
        articles.value = dummyArticles.filter(article => article.publicationId === publicationId)
      } else {
        articles.value = dummyArticles
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
      await new Promise(resolve => setTimeout(resolve, 300))
      authors.value = dummyAuthors
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
      await new Promise(resolve => setTimeout(resolve, 300))
      if (publicationId) {
        categories.value = dummyCategories.filter(cat => cat.publicationId === publicationId)
      } else {
        categories.value = dummyCategories
      }
      return categories.value
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
      const newArticle = {
        id: Date.now(),
        ...articleData,
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
      const index = articles.value.findIndex(article => article.id === parseInt(articleId))
      if (index === -1) throw new Error('Article not found')
      
      const updatedArticle = {
        ...articles.value[index],
        ...articleData,
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
    await fetchPublications()
    await fetchAuthors()
    await fetchCategories()
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
    setCurrentPublication,
    fetchPublications,
    fetchArticles,
    fetchAuthors,
    fetchCategories,
    createArticle,
    updateArticle,
    clearError,
    initializeStore
  }
})