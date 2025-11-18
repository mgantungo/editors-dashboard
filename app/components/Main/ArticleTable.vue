<!--components/Main/ArticleTable.vue-->
<template>
  <div class="article-table">
    <div class="table-header">
      <div class="header-left">
        <h3>Articles ({{ totalArticles }})</h3>
        <div class="table-filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
            <option value="deleted">Deleted</option>
          </select>
          
          <select v-model="categoryFilter" class="filter-select">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          
          <input
            v-model="searchQuery"
            placeholder="Search articles..."
            class="search-input"
          />
        </div>
      </div>
      
      <div class="header-actions">
        <button @click="handleRefresh" class="btn-refresh" title="Refresh">
          ↻
        </button>
        <button @click="exportCSV" class="btn-secondary" :disabled="filteredArticles.length === 0">
          Export CSV
        </button>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="header-checkbox"
              />
            </th>
            <th>Title</th>
            <th>Status</th>
            <th>Category</th>
            <th>Authors</th>
            <th>Published At</th>
            <th>Live</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
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

      <div v-if="filteredArticles.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No articles found</p>
        <p v-if="searchQuery || statusFilter || categoryFilter" class="empty-hint">
          Try adjusting your filters
        </p>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedArticles.length > 0" class="bulk-actions">
      <div class="bulk-info">
        {{ selectedArticles.length }} article(s) selected
      </div>
      <div class="bulk-controls">
        <select v-model="bulkAction" class="bulk-select">
          <option value="">Bulk Actions</option>
          <option value="publish">Publish</option>
          <option value="draft">Move to Draft</option>
          <option value="delete">Delete</option>
          <option value="live">Make Live</option>
          <option value="unlive">Make Unlive</option>
        </select>
        <button 
          @click="applyBulkAction" 
          class="btn-primary"
          :disabled="!bulkAction"
        >
          Apply
        </button>
        <button @click="clearSelection" class="btn-secondary">
          Clear
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredArticles.length > 0" class="pagination">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredArticles.length }} articles
      </div>
      <div class="pagination-controls">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          Previous
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: currentPage === page }]"
          >
            {{ page }}
          </button>
          <span v-if="showEllipsis" class="page-ellipsis">...</span>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
      
      <div class="page-size">
        <label>Show:</label>
        <select v-model="pageSize" class="size-select">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
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

// Computed properties
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

// Methods
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

<style scoped>
.article-table {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.header-left h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.table-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select,
.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 150px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.btn-refresh {
  background: none;
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1.125rem;
}

.btn-refresh:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-checkbox {
  cursor: pointer;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-hint {
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #eff6ff;
  border-top: 1px solid #dbeafe;
}

.bulk-info {
  font-weight: 500;
  color: #1e40af;
}

.bulk-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.bulk-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 150px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  background: white;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-btn {
  background: white;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  min-width: 2.5rem;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-btn:hover:not(.active) {
  background: #f3f4f6;
}

.page-ellipsis {
  padding: 0.5rem;
  color: #6b7280;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size label {
  font-size: 0.875rem;
  color: #6b7280;
}

.size-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
  }
  
  .header-actions {
    align-self: flex-end;
  }
  
  .table-filters {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}
</style>