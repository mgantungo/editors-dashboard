<!--components/Main/Dashboard.vue-->
<template>
  <div class="editor-dashboard">
    <!-- Authentication States -->
    <Login2FA v-if="!authStore.isAuthenticated && !authStore.isLocked" />
    <SessionLock v-else-if="authStore.isLocked" />
    
    <!-- Main Dashboard (only show when authenticated and not locked) -->
    <div v-else class="dashboard-content">
      <!-- Update activity on user interaction -->
      <div @mousemove="authStore.updateActivity" @keydown="authStore.updateActivity" class="dashboard-wrapper">
        <!-- User Header -->
        <div class="user-header">
          <div class="user-info">
            <div class="user-avatar">{{ authStore.userInitials }}</div>
            <div class="user-details">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <span class="user-email">{{ authStore.user?.email }}</span>
            </div>
          </div>
            <button @click="handleLogout" class="logout-btn" :disabled="isLoggingOut">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </button>
        </div>

        <div class="dashboard-layout">
          <PublicationList
            :publications="publications"
            :current-publication="currentPublication"
            :article-counts="articleCounts"
            @publication-selected="handlePublicationSelect"
          />
          
          <main class="dashboard-main">
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

            <div class="dashboard-header">
              <div class="header-content">
                <h1>{{ currentPublication?.name || 'Select Publication' }}</h1>
                <p v-if="currentPublication" class="publication-description">
                  {{ currentPublication.description }}
                </p>
                <div v-if="currentPublication" class="publication-access">
                  <span class="access-badge Full">
                    Full Access
                  </span>
                </div>
              </div>
              <div v-if="currentPublication" class="header-actions">
                <div class="publication-stats">
                  <span class="article-count">
                    {{ currentArticles.length }} articles
                  </span>
                  <span class="category-count">
                    {{ publicationCategories.length }} categories
                  </span>
                  <span class="user-role">
                    {{ authStore.user?.role }}
                  </span>
                </div>
                <button 
                  @click="openEditor('create')"
                  class="btn-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  New Article
                </button>
              </div>
            </div>
            
            <ArticleTable
              v-if="currentPublication"
              :articles="currentArticles"
              :categories="publicationCategories"
              :total-articles="currentArticles.length"
              :user="authStore.user"
              @edit-article="handleEditArticle"
              @view-article="handleViewArticle"
              @preview-article="handlePreviewArticle"
              @refresh="handleRefresh"
            />

            <div v-else class="welcome-state">
              <div class="welcome-content">
                <div class="welcome-icon">📰</div>
                <h2>Welcome to New Vision Editor, {{ authStore.user?.name }}!</h2>
                <p>Select a publication from the sidebar to start managing articles.</p>
                <div class="user-permissions">
                  <h4>Your Access Level</h4>
                  <div class="permissions-list">
                    <div class="permission-item">
                      <span class="permission-icon">👤</span>
                      <span class="permission-text">
                        <strong>Role:</strong> {{ authStore.user?.role }}
                      </span>
                    </div>
                    <div class="permission-item">
                      <span class="permission-icon">📊</span>
                      <span class="permission-text">
                        <strong>Publications:</strong> {{ publications.length }} available
                      </span>
                    </div>
                    <div class="permission-item">
                      <span class="permission-icon">⏰</span>
                      <span class="permission-text">
                        <strong>Session:</strong> Auto-locks after 5 minutes of inactivity
                      </span>
                    </div>
                    <div class="permission-item">
                      <span class="permission-icon">🔐</span>
                      <span class="permission-text">
                        <strong>Security:</strong> Two-factor authentication enabled
                      </span>
                    </div>
                  </div>
                </div>
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
                  <div class="feature">
                    <span class="feature-icon">🔒</span>
                    <span>Secure access with two-factor authentication</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Editor Modal -->
            <ArticleEditor
              v-if="showEditor"
              :article="selectedArticle"
              :mode="editorMode"
              :user="authStore.user"
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
                      <span class="info-item">
                        <strong>Last Edited By:</strong> 
                        {{ deletedArticle?.updatedByName || 'Unknown' }}
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
      </div>
    </div>

  </div>
</template>

<script setup>
// Import stores
import { useEditorStore } from '~/stores/editor'
import { useAuthStore } from '~/stores/auth'
import { useAuth2FAStore } from '~/stores/auth2fa'

// Import components
import ArticleEditor from '~/components/Main/ArticleEditor.vue'
import ArticleTable from '~/components/Main/ArticleTable.vue'
import PublicationList from '~/components/Main/PublicationList.vue'
import PreviewPane from '~/components/Main/PreviewPane.vue'
import Login2FA from '~/components/Auth/Login2FA.vue'
import SessionLock from '~/components/Auth/SessionLock.vue'

const editorStore = useEditorStore()
const authStore = useAuthStore()
const auth2FAStore = useAuth2FAStore()

// State
const showEditor = ref(false)
const showPreview = ref(false)
const showDeletedModal = ref(false)
const selectedArticle = ref(null)
const deletedArticle = ref(null)
const editorMode = ref('create')
const previewArticle = ref(null);


// Store state
const { 
  publications, 
  currentPublication, 
  currentArticles, 
  publicationCategories,
  articleCounts,
  isLoading,
  error 
} = storeToRefs(editorStore);

