<!--components/Main/MediaSelector.vue-->
<template>
  <div class="media-selector-overlay" @click.self="handleClose">
    <div class="media-selector bg-white rounded-xl w-full max-w-6xl max-h-[80vh] flex flex-col">
      <div class="media-header flex justify-between items-center p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-semibold">Media Library</h2>
          <p class="text-sm text-gray-500 mt-1">Select multiple images for your album</p>
        </div>
        <button @click="handleClose" class="close-btn text-2xl hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
          Ã—
        </button>
      </div>

      <div class="media-tabs flex border-b border-gray-200">
        <button 
          :class="['tab-button px-6 py-4 border-b-2 transition-colors duration-200', 
                   { 'border-blue-500 text-blue-500': activeTab === 'library', 
                     'border-transparent text-gray-500': activeTab !== 'library' }]"
          @click="activeTab = 'library'"
        >
          Library
        </button>
        <button 
          :class="['tab-button px-6 py-4 border-b-2 transition-colors duration-200',
                   { 'border-blue-500 text-blue-500': activeTab === 'upload', 
                     'border-transparent text-gray-500': activeTab !== 'upload' }]"
          @click="activeTab = 'upload'"
        >
          Upload Multiple
        </button>
      </div>

      <div class="media-content flex-1 p-6 overflow-y-auto">
        <!-- Library Tab -->
        <div v-if="activeTab === 'library'" class="library-tab">
          <div class="library-filters flex gap-4 mb-6">
            <input
              v-model="searchQuery"
              placeholder="Search media..."
              class="search-input flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select v-model="mediaType" class="filter-select px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>

          <div class="selection-info mb-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700">
              {{ selectedMedia.length }} image(s) selected
            </p>
          </div>

          <div class="media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <div
              v-for="item in filteredMedia"
              :key="item.id"
              :class="['media-item border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden relative',
                       { 'border-blue-500 bg-blue-50': isSelected(item.id),
                         'border-gray-200 hover:border-gray-300': !isSelected(item.id) }]"
              @click="toggleMediaSelection(item)"
            >
              <!-- Selection Checkbox -->
              <div class="absolute top-2 right-2 z-10">
                <input
                  type="checkbox"
                  :checked="isSelected(item.id)"
                  class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  @click.stop="toggleMediaSelection(item)"
                />
              </div>
              
              <div class="media-preview h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="item.type === 'image'" 
                  :src="item.url" 
                  :alt="item.alt" 
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <div v-else class="video-placeholder text-2xl">ðŸŽ¥</div>
              </div>
              <div class="media-info p-3">
                <div class="media-name text-sm font-medium text-gray-800 truncate mb-1">{{ item.name }}</div>
                <div class="media-meta text-xs text-gray-500">{{ formatFileSize(item.size) }}</div>
              </div>
            </div>
          </div>

          <div v-if="filteredMedia.length === 0" class="empty-state text-center py-12 text-gray-500">
            No media files found
          </div>
        </div>

        <!-- Upload Tab -->
        <div v-else class="upload-tab">
          <div
            class="upload-zone border-2 border-dashed border-gray-300 rounded-xl p-12 text-center transition-all duration-200"
            :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="isDragOver = false"
          >
            <div class="upload-content flex flex-col items-center gap-4">
              <div class="upload-icon text-4xl">ðŸ“</div>
              <p class="text-gray-700 font-medium">Drag and drop multiple files here</p>
              <p class="upload-hint text-gray-500 m-0">or</p>
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                @change="handleFileSelect"
                class="file-input hidden"
              />
              <button @click="triggerFileInput" class="btn-primary px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                Choose Multiple Files
              </button>
              <p class="text-xs text-gray-500">Supports multiple image selection</p>
            </div>
          </div>

          <div v-if="uploadQueue.length > 0" class="upload-queue mt-6">
            <h4 class="text-lg font-semibold mb-4">Upload Queue ({{ uploadQueue.length }} files)</h4>
            <div
              v-for="file in uploadQueue"
              :key="file.id"
              class="upload-item flex items-center gap-4 p-4 border border-gray-200 rounded-lg mb-3"
            >
              <div class="upload-progress flex items-center gap-4 flex-1">
                <div class="progress-bar flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="progress-fill h-full bg-green-500 transition-all duration-300"
                    :style="{ width: `${file.progress}%` }"
                  ></div>
                </div>
                <span class="progress-text text-sm text-gray-600 min-w-12">{{ file.progress }}%</span>
              </div>
              <div class="upload-info flex flex-col items-end">
                <span class="text-sm font-medium text-gray-800">{{ file.name }}</span>
                <span class="file-size text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
            
            <div class="mt-4 p-3 bg-green-50 rounded-lg">
              <p class="text-sm text-green-700">
                {{ completedUploads }} of {{ uploadQueue.length }} files uploaded successfully
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="media-footer flex justify-between items-center p-6 border-t border-gray-200 gap-4">
        <div v-if="selectedMedia.length > 0" class="selected-media-info flex items-center gap-4 flex-1">
          <div class="flex -space-x-2">
            <img 
              v-for="media in selectedMedia.slice(0, 3)" 
              :key="media.id"
              :src="media.url" 
              :alt="media.alt" 
              class="selected-preview w-12 h-12 object-cover rounded-lg border-2 border-white"
              @error="handleImageError"
            />
            <div v-if="selectedMedia.length > 3" class="w-12 h-12 bg-gray-200 rounded-lg border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{{ selectedMedia.length - 3 }}
            </div>
          </div>
          <div class="selected-details flex flex-col">
            <div class="selected-name font-medium text-gray-800">{{ selectedMedia.length }} image(s) selected</div>
            <div class="selected-meta text-sm text-gray-500">
              Ready to add to album
            </div>
          </div>
        </div>
        <div v-else class="flex-1"></div>
        
        <div class="media-actions flex gap-3">
          <button @click="clearSelection" class="btn-secondary px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200" :disabled="selectedMedia.length === 0">
            Clear Selection
          </button>
          <button 
            @click="insertSelectedMedia" 
            class="btn-primary px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="selectedMedia.length === 0"
          >
            Add {{ selectedMedia.length }} Image(s)
          </button>
          <button @click="handleClose" class="btn-cancel px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Define emits for multiple media selection
