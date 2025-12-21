<!--components/Main/MediaSelector.vue-->
<template>
  <div class="media-selector-overlay" @click.self="handleClose">
    <div class="media-selector bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] flex flex-col overflow-hidden">
      <!-- Header - Compact -->
      <div class="media-header flex justify-between items-center px-5 py-3 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="header-icon w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Media Library</h2>
            <p class="text-xs text-gray-500">Select multiple images</p>
          </div>
        </div>
        <button 
          @click="handleClose" 
          class="close-btn p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Close"
        >
          <svg class="w-5 h-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs - Compact -->
      <div class="media-tabs flex border-b border-gray-100 bg-gray-50">
        <button 
          :class="['tab-button flex items-center gap-2 px-4 py-3 relative transition-colors duration-200 font-medium text-sm flex-1 justify-center',
                   { 'text-blue-600': activeTab === 'library', 
                     'text-gray-600 hover:text-gray-800': activeTab !== 'library' }]"
          @click="activeTab = 'library'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Library
          <div v-if="activeTab === 'library'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"></div>
        </button>
        <button 
          :class="['tab-button flex items-center gap-2 px-4 py-3 relative transition-colors duration-200 font-medium text-sm flex-1 justify-center',
                   { 'text-blue-600': activeTab === 'upload', 
                     'text-gray-600 hover:text-gray-800': activeTab !== 'upload' }]"
          @click="activeTab = 'upload'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload
          <div v-if="activeTab === 'upload'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"></div>
        </button>
      </div>

      <!-- Content Area -->
      <div class="media-content flex-1 p-5 overflow-y-auto">
        <!-- Library Tab -->
        <div v-if="activeTab === 'library'" class="library-tab">
          <!-- Filters -->
          <div class="library-filters flex flex-col sm:flex-row gap-3 mb-4">
            <div class="search-container flex-1 relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                placeholder="Search media..."
                class="search-input w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <select 
              v-model="mediaType" 
              class="filter-select px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
            <button 
              v-if="uniqueCachedImages.length > 0"
              @click="showCacheManagement = !showCacheManagement"
              class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm flex items-center gap-2"
              :class="{ 'bg-blue-50 border-blue-200': showCacheManagement }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Cache ({{ uniqueCachedImages.length }})
            </button>
          </div>

          <!-- Cache Management -->
          <div v-if="showCacheManagement" class="cache-management mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-blue-800">Image Cache Management</h3>
              <button 
                @click="showCacheManagement = false"
                class="text-blue-600 hover:text-blue-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-blue-700">Unique cached images:</span>
                <span class="text-sm font-medium text-blue-800">{{ uniqueCachedImages.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-blue-700">Cache size:</span>
                <span class="text-sm font-medium text-blue-800">{{ formatFileSize(cacheSize) }}</span>
              </div>
              <div class="text-xs text-blue-600 mt-2">
                <p>When cache reaches capacity, oldest unused images will be automatically removed.</p>
              </div>
              <div class="flex gap-2 mt-3">
                <button 
                  @click="clearUnusedCache"
                  class="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Clear Unused
                </button>
                <button 
                  @click="removeDuplicates"
                  class="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Remove Duplicates
                </button>
                <button 
                  @click="clearAllCache"
                  class="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                >
                  Clear All Cache
                </button>
              </div>
            </div>
          </div>

          <!-- Selection Info -->
          <div v-if="selectedMedia.length > 0" class="selection-info mb-3 p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-blue-800">
                  {{ selectedMedia.length }} selected
                </span>
              </div>
              <button 
                @click="clearSelection"
                class="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          </div>

          <!-- Media Grid -->
          <div class="media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            <div
              v-for="item in filteredUniqueMedia"
              :key="item.uniqueId"
              :class="['media-item group relative cursor-pointer transition-all duration-200 overflow-hidden bg-white rounded-lg border-2 hover:shadow-sm',
                       { 'border-blue-500 bg-blue-50': isSelected(item.id),
                         'border-gray-200 hover:border-gray-300': !isSelected(item.id) }]"
              @click="toggleMediaSelection(item)"
            >
              <!-- Remove from Cache Button -->
              <button 
                v-if="isCached(item.id)"
                @click.stop="removeFromCache(item)"
                class="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-red-100 border border-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200"
                title="Remove from cache"
              >
                <svg class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Cached Indicator -->
              <div v-if="isCached(item.id)" class="absolute top-2 right-2 z-10">
                <div class="w-5 h-5 rounded-full bg-green-100 border border-green-200 flex items-center justify-center" title="Cached">
                  <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <!-- Selection Indicator -->
              <div class="absolute top-2 right-2 z-10" v-if="!isCached(item.id)">
                <div :class="['w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 border',
                            { 'bg-blue-500 border-blue-500': isSelected(item.id),
                              'bg-white/90 border-gray-300 group-hover:border-blue-300': !isSelected(item.id) }]">
                  <svg v-if="isSelected(item.id)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <!-- Media Preview -->
              <div class="media-preview h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="item.type === 'image'" 
                  :src="item.url" 
                  :alt="item.alt" 
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  @load="cacheImage(item)"
                  @error="handleImageError"
                  loading="lazy"
                />
                <div v-else class="video-placeholder text-gray-400">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <!-- Media Info -->
              <div class="media-info p-2">
                <div class="media-name text-xs font-medium text-gray-800 truncate">{{ item.name }}</div>
                <div class="flex items-center justify-between mt-1">
                  <div class="media-meta text-xs text-gray-500">{{ formatFileSize(item.size) }}</div>
                  <span v-if="isCached(item.id)" class="text-xs text-green-600">Cached</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredUniqueMedia.length === 0" class="empty-state text-center py-10">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-gray-500">No media found</p>
            <button 
              @click="activeTab = 'upload'"
              class="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              Upload Images
            </button>
          </div>
        </div>

        <!-- Upload Tab -->
        <div v-else class="upload-tab">
          <!-- Upload Zone -->
          <div
            class="upload-zone border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-200"
            :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="isDragOver = false"
          >
            <div class="upload-content flex flex-col items-center gap-3">
              <div class="upload-icon text-blue-500">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800 mb-1">Drag and drop files here</p>
                <p class="text-xs text-gray-500">or</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                @change="handleFileSelect"
                class="file-input hidden"
              />
              <button 
                @click="triggerFileInput" 
                class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Browse Files
              </button>
              <p class="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </div>

          <!-- Upload Queue -->
          <div v-if="uploadQueue.length > 0" class="upload-queue mt-5">
            <h4 class="text-sm font-semibold text-gray-800 mb-3">Upload Queue ({{ uploadQueue.length }})</h4>
            <div class="space-y-2">
              <div
                v-for="file in uploadQueue"
                :key="file.id"
                class="upload-item flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div class="upload-progress flex items-center gap-3 flex-1">
                  <div class="progress-bar flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="progress-fill h-full bg-green-500 transition-all duration-300"
                      :style="{ width: `${file.progress}%` }"
                    ></div>
                  </div>
                  <span class="progress-text text-xs text-gray-600 min-w-8">{{ file.progress }}%</span>
                </div>
                <div class="upload-info flex flex-col items-end">
                  <span class="text-xs font-medium text-gray-800 truncate max-w-[120px]">{{ file.name }}</span>
                  <span class="file-size text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="completedUploads > 0" class="mt-3 p-3 bg-green-50 rounded-lg">
              <p class="text-xs text-green-700">
                {{ completedUploads }} of {{ uploadQueue.length }} uploaded
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="media-footer border-t border-gray-200 px-5 py-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Selected Preview -->
          <div v-if="selectedMedia.length > 0" class="selected-media-info flex items-center gap-3 flex-1">
            <div class="flex -space-x-2">
              <img 
                v-for="media in selectedMedia.slice(0, 3)" 
                :key="media.id"
                :src="media.url" 
                :alt="media.alt" 
                class="selected-preview w-10 h-10 object-cover rounded-lg border-2 border-white shadow-sm"
                @error="handleImageError"
              />
              <div v-if="selectedMedia.length > 3" class="w-10 h-10 bg-blue-100 rounded-lg border-2 border-white flex items-center justify-center text-xs font-medium text-blue-600">
                +{{ selectedMedia.length - 3 }}
              </div>
            </div>
            <div class="selected-details">
              <div class="selected-name text-sm font-medium text-gray-800">{{ selectedMedia.length }} selected</div>
              <div class="selected-meta text-xs text-gray-500">
                {{ formatFileSize(selectedMedia.reduce((sum, item) => sum + item.size, 0)) }}
              </div>
            </div>
          </div>
          <div v-else class="flex-1"></div>
          
          <!-- Actions -->
          <div class="media-actions flex gap-2">
            <button 
              @click="clearSelection" 
              class="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="selectedMedia.length === 0"
            >
              Clear
            </button>
            <button 
              @click="handleClose" 
              class="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              @click="insertSelectedMedia" 
              class="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="selectedMedia.length === 0"
            >
              Add {{ selectedMedia.length }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const showCacheManagement = ref(false)

// Image caching system
const cachedImages = ref(new Map())
const imageCache = {
  CACHE_KEY: 'media_selector_cache',
  MAX_CACHE_SIZE: 50, // Max 50 images in cache
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

  // Load cache from localStorage on init
  loadCache() {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Filter out expired cache entries
        const now = Date.now()
        const validCache = parsed.filter(entry => now - entry.timestamp < this.CACHE_EXPIRY)
        cachedImages.value = new Map(validCache.map(entry => [entry.id, entry]))
        
        // Clean up expired entries
        if (validCache.length < parsed.length) {
          this.saveCache()
        }
      }
    } catch (error) {
      console.error('Failed to load cache:', error)
      cachedImages.value = new Map()
    }
  },

  // Save cache to localStorage
  saveCache() {
    try {
      const cacheArray = Array.from(cachedImages.value.entries()).map(([id, entry]) => ({
        id,
        url: entry.url,
        timestamp: entry.timestamp,
        lastUsed: entry.lastUsed,
        size: entry.size || 0
      }))
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheArray))
    } catch (error) {
      console.error('Failed to save cache:', error)
    }
  },

  // Add image to cache (prevents duplicates by URL)
  addToCache(id, url, size = 0) {
    // Check for duplicates by URL
    let isDuplicate = false
    let duplicateId = null
    
    for (const [existingId, entry] of cachedImages.value.entries()) {
      if (entry.url === url) {
        isDuplicate = true
        duplicateId = existingId
        break
      }
    }

    if (isDuplicate) {
      // Update the existing entry with new timestamp
      const existingEntry = cachedImages.value.get(duplicateId)
      existingEntry.lastUsed = Date.now()
      existingEntry.timestamp = Date.now()
      cachedImages.value.set(duplicateId, existingEntry)
      this.saveCache()
      return duplicateId // Return existing ID
    }

    // If cache is full, remove least recently used
    if (cachedImages.value.size >= this.MAX_CACHE_SIZE) {
      this.removeOldestImage()
    }

    cachedImages.value.set(id, {
      url,
      timestamp: Date.now(),
      lastUsed: Date.now(),
      size
    })
    this.saveCache()
    return id
  },

  // Remove oldest image from cache (LRU algorithm)
  removeOldestImage() {
    if (cachedImages.value.size === 0) return

    let oldestId = null
    let oldestTimestamp = Date.now()

    for (const [id, entry] of cachedImages.value.entries()) {
      if (entry.lastUsed < oldestTimestamp) {
        oldestTimestamp = entry.lastUsed
        oldestId = id
      }
    }

    if (oldestId) {
      cachedImages.value.delete(oldestId)
      console.log(`Removed oldest cached image: ${oldestId}`)
    }
  },

  // Get image from cache
  getFromCache(id) {
    const entry = cachedImages.value.get(id)
    if (entry) {
      entry.lastUsed = Date.now()
      cachedImages.value.set(id, entry)
      return entry.url
    }
    return null
  },

  // Remove specific image from cache
  removeFromCache(id) {
    cachedImages.value.delete(id)
    this.saveCache()
  },

  // Clear unused cache (not accessed in last 24 hours)
  clearUnusedCache() {
    const now = Date.now()
    const oneDayAgo = now - (24 * 60 * 60 * 1000)
    
    for (const [id, entry] of cachedImages.value.entries()) {
      if (entry.lastUsed < oneDayAgo) {
        cachedImages.value.delete(id)
      }
    }
    this.saveCache()
  },

  // Clear all cache
  clearAllCache() {
    cachedImages.value.clear()
    localStorage.removeItem(this.CACHE_KEY)
  },

  // Remove duplicate images by URL
  removeDuplicates() {
    const seenUrls = new Set()
    const duplicates = []

    for (const [id, entry] of cachedImages.value.entries()) {
      if (seenUrls.has(entry.url)) {
        duplicates.push(id)
      } else {
        seenUrls.add(entry.url)
      }
    }

    duplicates.forEach(id => {
      cachedImages.value.delete(id)
    })

    if (duplicates.length > 0) {
      this.saveCache()
    }

    return duplicates.length
  },

  // Preload images in background
  preloadImages(mediaItems) {
    mediaItems.forEach(item => {
      if (item.type === 'image') {
        // Check if already cached
        if (!this.isImageCached(item.url)) {
          const img = new Image()
          img.onload = () => {
            this.addToCache(item.id, item.url, item.size)
          }
          img.onerror = () => {
            console.warn(`Failed to preload image: ${item.url}`)
          }
          img.src = item.url
        }
      }
    })
  },

  // Check if image URL is already cached
  isImageCached(url) {
    for (const entry of cachedImages.value.values()) {
      if (entry.url === url) {
        return true
      }
    }
    return false
  }
}

