<!--pages/editor/index.vue-->
<template>
  <div class="editor-dashboard">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading editor...</p>
      </div>
    </div>
    
    <div v-if="error" class="error-banner">
      <span class="error-message">{{ error }}</span>
      <button @click="clearError" class="close-error">×</button>
    </div>

    <PublicationList
      :publications="publications"
      :current-publication="currentPublication"
      :article-counts="articleCounts"
      @publication-selected="handlePublicationSelect"
    />
    
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div class="header-content">
          <h1>{{ currentPublication?.name || 'Select Publication' }}</h1>
          <p v-if="currentPublication" class="publication-description">
            {{ currentPublication.description }}
          </p>
        </div>
        <div v-if="currentPublication" class="header-actions">
          <div class="publication-stats">
            <span class="article-count">
              {{ currentArticles.length }} articles
            </span>
            <span class="category-count">
              {{ publicationCategories.length }} categories
            </span>
          </div>
          <button 
            @click="openEditor('create')"
            class="btn-primary"
          >
            + New Article
          </button>
        </div>
      </div>
      
      <ArticleTable
        v-if="currentPublication"
        :articles="currentArticles"
        :categories="publicationCategories"
        :total-articles="currentArticles.length"
        @edit-article="handleEditArticle"
        @view-article="handleViewArticle"
        @preview-article="handlePreviewArticle"
        @refresh="handleRefresh"
      />

      <div v-else class="welcome-state">
        <div class="welcome-content">
          <div class="welcome-icon">📝</div>
          <h2>Welcome to the Editor Dashboard</h2>
          <p>Select a publication from the sidebar to start managing articles.</p>
          <div class="welcome-features">
            <div class="feature">
              <span class="feature-icon">🚀</span>
              <span>Create and edit articles with rich text editor</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Manage multiple publications from one dashboard</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🖼️</span>
              <span>Add images, albums, and media to your content</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Editor Modal -->
      <ArticleEditor
        v-if="showEditor"
        :article="selectedArticle"
        :mode="editorMode"
        @save="handleSave"
        @save-draft="handleSaveDraft"
        @publish="handlePublish"
        @preview="handlePreview"
        @cancel="closeEditor"
      />
      
      <!-- Preview Pane -->
      <PreviewPane
        v-if="showPreview"
        :article="previewArticle"
        :publication="currentPublication"
        @close="closePreview"
      />

      <!-- Deleted Article Modal -->
      <div v-if="showDeletedModal" class="modal-overlay" @click.self="closeDeletedModal">
        <div class="modal">
          <div class="modal-header">
            <h3>Deleted Article</h3>
            <button @click="closeDeletedModal" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <p>This article has been deleted and is in read-only mode.</p>
            <div class="article-preview">
              <h4>{{ deletedArticle?.title }}</h4>
              <p class="article-meta">
                Deleted on {{ formatDate(deletedArticle?.updatedAt) }}
              </p>
              <div class="article-info">
                <span class="info-item">
                  <strong>Status:</strong> 
                  <span :class="`status-${deletedArticle?.status}`">
                    {{ deletedArticle?.status }}
                  </span>
                </span>
                <span class="info-item">
                  <strong>Category:</strong> 
                  {{ getCategoryName(deletedArticle?.category) }}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDeletedModal" class="btn-secondary">Close</button>
            <button @click="restoreArticle" class="btn-primary">Restore Article</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Import stores
import { useEditorStore } from '~/stores/editor'

// Import components
import ArticleEditor from '~/components/Main/ArticleEditor.vue'
import ArticleTable from '~/components/Main/ArticleTable.vue'
import PublicationList from '~/components/Main/PublicationList.vue'
import PreviewPane from '~/components/Main/PreviewPane.vue'

const editorStore = useEditorStore()

// State
const showEditor = ref(false)
const showPreview = ref(false)
const showDeletedModal = ref(false)
const selectedArticle = ref(null)
const deletedArticle = ref(null)
const editorMode = ref('create')
const previewArticle = ref(null)

// Store state
const { 
  publications, 
  currentPublication, 
  currentArticles, 
  publicationCategories,
  articleCounts,
  isLoading,
  error 
} = storeToRefs(editorStore)