const emit = defineEmits(['media-selected', 'multiple-media-selected', 'close'])

const activeTab = ref('library')
const searchQuery = ref('')
const mediaType = ref('')
const selectedMedia = ref([])
const isDragOver = ref(false)
const uploadQueue = ref([])
const fileInput = ref(null)
const completedUploads = ref(0)

// Sample media data with working image URLs
const mediaLibrary = ref([
  {
    id: 1,
    name: 'mountain-landscape.jpg',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    type: 'image',
    size: 1024000,
    alt: 'Beautiful mountain landscape',
    uploadedAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'city-skyline.jpg',
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=200&fit=crop',
    type: 'image',
    size: 2048000,
    alt: 'Modern city skyline',
    uploadedAt: '2024-01-14'
  },
  {
    id: 3,
    name: 'forest-path.jpg',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&h=200&fit=crop',
    type: 'image',
    size: 1536000,
    alt: 'Peaceful forest path',
    uploadedAt: '2024-01-13'
  },
  {
    id: 4,
    name: 'beach-sunset.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
    type: 'image',
    size: 2560000,
    alt: 'Tropical beach sunset',
    uploadedAt: '2024-01-12'
  },
  {
    id: 5,
    name: 'desert-dunes.jpg',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&h=200&fit=crop',
    type: 'image',
    size: 1980000,
    alt: 'Sandy desert dunes',
    uploadedAt: '2024-01-11'
  },
  {
    id: 6,
    name: 'lake-reflection.jpg',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=200&fit=crop',
    type: 'image',
    size: 2230000,
    alt: 'Calm lake reflection',
    uploadedAt: '2024-01-10'
  }
])

const filteredMedia = computed(() => {
  let filtered = mediaLibrary.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.alt.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (mediaType.value) {
    filtered = filtered.filter(item => item.type === mediaType.value)
  }
  
  return filtered
})

const isSelected = (mediaId) => {
  return selectedMedia.value.some(media => media.id === mediaId)
}

const toggleMediaSelection = (media) => {
  const index = selectedMedia.value.findIndex(item => item.id === media.id)
  if (index > -1) {
    selectedMedia.value.splice(index, 1)
  } else {
    selectedMedia.value.push(media)
  }
}

const clearSelection = () => {
  selectedMedia.value = []
}

// FIXED: Emit all selected media at once
/*
const insertSelectedMedia = () => {
  if (selectedMedia.value.length > 0) {
    // Emit all selected media items as an array
    emit('multiple-media-selected', selectedMedia.value)
    handleClose()
  }
}
*/

const insertSelectedMedia = () => {
  if (selectedMedia.value.length > 0) {
    if (selectedMedia.value.length === 1) {
      // Emit single media for backward compatibility
      emit('media-selected', selectedMedia.value[0])
    }
    // Always emit multiple media
    emit('multiple-media-selected', selectedMedia.value)
    handleClose()
  }
}

const handleClose = () => {
  // Clear selection when closing
  selectedMedia.value = []
  emit('close')
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
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    alert('Please select image files only.')
    return
  }
  
  imageFiles.forEach(file => {
    const fileItem = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: 'image',
      progress: 0,
      file: file
    }
    
    uploadQueue.value.push(fileItem)
    simulateUpload(fileItem)
  })
}

const simulateUpload = (fileItem) => {
  // Convert file to base64 immediately to avoid blob URLs
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64Data = e.target.result
    
    // Simulate progress animation
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      fileItem.progress = progress
      
      if (progress >= 100) {
        clearInterval(interval)
        
        // Add to media library with BASE64 URL instead of blob URL
        const newMedia = {
          id: Date.now() + Math.random(),
          name: fileItem.name,
          url: base64Data,  // BASE64 - will be extracted and uploaded by ArticleEditor
          type: fileItem.type,
          size: fileItem.size,
          alt: fileItem.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          uploadedAt: new Date().toISOString(),
          file: fileItem.file  // Keep the file for potential future use
        }
        
        mediaLibrary.value.unshift(newMedia)
        completedUploads.value++
        
        // Auto-select the newly uploaded media
        selectedMedia.value.push(newMedia)
        
        // Remove from queue after delay
        setTimeout(() => {
          uploadQueue.value = uploadQueue.value.filter(item => item.id !== fileItem.id)
          if (uploadQueue.value.length === 0) {
            completedUploads.value = 0
          }
        }, 1000)
      }
    }, 200)
  }
  
  reader.onerror = (error) => {
    console.error('Error converting file to base64:', error)
  }
  
  reader.readAsDataURL(fileItem.file)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .media-selector-overlay {
    padding: 1rem;
  }
  
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .library-filters {
    flex-direction: column;
  }
  
  .media-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .media-actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>