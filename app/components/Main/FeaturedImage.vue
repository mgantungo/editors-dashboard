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
        <p>Click to select featured image</p>
        <p class="upload-hint">or drag and drop</p>
      </div>
    </div>

    <div v-else class="image-preview">
      <div class="preview-container">
        <img :src="image.url" :alt="image.alt" class="preview-image" />
        <button @click="removeImage" class="remove-image-btn" title="Remove image">
          ×
        </button>
      </div>
      
      <div class="image-details">
        <div class="form-group">
          <label>Alt Text</label>
          <input
            v-model="image.alt"
            placeholder="Describe the image..."
            class="alt-input"
          />
        </div>
        
        <div class="form-group">
          <label>Caption</label>
          <textarea
            v-model="image.caption"
            placeholder="Image caption..."
            rows="2"
            class="caption-input"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Photo Credit</label>
          <input
            v-model="image.credit"
            placeholder="Taken by..."
            class="credit-input"
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
    caption: '',
    credit: '',
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
    // Handle file upload
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

.featured-image label {
  font-weight: 600;
  color: #374151;
}

.image-upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-upload-zone:hover,
.image-upload-zone.drag-over {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2rem;
}

.upload-hint {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.image-preview {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.preview-container {
  position: relative;
  background: #f9fafb;
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.remove-image-btn:hover {
  background: #dc2626;
}

.image-details {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.alt-input,
.caption-input,
.credit-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.caption-input {
  resize: vertical;
  min-height: 60px;
}
</style>