const isLoggingOut = ref(false)

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
      live: false,
      updatedBy: authStore.user?.id,
      updatedByName: authStore.user?.name
    })
    closeDeletedModal()
  } catch (err) {
    console.error('Error restoring article:', err)
  }
}

const handleSave = async (articleData) => {
  try {
    const userData = {
      createdBy: authStore.user?.id,
      createdByName: authStore.user?.name,
      updatedBy: authStore.user?.id,
      updatedByName: authStore.user?.name
    }

    if (editorMode.value === 'create') {
      await editorStore.createArticle({
        ...articleData,
        ...userData,
        publicationId: currentPublication.value.id
      })
    } else {
      await editorStore.updateArticle(selectedArticle.value.id, {
        ...articleData,
        updatedBy: authStore.user?.id,
        updatedByName: authStore.user?.name
      })
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
    publicationId: currentPublication.value.id,
    createdByName: authStore.user?.name
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


const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  try {
    // Reset both auth stores
    authStore.logout()
    auth2FAStore.resetFlow()
    
    // Force reload to reset all states
    window.location.reload()
  } catch (error) {
    console.error('Logout error:', error)
    window.location.reload()
  } finally {
    isLoggingOut.value = false
  }
} 

// Lifecycle
onMounted(async () => {
  try {
    // Initialize auth
    authStore.initializeAuth()
    
    // Start inactivity checker
    setInterval(() => {
      authStore.checkInactivity()
    }, 60000) // Check every minute

    // Initialize editor store if authenticated
    if (authStore.isAuthenticated) {
      await editorStore.initializeStore()
    }
  } catch (error) {
    console.error('Error initializing store:', error)
  }
})

// Watch for authentication changes
watch(() => authStore.isAuthenticated, (authenticated) => {
  if (authenticated) {
    editorStore.initializeStore()
  } else {
    // Reset editor store when logging out
    currentPublication.value = null
  }
})

// Watch for publication changes
watch(currentPublication, (newPublication) => {
  if (newPublication) {
    document.title = `${newPublication.name} - New Vision Editor`
  } else {
    document.title = 'New Vision Editor'
  }
})

// Auto-redirect to login if not authenticated
watchEffect(() => {
  if (!authStore.isAuthenticated && !authStore.isLocked) {
    // The Login2FA component will handle the authentication flow
    console.log('User not authenticated, showing 2FA login')
  }
})
</script>

<style scoped>
.editor-dashboard {
  min-height: 100vh;
  background: #fafbfc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-content {
  min-height: 100vh;
}

.dashboard-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* User Header */
.user-header {
  background: #1a1d23;
  color: white;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.user-email {
  font-size: 0.75rem;
  opacity: 0.8;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.logout-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Dashboard Layout */
.dashboard-layout {
  flex: 1;
  display: flex;
  min-height: calc(100vh - 64px);
}

.dashboard-main {
  flex: 1;
  min-height: 100%;
  overflow: auto;
  background: #fafbfc;
  padding: 24px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e1e5e9;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* Error Banner */
.error-banner {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: #dc2626;
  color: white;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  font-weight: 500;
}

.close-error {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-error:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Header */
.dashboard-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  margin-bottom: 24px;
}

.header-content {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #1a1d23;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.publication-description {
  margin: 0 0 8px 0;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 500px;
}

.publication-access {
  display: flex;
  gap: 8px;
}

.access-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.access-badge.Full {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.access-badge.No {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.header-actions {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.publication-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.article-count,
.category-count,
.user-role {
  background: white;
  color: #475569;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.user-role {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Welcome State */
.welcome-state {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
}

.welcome-content {
  text-align: center;
  padding: 48px 24px;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  background: #dbeafe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 16px;
}

.welcome-content h2 {
  color: #1a1d23;
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.welcome-content p {
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 32px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.user-permissions {
  background: #f8fafc;
  border-radius: 8px;
  padding: 24px;
  margin: 0 auto 32px;
  max-width: 400px;
  border: 1px solid #e2e8f0;
}

.user-permissions h4 {
  margin: 0 0 16px 0;
  color: #1a1d23;
  font-size: 1rem;
  font-weight: 600;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
}

.permission-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.permission-text {
  font-size: 0.875rem;
  color: #475569;
  text-align: left;
}

.welcome-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.feature {
  text-align: center;
  padding: 20px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.feature:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin: 0 auto 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  color: #1a1d23;
  font-size: 1.125rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  color: #64748b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
}

.article-preview {
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.article-preview h4 {
  margin: 0 0 8px 0;
  color: #1a1d23;
  font-size: 0.875rem;
  font-weight: 600;
}

.article-meta {
  color: #64748b;
  font-size: 0.75rem;
  margin: 0 0 12px 0;
}

.article-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  font-size: 0.75rem;
  color: #475569;
  display: flex;
  justify-content: space-between;
}

.status-deleted {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  background: #64748b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #475569;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 16px;
  }
  
  .user-header {
    padding: 12px 16px;
  }
  
  .user-info {
    gap: 8px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .publication-stats {
    justify-content: center;
  }
  
  .welcome-features {
    grid-template-columns: 1fr;
  }
  
  .user-permissions {
    margin: 0 0 24px 0;
  }
}

@media (max-width: 480px) {
  .welcome-content {
    padding: 32px 16px;
  }
  
  .user-permissions {
    padding: 16px;
  }
  
  .permission-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style>