// Initialize empty media library
const mediaLibrary = ref([])

// Load cache and initialize library on mount
onMounted(() => {
  imageCache.loadCache()
  loadMediaLibrary()
})

// Save cache when component unmounts
onUnmounted(() => {
  imageCache.saveCache()
})

// Load media from cache and any stored media
function loadMediaLibrary() {
  // Convert cache to media items, removing duplicates by URL
  const cachedItems = []
  const seenUrls = new Set()

  for (const [id, entry] of cachedImages.value.entries()) {
    if (!seenUrls.has(entry.url)) {
      cachedItems.push({
        id,
        name: `Cached Image ${id}`,
        url: entry.url,
        type: 'image',
        size: entry.size || 0,
        alt: 'Cached image',
        uploadedAt: new Date(entry.timestamp).toISOString(),
        uniqueId: `cache_${id}` // Unique ID for display
      })
      seenUrls.add(entry.url)
    }
  }

  // Then add any recently uploaded media (not in cache yet)
  const recentUploads = JSON.parse(localStorage.getItem('recent_uploads') || '[]')
  
  // Filter out recent uploads that are already in cache
  const newRecentUploads = recentUploads.filter(upload => {
    return !imageCache.isImageCached(upload.url)
  })

  mediaLibrary.value = [
    ...cachedItems,
    ...newRecentUploads
  ]

  // Preload all images in background
  imageCache.preloadImages(mediaLibrary.value)
}

