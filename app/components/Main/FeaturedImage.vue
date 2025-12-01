<!--components/Main/FeaturedImage.vue-->
<template>
  <div class="featured-image">    
    <div
      v-if="!image"
      class="image-upload-zone"
      :class="{ 'drag-over': isDragOver }"
      @click="openMediaSelector"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="isDragOver = false"
    >
      <div class="upload-content">
        <div class="upload-icon">🖼️</div>
        <p class="upload-text">Click to select featured image</p>
        <p class="upload-hint">or drag and drop</p>
      </div>
    </div>

    <div v-else class="image-preview border border-gray-200 rounded-xl overflow-hidden">
      <div class="preview-container relative bg-gray-50">
        <img :src="image.url" :alt="image.alt" class="preview-image w-full h-48 object-cover" />
        <button @click="removeImage" class="remove-image-btn" title="Remove image">
          ×
        </button>
      </div>
      
      <div class="image-details p-6">
        <div class="form-group mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
          <input
            v-model="image.alt"
            placeholder="Describe the image..."
            class="alt-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div class="form-group mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Caption</label>
          <textarea
            v-model="image.caption"
            placeholder="Image caption..."
            rows="2"
            class="caption-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[60px]"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">Photo Credit</label>
          <input
            v-model="image.credit"
            placeholder="Taken by..."
            class="credit-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <MediaSelector
      v-if="showMediaSelector"
      @media-selected="handleMediaSelected"
      @close="showMediaSelector = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MediaSelector from './MediaSelector.vue'

const props = defineProps({
  modelValue: Object
})

const emit = defineEmits(['update:modelValue'])

const image = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showMediaSelector = ref(false)
const isDragOver = ref(false)

const openMediaSelector = () => {
  showMediaSelector.value = true
}

const handleMediaSelected = (mediaItem) => {
  image.value = {
    url: mediaItem.url,
    alt: mediaItem.alt || '',
    caption: mediaItem.caption || '',
    credit: mediaItem.credit || '',
    uploadedAt: new Date().toISOString()
  }
  showMediaSelector.value = false
}

const removeImage = () => {
  image.value = null
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    const file = files[0]
    const objectUrl = URL.createObjectURL(file)
    
    image.value = {
      url: objectUrl,
      alt: file.name,
      caption: '',
      credit: '',
      uploadedAt: new Date().toISOString(),
      file: file
    }
  }
}
</script>

<style scoped>
.featured-image {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-upload-zone {
  @apply border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-200;
}

.image-upload-zone:hover,
.image-upload-zone.drag-over {
  @apply border-blue-500 bg-blue-50;
}

.upload-content {
  @apply flex flex-col items-center gap-2;
}

.upload-icon {
  @apply text-3xl;
}

.upload-text {
  @apply text-gray-700 font-medium;
}

.upload-hint {
  @apply text-gray-500 text-sm m-0;
}

.remove-image-btn {
  @apply absolute top-2 right-2 bg-red-500 bg-opacity-90 text-white border-none w-8 h-8 rounded-full cursor-pointer flex items-center justify-center text-xl transition-colors duration-200;
}

.remove-image-btn:hover {
  @apply bg-red-600 bg-opacity-100;
}
</style>