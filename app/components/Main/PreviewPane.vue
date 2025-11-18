<!--components/Main/Preview.vue-->
<template>
  <div class="preview-pane">
    <div class="preview-header">
      <h3>Article Preview</h3>
      <div class="preview-actions">
        <button @click="refreshPreview" class="btn-secondary">
          Refresh
        </button>
        <button @click="$emit('close')" class="close-btn">
          ×
        </button>
      </div>
    </div>
    
    <div class="preview-content">
      <div class="preview-article">
        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          
          <div class="article-meta">
            <div class="meta-left">
              <span class="publication">{{ publicationName }}</span>
              <span class="separator">•</span>
              <span class="date">{{ formatDate(article.publishedAt) }}</span>
              <span class="separator">•</span>
              <span class="authors">{{ authorNames }}</span>
            </div>
            
            <div class="meta-right">
              <span v-if="article.featured" class="featured-badge">Featured</span>
              <span v-if="article.breakingNews" class="breaking-badge">Breaking News</span>
            </div>
          </div>
        </header>

        <div v-if="article.featuredImage" class="featured-image-preview">
          <img :src="article.featuredImage.url" :alt="article.featuredImage.alt" />
          <div v-if="article.featuredImage.caption" class="image-caption">
            {{ article.featuredImage.caption }}
          </div>
          <div v-if="article.featuredImage.credit" class="image-credit">
            Photo: {{ article.featuredImage.credit }}
          </div>
        </div>

        <div class="article-summary" v-html="article.summary"></div>

        <div class="article-content" v-html="article.content"></div>

        <div v-if="article.album && article.album.length > 0" class="article-album">
          <h3>Gallery</h3>
          <div class="album-grid">
            <div
              v-for="image in article.album"
              :key="image.id"
              class="album-image"
            >
              <img :src="image.url" :alt="image.alt" />
              <div v-if="image.caption" class="image-caption">
                {{ image.caption }}
              </div>
            </div>
          </div>
        </div>

        <footer class="article-footer">
          <div class="article-tags">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  article: Object,
  publication: Object
})

const emit = defineEmits(['close'])

const publicationName = computed(() => props.publication?.name || 'Publication')

const authorNames = computed(() => {
  if (!props.article.authors) return ''
  return props.article.authors.map(author => author.name).join(', ')
})

const formatDate = (dateString) => {
  if (!dateString) return 'Not published'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshPreview = () => {
  // In real app, this would regenerate the preview
  console.log('Refreshing preview...')
}
</script>

<style scoped>
.preview-pane {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.preview-article {
  max-width: 800px;
  margin: 0 auto;
}

.article-header {
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.separator {
  color: #d1d5db;
}

.publication {
  font-weight: 600;
  color: #374151;
}

.meta-right {
  display: flex;
  gap: 0.5rem;
}

.featured-badge {
  background: #fbbf24;
  color: #78350f;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.breaking-badge {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.featured-image-preview {
  margin: 2rem 0;
}

.featured-image-preview img {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.image-caption {
  margin-top: 0.5rem;
  font-style: italic;
  color: #6b7280;
  text-align: center;
}

.image-credit {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
}

.article-summary {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #4b5563;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-left: 4px solid #3b82f6;
  border-radius: 0.375rem;
}

.article-content {
  line-height: 1.8;
  color: #374151;
}

.article-content :deep(h2) {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1f2937;
  margin: 2rem 0 1rem 0;
}

.article-content :deep(h3) {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 1.5rem 0 1rem 0;
}

.article-content :deep(p) {
  margin-bottom: 1rem;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
}

.article-album {
  margin: 3rem 0;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.album-image {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.album-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.article-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>