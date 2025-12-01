<!--components/Main/AlbumEditor.vue - Alternative with SortableJS-->
<template>
  <div class="album-editor">
    <div class="album-header">
      <button @click="addImage" class="add-image-btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
        + Add Image
      </button>
    </div>

    <div 
      v-if="album.length === 0"
      class="empty-album border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50"
      @click="addImage"
    >
      <div class="empty-icon text-4xl mb-4">🖼️</div>
      <p class="text-gray-700 font-medium">No images in album</p>
      <p class="empty-hint text-gray-500 mt-1">Click to add images</p>
    </div>

    <div 
      v-else
      ref="albumGrid"
      class="album-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="(image, index) in album"
        :key="image.id"
        class="album-item border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        :data-id="image.id"
      >
        <div class="album-item-header flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <span class="drag-handle cursor-move text-gray-400 hover:text-gray-600">⠿</span>
            <span class="item-number text-sm font-medium text-gray-700">#{{ index + 1 }}</span>
          </div>
          <button 
            @click="removeImage(image.id)" 
            class="remove-btn bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors duration-200"
          >
            ×
          </button>
        </div>
        
        <div class="image-preview h-40 bg-gray-100 overflow-hidden">
          <img 
            :src="image.url" 
            :alt="image.alt" 
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
        
        <div class="image-details p-4">
          <div class="form-group mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
            <input
              v-model="image.alt"
              placeholder="Describe the image..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="updateAlbum"
            />
          </div>

          <div class="form-group mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              v-model="image.caption"
              placeholder="Enter image caption..."
              rows="2"
              class="caption-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[60px]"
              @input="updateAlbum"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">Photo Credit</label>
            <input
              v-model="image.credit"
              placeholder="Taken by..."
              class="credit-input w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="updateAlbum"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Media Selector for adding images -->
    <MediaSelector
      v-if="showMediaSelector"
      @media-selected="handleMediaSelected"
      @close="showMediaSelector = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import Sortable from 'sortablejs'
import MediaSelector from './MediaSelector.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const album = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

const showMediaSelector = ref(false)
const albumGrid = ref(null)
let sortable = null

const addImage = () => {
  showMediaSelector.value = true
}

const removeImage = (imageId) => {
  album.value = album.value.filter(img => img.id !== imageId)
}

const handleMediaSelected = (mediaItem) => {
  const newImage = {
    id: Date.now() + Math.random(),
    url: mediaItem.url,
    alt: mediaItem.alt || mediaItem.name || 'Image',
    caption: mediaItem.caption || '',
    credit: mediaItem.credit || '',
    order: album.value.length
  }
  
  album.value = [...album.value, newImage]
  showMediaSelector.value = false
}

const updateAlbum = () => {
  // Force update when inputs change
  album.value = [...album.value]
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
}

// Initialize SortableJS
onMounted(() => {
  nextTick(() => {
    if (albumGrid.value) {
      sortable = Sortable.create(albumGrid.value, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.drag-handle',
        onEnd: (evt) => {
          const items = Array.from(albumGrid.value.children)
          const newAlbum = items.map(item => {
            const id = item.dataset.id
            return album.value.find(img => img.id == id)
          }).filter(Boolean)
          
          album.value = newAlbum.map((img, index) => ({
            ...img,
            order: index
          }))
        }
      })
    }
  })
})
</script>

<style scoped>
/* Drag and drop styles */
.sortable-ghost {
  opacity: 0.4;
  background: #c7d2fe;
}

.sortable-chosen {
  background: #e0e7ff;
  transform: rotate(2deg);
}

.sortable-drag {
  opacity: 0.9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.drag-handle {
  cursor: grab;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>