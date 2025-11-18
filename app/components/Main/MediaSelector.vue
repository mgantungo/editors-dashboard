<!--components/Main/MediaSelector.vue-->
<template>
  <div class="media-selector-overlay" @click.self="$emit('close')">
    <div class="media-selector">
      <div class="media-header">
        <h2>Media Library</h2>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <div class="media-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'library' }]"
          @click="activeTab = 'library'"
        >
          Library
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'upload' }]"
          @click="activeTab = 'upload'"
        >
          Upload
        </button>
      </div>

      <div class="media-content">
        <!-- Library Tab -->
        <div v-if="activeTab === 'library'" class="library-tab">
          <div class="library-filters">
            <input
              v-model="searchQuery"
              placeholder="Search media..."
              class="search-input"
            />
            <select v-model="mediaType" class="filter-select">
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>

          <div class="media-grid">
            <div
              v-for="item in filteredMedia"
              :key="item.id"
              :class="['media-item', { selected: selectedMedia?.id === item.id }]"
              @click="selectMedia(item)"
            >
              <div class="media-preview">
                <img v-if="item.type === 'image'" :src="item.url" :alt="item.alt" />
                <div v-else class="video-placeholder">🎥</div>
              </div>
              <div class="media-info">
                <div class="media-name">{{ item.name }}</div>
                <div class="media-meta">{{ formatFileSize(item.size) }}</div>
              </div>
            </div>
          </div>

          <div v-if="filteredMedia.length === 0" class="empty-state">
            No media files found
          </div>
        </div>

        <!-- Upload Tab -->
        <div v-else class="upload-tab">
          <div
            class="upload-zone"
            :class="{ 'drag-over': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="isDragOver = false"
          >
            <div class="upload-content">
              <div class="upload-icon">📁</div>
              <p>Drag and drop files here</p>
              <p class="upload-hint">or</p>
              <input
                ref="fileInput"
                type="file"
                multiple
                @change="handleFileSelect"
                class="file-input"
              />
              <button @click="triggerFileInput" class="btn-primary">
                Choose Files
              </button>
            </div>
          </div>

          <div v-if="uploadQueue.length > 0" class="upload-queue">
            <h4>Upload Queue</h4>
            <div
              v-for="file in uploadQueue"
              :key="file.id"
              class="upload-item"
            >
              <div class="upload-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${file.progress}%` }"
                  ></div>
                </div>
                <span class="progress-text">{{ file.progress }}%</span>
              </div>
              <div class="upload-info">
                <span>{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="media-footer">
        <div v-if="selectedMedia" class="selected-media-info">
          <img :src="selectedMedia.url" :alt="selectedMedia.alt" class="selected-preview" />
          <div class="selected-details">
            <div class="selected-name">{{ selectedMedia.name }}</div>
            <div class="selected-meta">
              {{ formatFileSize(selectedMedia.size) }} • 
              {{ selectedMedia.type }}
            </div>
          </div>
        </div>
        
        <div class="media-actions">
          <button @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button 
            @click="insertSelectedMedia" 
            class="btn-primary"
            :disabled="!selectedMedia"
          >
            Insert Media
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['media-selected', 'close'])

const activeTab = ref('library')
const searchQuery = ref('')
const mediaType = ref('')
const selectedMedia = ref(null)
const isDragOver = ref(false)
const uploadQueue = ref([])
const fileInput = ref(null)

// Sample media data
const mediaLibrary = ref([
  {
    id: 1,
    name: 'news-image-1.jpg',
    url: '/images/news-1.jpg',
    type: 'image',
    size: 1024000,
    alt: 'News image 1',
    uploadedAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'feature-story.jpg',
    url: '/images/feature-1.jpg',
    type: 'image',
    size: 2048000,
    alt: 'Feature story image',
    uploadedAt: '2024-01-14'
  }
])

const filteredMedia = computed(() => {
  let filtered = mediaLibrary.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (mediaType.value) {
    filtered = filtered.filter(item => item.type === mediaType.value)
  }
  
  return filtered
})

const selectMedia = (media) => {
  selectedMedia.value = media
}

const insertSelectedMedia = () => {
  if (selectedMedia.value) {
    emit('media-selected', selectedMedia.value)
    emit('close')
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  handleFiles(files)
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  handleFiles(files)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFiles = (files) => {
  files.forEach(file => {
    const fileItem = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      progress: 0,
      file: file
    }
    
    uploadQueue.value.push(fileItem)
    simulateUpload(fileItem)
  })
}

const simulateUpload = (fileItem) => {
  // Simulate upload progress
  const interval = setInterval(() => {
    fileItem.progress += 10
    if (fileItem.progress >= 100) {
      clearInterval(interval)
      
      // Add to media library
      const newMedia = {
        id: Date.now(),
        name: fileItem.name,
        url: URL.createObjectURL(fileItem.file),
        type: fileItem.type,
        size: fileItem.size,
        alt: fileItem.name,
        uploadedAt: new Date().toISOString()
      }
      
      mediaLibrary.value.unshift(newMedia)
      
      // Remove from queue after delay
      setTimeout(() => {
        uploadQueue.value = uploadQueue.value.filter(item => item.id !== fileItem.id)
      }, 1000)
    }
  }, 200)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.media-selector-overlay {
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

.media-selector {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.media-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  border-bottom-color: #3b82f6;
  color: #3b82f6;
}

.media-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.library-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.media-item {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.media-item:hover {
  border-color: #d1d5db;
}

.media-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.media-preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  overflow: hidden;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  font-size: 2rem;
}

.media-info {
  padding: 0.75rem;
}

.media-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  transition: all 0.2s ease;
}

.upload-zone.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.upload-hint {
  color: #6b7280;
  margin: 0;
}

.file-input {
  display: none;
}

.upload-queue {
  margin-top: 2rem;
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 3rem;
}

.upload-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.media-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  gap: 1rem;
}

.selected-media-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.selected-preview {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.375rem;
}

.selected-details {
  display: flex;
  flex-direction: column;
}

.selected-name {
  font-weight: 500;
}

.selected-meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.media-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
</style>