// Computed properties
const uniqueCachedImages = computed(() => {
  const seenUrls = new Set()
  const unique = []

  for (const [id, entry] of cachedImages.value.entries()) {
    if (!seenUrls.has(entry.url)) {
      unique.push({ id, ...entry })
      seenUrls.add(entry.url)
    }
  }

  return unique
})

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

// Filter out duplicate images by URL for display
const filteredUniqueMedia = computed(() => {
  const seenUrls = new Set()
  const uniqueItems = []

  for (const item of filteredMedia.value) {
    if (!seenUrls.has(item.url)) {
      uniqueItems.push(item)
      seenUrls.add(item.url)
    }
  }

  return uniqueItems
})

const isSelected = (mediaId) => {
  return selectedMedia.value.some(media => media.id === mediaId)
}

const isCached = (mediaId) => {
  return cachedImages.value.has(mediaId)
}

const cacheSize = computed(() => {
  let size = 0
  for (const entry of cachedImages.value.values()) {
    size += entry.size || 0
  }
  return size
})

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

const insertSelectedMedia = () => {
  if (selectedMedia.value.length > 0) {
    if (selectedMedia.value.length === 1) {
      emit('media-selected', selectedMedia.value[0])
    }
    emit('multiple-media-selected', selectedMedia.value)
    handleClose()
  }
}

