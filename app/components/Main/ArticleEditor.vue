<!--components/Main/ArticleEditor.vue - FIXED VERSION-->
<template>
  <div class="editor-overlay" @click.self="handleOverlayClick">
    <div class="editor-modal">
      <!-- Header -->
      <div class="editor-header">
        <div class="header-content">
          <h2 class="header-title">
            {{ mode === 'create' ? 'Create New Article' : 'Edit Article' }}
            <span v-if="article?.id" class="article-id">#{{ article.id }}</span>
          </h2>
          <div class="header-meta">
            <!-- Publication warning/indicator -->
            <span v-if="!hasPublication" class="publication-warning">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              No Publication Selected
            </span>
            <span v-else class="publication-indicator">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
              {{ currentPublication.name }}
            </span>
            <!-- NEW: Inline images indicator -->
            <span v-if="inlineImagesCount > 0" class="inline-images-indicator">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {{ inlineImagesCount }} inline {{ inlineImagesCount === 1 ? 'image' : 'images' }}
            </span>
            <span class="auto-save-status" :class="{ 'text-green-600': lastSaved, 'text-gray-500': !lastSaved }">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ autoSaveStatus }}
            </span>
          </div>
        </div>
        <button @click="handleClose" class="close-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Publication warning banner -->
      <div v-if="!hasPublication" class="publication-warning-banner">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <h4>Publication Not Selected</h4>
          <p>Please select a publication from the sidebar before creating or editing articles. Articles cannot be saved without a publication.</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="editor-content">
        <!-- Left Column - Main Content -->
        <div class="main-content">
          <!-- Title -->
          <div class="content-section">
            <label class="section-label">Article Title *</label>
            <input 
              v-model="formData.title" 
              type="text" 
              class="title-input" 
              placeholder="Enter a compelling title..."
            />
          </div>

          <!-- Content Editors -->
          <div class="content-grid">
            <!-- Summary -->
            <div class="content-section">
              <label class="section-label">Article Summary</label>
              <WysiwygEditor
                v-model="formData.summary"
                :placeholder="'Brief summary that will appear in listings...'"
                :compact="true"
                :allow-images="false"
              />
            </div>

            <!-- Main Content -->
            <div class="content-section">
              <label class="section-label">Article Content *</label>
              <WysiwygEditor
                ref="contentEditor"
                v-model="formData.content"
                :placeholder="'Write your article content here...'"
                :with-emoji="true"
                size="large"
                allow-images
                @inline-images-changed="handleInlineImagesChanged"
              />
            </div>
          </div>

          <!-- Album -->
          <div class="content-section">
            <label class="section-label">Image Gallery</label>
            <AlbumEditor 
              v-model="formData.album"
            />
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="sidebar">
          <!-- Save Controls at the top of sidebar -->
          <div class="sidebar-section save-controls-section">
            <SaveControls
              :status="formData.status"
              :is-new="mode === 'create'"
              :has-draft="hasDraft"
              @save="handleSave"
              @save-draft="handleSaveDraft"
              @publish="handlePublish"
              @preview="handlePreview"
              @cancel="handleCancel"
              @clear-draft="handleClearDraft"
            />
          </div>

          <!-- Publishing Status -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">Publishing</h3>
            <EditorStatusControls
              v-model:status="formData.status"
              v-model:publishedAt="formData.publishedAt"
              v-model:live="formData.live"
            />
          </div>

          <!-- Categories -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">Categories</h3>
            <div class="space-y-3">
              <div>
                <label class="field-label">Primary Category *</label>
                <CategorySelect 
                  v-model="formData.category"
                  :nullable="false"
                />
              </div>
              <div>
                <label class="field-label">Secondary Category</label>
                <CategorySelect 
                  v-model="formData.secondaryCategory"
                  :nullable="true"
                  :placeholder="'Optional secondary category...'"
                />
              </div>
            </div>
          </div>

          <!-- Authors -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">Authors</h3>
            <div v-if="mode === 'create' && currentUserAsAuthor" class="author-info-banner">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>You are automatically set as the first author. You can add more authors below.</span>
            </div>
            <AuthorSelect 
              v-model="formData.authors"
              :multiple="true"
            />
          </div>

          <!-- Featured Image -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">Featured Image</h3>
            <FeaturedImage 
              v-model="formData.featuredImage"
            />
          </div>

          <!-- SEO & Tags -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">SEO & Tags</h3>
            <SeoTagsInput
              v-model="formData.tags"
              :title="formData.title"
              :summary="formData.summary"
              :content="formData.content"
            />
          </div>

          <!-- Article Options -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">Article Options</h3>
            <div class="options-grid">
              <label class="option-checkbox">
                <input type="checkbox" v-model="formData.featured" />
                <span class="checkmark"></span>
                <div class="option-content">
                  <span class="option-label">Featured Story</span>
                  <span class="option-description">Promote to featured section</span>
                </div>
              </label>

              <label class="option-checkbox">
                <input type="checkbox" v-model="formData.breakingNews" />
                <span class="checkmark"></span>
                <div class="option-content">
                  <span class="option-label">Breaking News</span>
                  <span class="option-description">Highlight as breaking news</span>
                </div>
              </label>

              <label class="option-checkbox">
                <input type="checkbox" v-model="formData.premium" />
                <span class="checkmark"></span>
                <div class="option-content">
                  <span class="option-label">Premium Content</span>
                  <span class="option-description">Requires subscription</span>
                </div>
              </label>
            </div>

            <!-- Breaking Duration -->
            <div v-if="formData.breakingNews" class="mt-3">
              <label class="field-label">Breaking Duration (minutes)</label>
              <input 
                v-model="formData.breakingDuration" 
                type="number" 
                min="1" 
                class="form-input" 
                placeholder="120"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmation" class="dialog-overlay">
      <div class="confirmation-dialog">
        <div class="dialog-icon" :class="{ 'error-icon': pendingAction === 'validation-error' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="dialog-title">{{ confirmationTitle }}</h3>
        <p class="dialog-message" style="white-space: pre-line;">{{ confirmationMessage }}</p>
        <div class="dialog-actions">
          <button v-if="pendingAction !== 'validation-error'" @click="cancelAction" class="btn-secondary">Cancel</button>
          <button @click="pendingAction === 'validation-error' ? (showConfirmation = false) : confirmAction()" class="btn-primary">{{ confirmButtonText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import all necessary components
import AuthorSelect from './AuthorSelect.vue'
import CategorySelect from './CategorySelect.vue'
import EditorStatusControls from './EditorStatusControls.vue'
import FeaturedImage from './FeaturedImage.vue'
import WysiwygEditor from './WysiwygEditor.vue'
import AlbumEditor from './AlbumEditor.vue'
import SeoTagsInput from './SeoTagsInput.vue'
import SaveControls from './SaveControls.vue'

// Import stores
const editorStore = useEditorStore()
const authStore = useAuthStore()
const { authors, categories, currentPublication } = storeToRefs(editorStore)

const props = defineProps({
  article: Object,
  mode: String,
  user: Object
})

const emit = defineEmits(['save', 'save-draft', 'publish', 'preview', 'cancel'])

// NEW: Ref to content editor
const contentEditor = ref(null)

// NEW: Inline images state
const inlineImages = ref([])
const inlineImagesCount = computed(() => inlineImages.value.length)

// Auto-save state
const lastSaved = ref(null)
const autoSaveInterval = ref(null)
const hasUnsavedChanges = ref(false)
const hasDraft = ref(false)

// Confirmation dialog state
const showConfirmation = ref(false)
const pendingAction = ref(null)
const confirmationTitle = ref('')
const confirmationMessage = ref('')
const confirmButtonText = ref('Confirm')

// Validation state
const validationErrors = ref([])

// Form data with all required fields
const formData = ref({
  title: '',
  authors: [],
  category: null,
  status: 'draft',
  publishedAt: null,
  live: false,
  featured: false,
  breakingNews: false,
  breakingDuration: null,
  premium: false,
  tags: [],
  summary: '',
  content: '',
  featuredImage: null,
  album: [],
  secondaryCategory: null,
  publicationId: null
})

// NEW: Handle inline images changed from WysiwygEditor
const handleInlineImagesChanged = (images) => {
  console.log('📷 Inline images changed:', images.length)
  inlineImages.value = images
}

// Check if publication is selected
const hasPublication = computed(() => {
  return !!currentPublication.value
})

// Get current user as author object
const currentUserAsAuthor = computed(() => {
  if (!authStore.user) return null
  
  const displayName = authStore.user.name || authStore.user.username
  
  return {
    id: authStore.user.id,
    name: displayName,
    username: authStore.user.username || authStore.user.name,
    displayName: displayName,
    firstName: authStore.user.firstName || authStore.user.name?.split(' ')[0] || '',
    lastName: authStore.user.lastName || authStore.user.name?.split(' ').slice(1).join(' ') || '',
    email: authStore.user.email || ''
  }
})

// Initialize authors with current user
const initializeAuthors = () => {
  if (props.mode === 'create' && currentUserAsAuthor.value) {
    formData.value.authors = [currentUserAsAuthor.value]
    console.log('✅ Initialized with current user as author:', currentUserAsAuthor.value.displayName)
  }
}

// Initialize publication
const initializePublication = () => {
  if (currentPublication.value) {
    formData.value.publicationId = currentPublication.value.id
    console.log('✅ Initialized with publication:', currentPublication.value.name, '(ID:', currentPublication.value.id, ')')
  }
}

// Auto-save status text
const autoSaveStatus = computed(() => {
  if (!lastSaved.value) return 'Not saved'
  
  const now = new Date()
  const savedTime = new Date(lastSaved.value)
  const diffMinutes = Math.floor((now - savedTime) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Saved just now'
  if (diffMinutes === 1) return 'Saved 1 min ago'
  return `Saved ${diffMinutes} min ago`
})

// Auto-save key for local storage
const autoSaveKey = computed(() => {
  if (props.article?.id) {
    return `article_draft_${props.article.id}`
  }
  return 'article_draft_new'
})

// Initialize form with article data if editing
watchEffect(() => {
  if (props.article && props.mode !== 'create') {
    formData.value = {
      title: props.article.title || '',
      authors: props.article.authors || [],
      category: props.article.category || null,
      status: props.article.status || 'draft',
      publishedAt: props.article.publishedAt || null,
      live: props.article.live || false,
      featured: props.article.featured || false,
      breakingNews: props.article.breakingNews || false,
      breakingDuration: props.article.breakingDuration || null,
      premium: props.article.premium || false,
      tags: props.article.tags || [],
      summary: props.article.summary || '',
      content: props.article.content || '',
      featuredImage: props.article.featuredImage || null,
      album: props.article.album || [],
      secondaryCategory: props.article.secondaryCategory || null,
      publicationId: props.article.publicationId || currentPublication.value?.id
    }
  }
})

// Check for existing draft on component mount
onMounted(() => {
  if (props.mode === 'create') {
    initializeAuthors()
    initializePublication()
  }
  
  loadDraft()
  startAutoSave()
  
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Clean up on component unmount
onUnmounted(() => {
  stopAutoSave()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Watch for form changes to set unsaved changes flag
watch(formData, (newValue, oldValue) => {
  if (!isInitialLoad.value) {
    hasUnsavedChanges.value = true
  }
}, { deep: true, immediate: false })

// Watch for publication changes
watch(() => currentPublication.value, (newPublication) => {
  if (newPublication) {
    formData.value.publicationId = newPublication.id
    console.log('📰 Publication changed to:', newPublication.name, '(ID:', newPublication.id, ')')
  }
})

let isInitialLoad = true

// Load draft from local storage
const loadDraft = () => {
  try {
    const draft = localStorage.getItem(autoSaveKey.value)
    if (draft) {
      const parsedDraft = JSON.parse(draft)
      
      if (props.mode === 'create' || !props.article) {
        formData.value = { ...formData.value, ...parsedDraft.data }
        lastSaved.value = parsedDraft.timestamp
        hasDraft.value = true
        
        if (props.mode === 'create' && currentUserAsAuthor.value) {
          const hasCurrentUser = formData.value.authors.some(a => a.id === currentUserAsAuthor.value.id)
          if (!hasCurrentUser) {
            formData.value.authors.unshift(currentUserAsAuthor.value)
          }
        }
        
        if (props.mode === 'create' && !formData.value.publicationId && currentPublication.value) {
          formData.value.publicationId = currentPublication.value.id
        }
      }
    }
    isInitialLoad = false
  } catch (error) {
    console.error('Error loading draft:', error)
    isInitialLoad = false
  }
}

// Auto-save to local storage
const autoSave = () => {
  if (!hasUnsavedChanges.value) return
  
  try {
    const draftData = {
      data: formData.value,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem(autoSaveKey.value, JSON.stringify(draftData))
    lastSaved.value = draftData.timestamp
    hasUnsavedChanges.value = false
    hasDraft.value = true
  } catch (error) {
    console.error('Error auto-saving:', error)
  }
}

// Start auto-save interval (every 2 minutes)
const startAutoSave = () => {
  autoSaveInterval.value = setInterval(autoSave, 2 * 60 * 1000)
}

// Stop auto-save interval
const stopAutoSave = () => {
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value)
    autoSaveInterval.value = null
  }
}

// Clear draft from local storage
const clearDraft = () => {
  try {
    localStorage.removeItem(autoSaveKey.value)
    hasDraft.value = false
    lastSaved.value = null
    hasUnsavedChanges.value = false
  } catch (error) {
    console.error('Error clearing draft:', error)
  }
}

// Handle beforeunload event
const handleBeforeUnload = (event) => {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return event.returnValue
  }
}

// Handle overlay click
const handleOverlayClick = () => {
  if (hasUnsavedChanges.value) {
    showConfirmationDialog(
      'Unsaved Changes',
      'You have unsaved changes. Are you sure you want to close the editor?',
      'Close Anyway',
      'close'
    )
  } else {
    emit('cancel')
  }
}

// Handle close button
const handleClose = () => {
  handleOverlayClick()
}

// Show confirmation dialog
const showConfirmationDialog = (title, message, buttonText, action) => {
  confirmationTitle.value = title
  confirmationMessage.value = message
  confirmButtonText.value = buttonText
  pendingAction.value = action
  showConfirmation.value = true
}

// Confirm action
const confirmAction = () => {
  const action = pendingAction.value
  showConfirmation.value = false
  pendingAction.value = null
  
  switch (action) {
    case 'save':
      performSave()
      break
    case 'save-draft':
      performSaveDraft()
      break
    case 'publish':
      performPublish()
      break
    case 'close':
      clearDraft()
      emit('cancel')
      break
    case 'clear-draft':
      performClearDraft()
      break
  }
}

// Cancel action
const cancelAction = () => {
  showConfirmation.value = false
  pendingAction.value = null
}

// Validation function
const validateForm = () => {
  const errors = []
  
  if (!hasPublication.value) {
    errors.push('Publication must be selected before saving')
  }
  
  if (!formData.value.title || formData.value.title.trim() === '') {
    errors.push('Article title is required')
  }
  
  if (!formData.value.content || formData.value.content.trim() === '') {
    errors.push('Article content is required')
  }
  
  if (!formData.value.authors || formData.value.authors.length === 0) {
    errors.push('At least one author is required')
  }
  
  validationErrors.value = errors
  return errors.length === 0
}

// Handle save actions with confirmation
const handleSave = () => {
  if (!validateForm()) {
    showConfirmationDialog(
      'Cannot Save Article',
      validationErrors.value.join('\n'),
      'OK',
      'validation-error'
    )
    return
  }
  
  if (hasUnsavedChanges.value) {
    showConfirmationDialog(
      'Save Changes',
      'Are you sure you want to save changes to this article?',
      'Save',
      'save'
    )
  } else {
    performSave()
  }
}

const handleSaveDraft = () => {
  if (!validateForm()) {
    showConfirmationDialog(
      'Cannot Save Draft',
      validationErrors.value.join('\n'),
      'OK',
      'validation-error'
    )
    return
  }
  
  showConfirmationDialog(
    'Save Draft',
    'Save this article as a draft?',
    'Save Draft',
    'save-draft'
  )
}


const handlePublish = () => {
  if (!validateForm()) {
    showConfirmationDialog(
      'Cannot Publish Article',
      validationErrors.value.join('\n'),
      'OK',
      'validation-error'
    )
    return
  }
  
  showConfirmationDialog(
    'Publish Article',
    'Are you sure you want to publish this article?',
    'Publish',
    'publish'
  )
}  


const handlePreview = () => {
  emit('preview', formData.value)
}

const handleCancel = () => {
  if (hasUnsavedChanges.value) {
    showConfirmationDialog(
      'Unsaved Changes',
      'You have unsaved changes. Are you sure you want to cancel?',
      'Yes, Cancel',
      'close'
    )
  } else {
    clearDraft()
    emit('cancel')
  }
}

const handleClearDraft = () => {
  showConfirmationDialog(
    'Clear Draft',
    'Are you sure you want to clear the auto-saved draft? This action cannot be undone.',
    'Clear Draft',
    'clear-draft'
  )
}

// NEW: Prepare article data with inline images
const prepareArticleDataWithInlineImages = () => {
  // Get inline images from the content editor
  const currentInlineImages = contentEditor.value?.getInlineImages() || []
  
  console.log('📦 Preparing article data with inline images:', currentInlineImages.length)
  
  return {
    ...formData.value,
    inlineImages: currentInlineImages // Add inline images to the data
  }
}

// Perform actual actions
const performSave = () => {
    if (!formData.value.status || formData.value.status === '') {
      formData.value.status = 'draft'
    }
    
    console.log('💾 Saving article with status:', formData.value.status)
    console.log('📰 Publication ID:', formData.value.publicationId)
    console.log('👥 Authors:', formData.value.authors)
    console.log('📷 Inline images:', inlineImages.value.length)
    
    const articleData = prepareArticleDataWithInlineImages()
    
    autoSave()
    emit('save', articleData)
    clearDraft()
  }

const performSaveDraft = () => {
  // Ensure status is 'draft' and not 'published'
  formData.value.status = 'draft';
  formData.value.live = false;
  formData.value.publishedAt = null;
  
  console.log('💾 Saving draft (not publishing)');
  console.log('📰 Publication ID:', formData.value.publicationId);
  console.log('📷 Inline images:', inlineImages.value.length);
  
  const articleData = prepareArticleDataWithInlineImages();
  
  autoSave();
  emit('save-draft', articleData);
}


const performPublish = () => {
  // Ensure status is 'published'
  formData.value.status = 'published';
  formData.value.live = true;
  
  // Set publishedAt only if not already set
  if (!formData.value.publishedAt) {
    formData.value.publishedAt = new Date().toISOString();
  }
  
  console.log('📢 Publishing article');
  console.log('📰 Publication ID:', formData.value.publicationId);
  console.log('📷 Inline images:', inlineImages.value.length);
  
  const articleData = prepareArticleDataWithInlineImages();
  
  autoSave();
  emit('publish', articleData);
  clearDraft();
}

const performClearDraft = () => {
  clearDraft()
}

// Set default published date when status changes to published
watch(() => formData.value.status, (newStatus) => {
  if (newStatus === 'published' && !formData.value.publishedAt) {
    formData.value.publishedAt = new Date().toISOString()
    formData.value.live = true
  }
})
</script>

<style scoped>
/* ... (Keep all existing styles from previous version) ... */
.editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.editor-modal {
  background: white;
  border-radius: 5px;
  width: 100%;
  max-width: 1400px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.auto-save-status {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.publication-warning {
  display: flex;
  align-items: center;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 600;
  background: #fef2f2;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #fecaca;
}

.inline-images-indicator {
  display: flex;
  align-items: center;
  color: #8b5cf6;
  font-size: 0.875rem;
  font-weight: 600;
  background: #f3e8ff;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d8b4fe;
}

.publication-indicator {
  display: flex;
  align-items: center;
  color: #059669;
  font-size: 0.875rem;
  font-weight: 600;
  background: #d1fae5;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #a7f3d0;
}

.publication-warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 2rem;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-content h4 {
  margin: 0 0 0.5rem 0;
  color: #991b1b;
  font-size: 1rem;
  font-weight: 600;
}

.warning-content p {
  margin: 0;
  color: #dc2626;
  font-size: 0.875rem;
  line-height: 1.5;
}

.close-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.editor-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  overflow: hidden;
}

.main-content {
  padding: 2rem;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
}

.sidebar {
  padding: 2rem;
  overflow-y: auto;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
}

.save-controls-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.content-section {
  margin-bottom: 2rem;
}

.section-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.title-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  background: white;
  transition: all 0.2s;
}

.title-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.title-input::placeholder {
  color: #9ca3af;
  font-weight: 500;
}

.content-grid {
  display: grid;
  gap: 2rem;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.author-info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #1e40af;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.option-checkbox:hover {
  background: #f8fafc;
}

.option-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
  transition: all 0.2s;
}

.option-checkbox input[type="checkbox"]:checked + .checkmark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.option-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.option-content {
  flex: 1;
}

.option-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.option-description {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  backdrop-filter: blur(4px);
}

.confirmation-dialog {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dialog-icon {
  width: 3rem;
  height: 3rem;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #d97706;
}

.error-icon {
  background: #fef2f2 !important;
  color: #dc2626 !important;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.dialog-message {
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

@media (max-width: 1024px) {
  .editor-content {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .sidebar {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .editor-modal {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .editor-header,
  .main-content,
  .sidebar,
  .editor-footer {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .title-input {
    font-size: 1.25rem;
    padding: 0.75rem;
  }
}
</style>