<!--components/Main/AlbumEditor.vue-->
<template>
  <div class="album-editor">
    <div class="album-header">
      <button @click="addImage" class="add-image-btn">
        + Add Image
      </button>
    </div>

    <div 
      v-if="album.length === 0"
      class="empty-album"
      @click="addImage"
    >
      <div class="empty-icon">🖼️</div>
      <p>No images in album</p>
      <p class="empty-hint">Click to add images</p>
    </div>

    <draggable
      v-else
      v-model="album"
      class="album-grid"
      item-key="id"
      @end="onDragEnd"
    >
      <template #item="{ element: image, index }">
        <div class="album-item">
          <div class="album-item-header">
            <span class="item-number">#{{ index + 1 }}</span>
            <button @click="removeImage(image.id)" class="remove-btn">×</button>
          </div>
          
          <div class="image-preview">
            <img :src="image.url" :alt="image.alt" />
          </div>
          
          <div class="image-details">
            <div class="form-group">
              <label>Caption</label>
              <textarea
                v-model="image.caption"
                placeholder="Enter image caption..."
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
      </template>
    </draggable>

    <!-- Media Selector for adding images -->
    <MediaSelector
      v-if="showMediaSelector"
      @media-selected="handleMediaSelected"
      @close="showMediaSelector = false"
    />
  </div>
</template>

<script setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'

const props = defineProps({
  modelValue: Array
})

const emit = defineEmits(['update:modelValue'])

const album = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

const showMediaSelector = ref(false)

const addImage = () => {
  showMediaSelector.value = true
}

const removeImage = (imageId) => {
  album.value = album.value.filter(img => img.id !== imageId)
}

const handleMediaSelected = (mediaItem) => {
  const newImage = {
    id: Date.now(),
    url: mediaItem.url,
    alt: mediaItem.alt,
    caption: '',
    credit: '',
    order: album.value.length
  }
  
  album.value = [...album.value, newImage]
  showMediaSelector.value = false
}

const onDragEnd = () => {
  // Update order after drag
  album.value = album.value.map((img, index) => ({
    ...img,
    order: index
  }))
}
</script>

<style scoped>
.album-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.album-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-image-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.empty-album {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-album:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-hint {
  color: #6b7280;
  margin: 0;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.album-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.album-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.item-number {
  font-weight: 600;
  color: #374151;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.image-preview {
  height: 150px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-details {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.caption-input,
.credit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.caption-input {
  resize: vertical;
  min-height: 60px;
}
</style>