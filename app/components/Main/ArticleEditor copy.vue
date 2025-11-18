<!--components/Main/ArticleEditor.vue-->
<template>
  <div class="editor-overlay" @click.self="$emit('cancel')">
    <div class="editor-modal">
      <div class="editor-header">
        <h2>{{ mode === 'create' ? 'Create New Article' : 'Edit Article' }}</h2>
        <button @click="$emit('cancel')" class="close-btn">×</button>
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
          @save="$emit('save', formData)"
          @save-draft="$emit('save-draft', formData)"
          @publish="$emit('publish', formData)"
          @preview="$emit('preview', formData)"
          @cancel="$emit('cancel')"
        />
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
</style>