// Methods
const handlePublicationSelect = async (publication) => {
  try {
    await editorStore.setCurrentPublication(publication)
  } catch (err) {
    console.error('Error selecting publication:', err)
  }
}

const openEditor = (mode, article = null) => {
  editorMode.value = mode
  selectedArticle.value = article
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  selectedArticle.value = null
  editorMode.value = 'create'
}

const handleEditArticle = (article) => {
  if (article.status === 'deleted') {
    showDeletedModal.value = true
    deletedArticle.value = article
  } else if (article.status === 'published') {
    // For published articles, we might want a different behavior
    // For now, open in edit mode but show a warning
    if (confirm('This article is already published. Do you want to edit it? Changes will go live immediately if the article is live.')) {
      openEditor('edit', article)
    }
  } else {
    openEditor('edit', article)
  }
}

const handleViewArticle = (article) => {
  if (article.status === 'published') {
    // Open preview for published articles
    handlePreviewArticle(article)
  } else if (article.status === 'deleted') {
    // Show restore modal for deleted articles
    showDeletedModal.value = true
    deletedArticle.value = article
  } else {
    // For drafts and other statuses, open in edit mode
    openEditor('edit', article)
  }
}

const handlePreviewArticle = (article) => {
  previewArticle.value = article
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewArticle.value = null
}

const closeDeletedModal = () => {
  showDeletedModal.value = false
  deletedArticle.value = null
}

const restoreArticle = async () => {
  if (!deletedArticle.value) return
  
  try {
    await editorStore.updateArticle(deletedArticle.value.id, { 
      status: 'draft',
      live: false 
    })
    closeDeletedModal()
  } catch (err) {
    console.error('Error restoring article:', err)
  }
}

const handleSave = async (articleData) => {
  try {
    if (editorMode.value === 'create') {
      await editorStore.createArticle({
        ...articleData,
        publicationId: currentPublication.value.id
      })
    } else {
      await editorStore.updateArticle(selectedArticle.value.id, articleData)
    }
    closeEditor()
  } catch (error) {
    console.error('Error saving article:', error)
  }
}

const handleSaveDraft = async (articleData) => {
  await handleSave({ ...articleData, status: 'draft' })
}

const handlePublish = async (articleData) => {
  await handleSave({ 
    ...articleData, 
    status: 'published',
    live: true,
    publishedAt: articleData.publishedAt || new Date().toISOString()
  })
}

const handlePreview = (articleData) => {
  previewArticle.value = {
    ...articleData,
    id: selectedArticle.value?.id || 'preview',
    publicationId: currentPublication.value.id
  }
  showPreview.value = true
  showEditor.value = false
}

const handleRefresh = async () => {
  if (currentPublication.value) {
    await editorStore.fetchArticles(currentPublication.value.id)
  }
}

const clearError = () => {
  editorStore.clearError()
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryName = (categoryId) => {
  const category = publicationCategories.value?.find(cat => cat.id === categoryId)
  return category?.name || 'Uncategorized'
}

// Lifecycle
onMounted(async () => {
  try {
    await editorStore.initializeStore()
  } catch (error) {
    console.error('Error initializing store:', error)
  }
})

// Watch for publication changes
watch(currentPublication, (newPublication) => {
  if (newPublication) {
    document.title = `${newPublication.name} - Editor Dashboard`
  } else {
    document.title = 'Editor Dashboard'
  }
})
</script>

<style scoped>
.editor-dashboard {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
  overflow-x: auto;
  background: #f8f9fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.875rem;
  font-weight: 700;
}

.publication-description {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
  max-width: 500px;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.publication-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.article-count,
.category-count {
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: #2563eb;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ef4444;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  flex: 1;
}

.close-error {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.close-error:hover {
  background: rgba(255, 255, 255, 0.1);
}

.welcome-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.welcome-content h2 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.welcome-content p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.feature-icon {
  font-size: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  border-radius: 0.375rem;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.article-preview {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.article-preview h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.article-meta {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.article-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  font-size: 0.875rem;
  color: #4b5563;
}

.status-deleted {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .header-actions {
    align-items: stretch;
    width: 100%;
  }
  
  .publication-stats {
    justify-content: space-between;
  }
}
</style>