const handleClose = () => {
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

const cacheImage = (item) => {
  if (item.type === 'image') {
    // Prevent duplicates when caching
    const cachedId = imageCache.addToCache(item.id, item.url, item.size)
    
    // Update item ID if it was a duplicate
    if (cachedId !== item.id) {
      item.id = cachedId
    }
  }
}

const removeFromCache = (item) => {
  if (confirm('Remove this image from cache?')) {
    imageCache.removeFromCache(item.id)
    
    // Remove from media library
    const index = mediaLibrary.value.findIndex(media => media.id === item.id)
    if (index > -1) {
      mediaLibrary.value.splice(index, 1)
    }
    
    // Remove from selected media if selected
    const selectedIndex = selectedMedia.value.findIndex(media => media.id === item.id)
    if (selectedIndex > -1) {
      selectedMedia.value.splice(selectedIndex, 1)
    }
  }
}

const simulateUpload = (fileItem) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64Data = e.target.result
    
    // Check if this image already exists in cache
    if (imageCache.isImageCached(base64Data)) {
      fileItem.progress = 100
      alert('This image is already in your library.')
      
      // Remove from queue
      setTimeout(() => {
        uploadQueue.value = uploadQueue.value.filter(item => item.id !== fileItem.id)
      }, 500)
      return
    }
    
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      fileItem.progress = progress
      
      if (progress >= 100) {
        clearInterval(interval)
        
        const newMedia = {
          id: Date.now() + Math.random(),
          name: fileItem.name,
          url: base64Data,
          type: fileItem.type,
          size: fileItem.size,
          alt: fileItem.name.replace(/\.[^/.]+$/, ""),
          uploadedAt: new Date().toISOString(),
          file: fileItem.file
        }
        
        // Add to cache (preventing duplicates)
        imageCache.addToCache(newMedia.id, base64Data, fileItem.size)
        
        // Add to media library
        mediaLibrary.value.unshift(newMedia)
        completedUploads.value++
        
        // Auto-select the newly uploaded media
        selectedMedia.value.push(newMedia)
        
        // Save to recent uploads
        const recentUploads = JSON.parse(localStorage.getItem('recent_uploads') || '[]')
        recentUploads.unshift(newMedia)
        
        // Remove duplicates from recent uploads
        const uniqueUploads = []
        const seenUrls = new Set()
        for (const upload of recentUploads) {
          if (!seenUrls.has(upload.url)) {
            uniqueUploads.push(upload)
            seenUrls.add(upload.url)
          }
        }
        localStorage.setItem('recent_uploads', JSON.stringify(uniqueUploads.slice(0, 20))) // Keep last 20 unique
        
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

const clearUnusedCache = () => {
  imageCache.clearUnusedCache()
  loadMediaLibrary() // Reload library to reflect cache changes
}

const removeDuplicates = () => {
  const removedCount = imageCache.removeDuplicates()
  alert(`Removed ${removedCount} duplicate image(s) from cache.`)
  loadMediaLibrary()
}

const clearAllCache = () => {
  if (confirm('Clear all cached images? This cannot be undone.')) {
    imageCache.clearAllCache()
    mediaLibrary.value = [] // Clear the library
    showCacheManagement.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNmY3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzkwOWQ5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
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
  padding: 1rem;
  animation: fadeIn 0.15s ease-out;
}

.media-selector {
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.tab-button {
  position: relative;
  transition: color 0.2s ease;
}

.tab-button:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .media-selector {
    max-height: calc(100vh - 2rem);
  }
  
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .media-footer {
    padding: 1rem;
  }
  
  .media-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .media-actions button {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .media-header,
  .media-footer {
    padding: 0.75rem;
  }
  
  .media-content {
    padding: 0.75rem;
  }
  
  .media-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .media-actions button {
    width: 100%;
  }
  
  .upload-zone {
    padding: 1.5rem;
  }
}
</style>