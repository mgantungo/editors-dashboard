<!--components/Main/ArticleTable.vue-->
<template>
  <div class="article-table bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    <!-- Table Header -->
    <div class="px-6 py-4 border-b border-gray-100 bg-white">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Articles ({{ totalArticles }})</h3>
          <div class="flex flex-wrap gap-3">
            <!-- Status Filter -->
            <select v-model="statusFilter" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
              <!-- No "deleted" option since deleted articles are filtered out -->
            </select>
            
            <!-- Category Filter -->
            <select v-model="categoryFilter" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            
            <!-- Search -->
            <div class="relative flex-1 min-w-[200px]">
              <input
                v-model="searchQuery"
                placeholder="Search articles..."
                class="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            @click="handleRefresh" 
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
          <button 
            @click="exportCSV" 
            :disabled="filteredArticles.length === 0"
            class="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="w-12 px-4 py-3">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authors</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live</th>
            <th class="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <ArticleRow
            v-for="article in paginatedArticles"
            :key="article.id"
            :article="article"
            :selected="selectedArticles.includes(article.id)"
            :categories="categories"
            @select="toggleSelectArticle"
            @edit="$emit('edit-article', article)"
            @view="$emit('view-article', article)"
            @preview="$emit('preview-article', article)"
          />
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredArticles.length === 0" class="text-center py-12 px-6">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p class="text-gray-900 font-medium mb-1">No articles found</p>
        <p v-if="searchQuery || statusFilter || categoryFilter" class="text-gray-500 text-sm">
          Try adjusting your search or filters
        </p>
        <p v-else class="text-gray-500 text-sm">
          Get started by creating your first article
        </p>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedArticles.length > 0" class="bg-blue-50 border-t border-blue-200 px-6 py-3">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="text-sm font-medium text-blue-800">
          {{ selectedArticles.length }} article(s) selected
        </div>
        <div class="flex items-center gap-2">
          <select v-model="bulkAction" class="text-sm border border-blue-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="">Bulk Actions</option>
            <option value="publish">Publish</option>
            <option value="draft">Move to Draft</option>
            <option value="delete">Delete</option>
            <option value="live">Make Live</option>
            <option value="unlive">Make Unlive</option>
          </select>
          <button 
            @click="applyBulkAction" 
            class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!bulkAction"
          >
            Apply
          </button>
          <button 
            @click="clearSelection" 
            class="text-sm bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredArticles.length > 0" class="bg-white border-t border-gray-200 px-6 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ startIndex + 1 }}</span> to <span class="font-medium">{{ endIndex }}</span> of <span class="font-medium">{{ filteredArticles.length }}</span> articles
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Page Size -->
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-700">Show:</span>
            <select v-model="pageSize" class="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center gap-1">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="flex items-center gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'min-w-[2rem] px-2 py-1 text-sm rounded-lg transition-colors',
                  page === '...' ? 'text-gray-500 cursor-default' : 
                  currentPage === page ? 
                    'bg-blue-600 text-white' : 
                    'text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ArticleRow from './ArticleRow.vue';

// Import store
const editorStore = useEditorStore()
const { authors } = storeToRefs(editorStore)

const props = defineProps({
  articles: Array,
  categories: Array,
  totalArticles: Number
})

const emit = defineEmits(['edit-article', 'view-article', 'preview-article', 'refresh'])

// Filtering and search
const statusFilter = ref('')
const categoryFilter = ref('')
const searchQuery = ref('')

// Selection
const selectedArticles = ref([])

// Pagination
const currentPage = ref(1)
const pageSize = ref(25)

// Bulk actions
const bulkAction = ref('')

// Computed properties - No need to filter deleted articles here since store handles it
const filteredArticles = computed(() => {
  let filtered = props.articles || []

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(article => article.status === statusFilter.value)
  }

  // Category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(article => article.category === categoryFilter.value)
  }

  // Search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(article => 
      article.title.toLowerCase().includes(query) ||
      (article.summary && article.summary.toLowerCase().includes(query))
    )
  }

  return filtered
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredArticles.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredArticles.value.length / pageSize.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const endIndex = computed(() => {
  const end = startIndex.value + pageSize.value
  return Math.min(end, filteredArticles.value.length)
})

const allSelected = computed(() => {
  return selectedArticles.value.length > 0 && 
         selectedArticles.value.length === paginatedArticles.value.length
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const showEllipsis = computed(() => {
  return totalPages.value > 7
})

// Methods (keep all your existing methods exactly as they are)
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedArticles.value = []
  } else {
    selectedArticles.value = paginatedArticles.value.map(article => article.id)
  }
}

const toggleSelectArticle = (articleId) => {
  const index = selectedArticles.value.indexOf(articleId)
  if (index > -1) {
    selectedArticles.value.splice(index, 1)
  } else {
    selectedArticles.value.push(articleId)
  }
}

const clearSelection = () => {
  selectedArticles.value = []
}

const applyBulkAction = async () => {
  if (!bulkAction.value || selectedArticles.value.length === 0) return

  try {
    // In real app, call API for bulk actions
    console.log(`Applying bulk action: ${bulkAction.value} to`, selectedArticles.value)
    
    // Reset after action
    bulkAction.value = ''
    selectedArticles.value = []
    
    // Refresh data
    emit('refresh')
  } catch (error) {
    console.error('Error applying bulk action:', error)
  }
}

const exportCSV = () => {
  // Simple CSV export implementation
  const headers = ['Title', 'Status', 'Category', 'Authors', 'Published At', 'Live']
  const csvData = filteredArticles.value.map(article => [
    article.title,
    article.status,
    getCategoryName(article.category),
    getAuthorNames(article.authors),
    article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '',
    article.live ? 'Yes' : 'No'
  ])

  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `articles-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const handleRefresh = () => {
  emit('refresh')
}

const getCategoryName = (categoryId) => {
  const category = props.categories?.find(cat => cat.id === categoryId)
  return category?.name || 'Uncategorized'
}

const getAuthorNames = (authorIds) => {
  if (!authorIds || !authors.value) return 'No authors'
  const authorNames = authorIds.map(id => {
    const author = authors.value.find(a => a.id === id)
    return author?.name || 'Unknown'
  })
  return authorNames.join(', ')
}

// Pagination methods
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  if (page !== '...') {
    currentPage.value = page
  }
}

// Reset pagination when filters change
watch([statusFilter, categoryFilter, searchQuery], () => {
  currentPage.value = 1
})

// Reset pagination when page size changes
watch(pageSize, () => {
  currentPage.value = 1
})
</script>