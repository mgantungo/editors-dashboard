<!--components/Main/ArticleEditor.vue-->
<template>
  <div class="editor-overlay" @click.self="handleOverlayClick">
    <div class="editor-modal">
      <div class="editor-header">
        <h2>{{ mode === 'create' ? 'Create New Article' : 'Edit Article' }}</h2>
        <div class="header-actions">
          <span v-if="lastSaved" class="auto-save-status">
            {{ autoSaveStatus }}
          </span>
          <button @click="handleClose" class="close-btn">×</button>
        </div>
      </div>
      
      <div class="editor-body">
        <!-- Title -->
        <div class="form-group">
          <label>Title *</label>
          <input v-model="formData.title" type="text" class="form-input" />
        </div>

        <!-- Authors -->
        <div class="form-group">
          <label>Authors</label>
          <AuthorSelect 
            v-model="formData.authors"
            :multiple="true"
          />
        </div>

        <!-- Category -->
        <div class="form-group">
          <label>Category *</label>
          <CategorySelect 
            v-model="formData.category"
            :label="''"
            :nullable="false"
          />
        </div>

        <!-- Status Controls -->
        <div class="form-group">
          <EditorStatusControls
            v-model:status="formData.status"
            v-model:publishedAt="formData.publishedAt"
            v-model:live="formData.live"
          />
        </div>

        <!-- Featured Image -->
        <div class="form-group">
          <label>Featured Image</label>
          <FeaturedImage 
            v-model="formData.featuredImage"
          />
        </div>

        <!-- Article Summary -->
        <div class="form-group">
          <label>Article Summary</label>
          <WysiwygEditor
            v-model="formData.summary"
            :placeholder="'Enter article summary...'"
            :compact="true"
          />
        </div>

        <!-- Article Content -->
        <div class="form-group">
          <label>Article Details *</label>
          <WysiwygEditor
            v-model="formData.content"
            :placeholder="'Enter article content...'"
            :with-emoji="true"
          />
        </div>

        <!-- Album Editor -->
        <div class="form-group">
          <label>Album</label>
          <AlbumEditor 
            v-model="formData.album"
          />
        </div>

        <!-- SEO Tags -->
        <div class="form-group">
          <label>SEO Tags</label>
          <SeoTagsInput
            v-model="formData.tags"
            :title="formData.title"
            :summary="formData.summary"
            :content="formData.content"
          />
        </div>

        <!-- Additional Options -->
        <div class="additional-options">
          <div class="option-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.featured" />
              <span>Featured Story</span>
            </label>

            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.breakingNews" />
              <span>Breaking News</span>
            </label>

            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.premium" />
              <span>Premium Content</span>
            </label>
          </div>

          <!-- Breaking Duration (shown only if breaking news is enabled) -->
          <div v-if="formData.breakingNews" class="form-group">
            <label>Breaking Duration (minutes)</label>
            <input 
              v-model="formData.breakingDuration" 
              type="number" 
              min="1" 
              class="form-input" 
              placeholder="Enter duration in minutes"
            />
          </div>

          <!-- Secondary Category -->
          <div class="form-group">
            <label>Secondary Category (Optional)</label>
            <CategorySelect 
              v-model="formData.secondaryCategory"
              :label="''"
              :nullable="true"
              :placeholder="'Select secondary category...'"
            />
          </div>
        </div>
      </div>

      <div class="editor-footer">
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
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmation" class="dialog-overlay">
      <div class="confirmation-dialog">
        <h3>{{ confirmationTitle }}</h3>
        <p>{{ confirmationMessage }}</p>
        <div class="dialog-actions">
          <button @click="confirmAction" class="btn-primary">{{ confirmButtonText }}</button>
          <button @click="cancelAction" class="btn-secondary">Cancel</button>
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

// Import store
const editorStore = useEditorStore()
const { authors, categories } = storeToRefs(editorStore)

const props = defineProps({
  article: Object,
  mode: String
})

const emit = defineEmits(['save', 'save-draft', 'publish', 'preview', 'cancel'])

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
  secondaryCategory: null
})

// Auto-save status text
const autoSaveStatus = computed(() => {
  if (!lastSaved.value) return 'Not saved yet'
  
  const now = new Date()
  const savedTime = new Date(lastSaved.value)
  const diffMinutes = Math.floor((now - savedTime) / (1000 * 60))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes === 1) return '1 minute ago'
  return `${diffMinutes} minutes ago`
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
      secondaryCategory: props.article.secondaryCategory || null
    }
  }
})

// Check for existing draft on component mount
onMounted(() => {
  loadDraft()
  startAutoSave()
  
  // Set up beforeunload to warn about unsaved changes
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

let isInitialLoad = true

// Load draft from local storage
const loadDraft = () => {
  try {
    const draft = localStorage.getItem(autoSaveKey.value)
    if (draft) {
      const parsedDraft = JSON.parse(draft)
      
      // Only load draft for new articles or if no article data is provided
      if (props.mode === 'create' || !props.article) {
        formData.value = { ...formData.value, ...parsedDraft.data }
        lastSaved.value = parsedDraft.timestamp
        hasDraft.value = true
        
        // Show restore notification
        if (props.mode === 'create') {
          setTimeout(() => {
            alert('Draft restored from auto-save')
          }, 100)
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
    
    console.log('Auto-saved at:', lastSaved.value)
  } catch (error) {
    console.error('Error auto-saving:', error)
  }
}

// Start auto-save interval (every 3 minutes)
const startAutoSave = () => {
  autoSaveInterval.value = setInterval(autoSave, 3 * 60 * 1000) // 3 minutes
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

// Handle save actions with confirmation
const handleSave = () => {
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
  showConfirmationDialog(
    'Save Draft',
    'Save this article as a draft?',
    'Save Draft',
    'save-draft'
  )
}

const handlePublish = () => {
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

// Perform actual actions
const performSave = () => {
  autoSave() // Force save before proceeding
  emit('save', formData.value)
  clearDraft()
}

const performSaveDraft = () => {
  formData.value.status = 'draft'
  autoSave() // Force save before proceeding
  emit('save-draft', formData.value)
}

const performPublish = () => {
  formData.value.status = 'published'
  if (!formData.value.publishedAt) {
    formData.value.publishedAt = new Date().toISOString()
  }
  autoSave() // Force save before proceeding
  emit('publish', formData.value)
  clearDraft()
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
.editor-overlay {
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
  padding: 1rem;
}

.editor-modal {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.editor-header h2 {
  margin: 0;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auto-save-status {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.editor-body {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.additional-options {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}

.editor-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  position: sticky;
  bottom: 0;
}

/* Confirmation Dialog Styles */
.confirmation-dialog {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.confirmation-dialog h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.confirmation-dialog p {
  margin: 0 0 2rem 0;
  color: #6b7280;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>