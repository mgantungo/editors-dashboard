<!--components/Main/WysiwygEditor.vue-->
<template>
  <div class="wysiwyg-editor border border-gray-300 rounded-lg bg-white">
    <!-- Toolbar -->
    <div class="editor-toolbar flex flex-wrap gap-1 p-3 border-b border-gray-200 bg-gray-50">
      <!-- Text Formatting -->
      <button 
        @click="execCommand('bold')" 
        :class="{ 'bg-blue-500 text-white border-blue-500': isActive('bold') }"
        class="toolbar-btn"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button 
        @click="execCommand('italic')" 
        :class="{ 'bg-blue-500 text-white border-blue-500': isActive('italic') }"
        class="toolbar-btn"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button 
        @click="execCommand('underline')" 
        :class="{ 'bg-blue-500 text-white border-blue-500': isActive('underline') }"
        class="toolbar-btn"
        title="Underline"
      >
        <u>U</u>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Headings & Font Size -->
      <select 
        @change="execCommand('formatBlock', false, $event.target.value)" 
        class="toolbar-select"
        title="Heading"
      >
        <option value="p">Paragraph</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </select>
      
      <select 
        @change="execCommand('fontSize', false, $event.target.value)" 
        class="toolbar-select"
        title="Font Size"
      >
        <option value="1">Small</option>
        <option value="3" selected>Normal</option>
        <option value="5">Large</option>
        <option value="7">X-Large</option>
      </select>
      
      <div class="toolbar-divider"></div>
      
      <!-- Alignment -->
      <button @click="execCommand('justifyLeft')" class="toolbar-btn" title="Align Left">⫷</button>
      <button @click="execCommand('justifyCenter')" class="toolbar-btn" title="Align Center">⫸</button>
      <button @click="execCommand('justifyRight')" class="toolbar-btn" title="Align Right">⫹</button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Lists & Indentation -->
      <button @click="execCommand('insertUnorderedList')" class="toolbar-btn" title="Bullet List">•</button>
      <button @click="execCommand('insertOrderedList')" class="toolbar-btn" title="Numbered List">1.</button>
      <button @click="execCommand('outdent')" class="toolbar-btn" title="Decrease Indent">←</button>
      <button @click="execCommand('indent')" class="toolbar-btn" title="Increase Indent">→</button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Links & Tables -->
      <button @click="showLinkDialog = true" class="toolbar-btn" title="Insert Link">🔗</button>
      <button @click="insertTable" class="toolbar-btn" title="Insert Table">⧫</button>
      <button @click="insertHorizontalRule" class="toolbar-btn" title="Horizontal Line">―</button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Media - Only show if allowed -->
      <button 
        v-if="allowImages" 
        @click="showMediaSelector = true" 
        class="toolbar-btn"
        title="Insert Media"
      >
        🖼️
      </button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Undo/Redo -->
      <button @click="execCommand('undo')" class="toolbar-btn" title="Undo">↶</button>
      <button @click="execCommand('redo')" class="toolbar-btn" title="Redo">↷</button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Emoji & Paste -->
      <button 
        v-if="withEmoji" 
        @click="showEmojiTray = !showEmojiTray" 
        class="toolbar-btn"
        title="Insert Emoji"
      >
        😊
      </button>
      <button @click="pastePlainText" class="toolbar-btn" title="Paste as Plain Text">📋</button>
    </div>

    <!-- Editor Content -->
    <div
      ref="editorRef"
      class="editor-content"
      :class="[
        sizeClass,
        { 
          'readonly': readonly,
          'no-images': !allowImages 
        }
      ]"
      :contenteditable="!readonly"
      @input="handleInput"
      @blur="handleBlur"
      @paste="handlePaste"
      @keydown="handleKeyDown"
      @mouseup="saveSelection"
      @keyup="saveSelection"
      @click="handleEditorClick"
    ></div>

    <!-- Emoji Tray -->
    <EmojiTray
      v-if="showEmojiTray && withEmoji"
      @emoji-selected="insertEmoji"
      @close="showEmojiTray = false"
    />

    <!-- Link Dialog -->
    <div v-if="showLinkDialog" class="dialog-overlay" @click.self="showLinkDialog = false">
      <div class="dialog bg-white p-6 rounded-xl min-w-96">
        <h3 class="text-lg font-semibold mb-4">Insert Link</h3>
        <input 
          v-model="linkUrl" 
          placeholder="https://example.com" 
          class="link-input w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <div class="dialog-actions flex gap-3 justify-end">
          <button @click="insertLink" class="btn-primary">Insert</button>
          <button @click="showLinkDialog = false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Media Selector -->
    <MediaSelector
      v-if="showMediaSelector && allowImages"
      @media-selected="insertMedia"
      @close="showMediaSelector = false"
    />

    <!-- Image Controls -->
    <div v-if="selectedImage && showImageControls && allowImages" class="image-controls-overlay" @click.self="closeImageControls">
      <div class="image-controls-dialog bg-white rounded-xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="dialog-header flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h3 class="text-xl font-semibold">Image Controls</h3>
          <button @click="closeImageControls" class="close-btn text-2xl hover:bg-red-500 hover:text-white">×</button>
        </div>
        
        <div class="image-preview-section p-6 border-b border-gray-200 bg-gray-100">
          <div class="image-preview relative inline-block max-w-full">
            <img :src="selectedImage.src" ref="previewImage" alt="Preview" class="max-w-full max-h-48 block" />
            <canvas ref="previewCanvas" class="preview-canvas absolute top-0 left-0 border-2 border-dashed border-blue-500 pointer-events-none" :style="canvasStyle"></canvas>
          </div>
        </div>

        <div class="control-tabs flex border-b border-gray-200 bg-gray-50">
          <button 
            v-for="tab in controlTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="{ 
              'text-blue-500 border-b-2 border-blue-500 bg-white': activeTab === tab.id,
              'text-gray-500 border-b-2 border-transparent': activeTab !== tab.id
            }"
            class="tab-btn px-6 py-4 text-sm font-medium transition-all duration-200"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="control-content p-6 flex-grow overflow-y-auto">
          <!-- Resize Tab -->
          <div v-if="activeTab === 'resize'" class="control-group space-y-4">
            <div class="control-row flex items-center gap-4">
              <label class="w-24 font-medium text-gray-700">Width</label>
              <input 
                type="number" 
                v-model.number="imageControls.width" 
                @change="applyResize"
                min="1"
                class="control-input w-20 px-2 py-1 border border-gray-300 rounded"
              >
              <span class="text-gray-600">px</span>
            </div>
            <div class="control-row flex items-center gap-4">
              <label class="w-24 font-medium text-gray-700">Height</label>
              <input 
                type="number" 
                v-model.number="imageControls.height" 
                @change="applyResize"
                min="1"
                class="control-input w-20 px-2 py-1 border border-gray-300 rounded"
              >
              <span class="text-gray-600">px</span>
            </div>
            <div class="control-row flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  v-model="imageControls.maintainAspectRatio" 
                  @change="toggleAspectRatio"
                  class="rounded"
                >
                Maintain aspect ratio
              </label>
            </div>
            <div class="preset-sizes flex gap-2 mt-4">
              <button 
                v-for="size in presetSizes" 
                :key="size.name"
                @click="applyPresetSize(size)"
                class="preset-btn px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                {{ size.name }}
              </button>
            </div>
          </div>

          <!-- Crop Tab -->
          <div v-if="activeTab === 'crop'" class="control-group space-y-4">
            <div class="space-y-3">
              <div class="crop-controls flex items-center gap-3">
                <label class="w-20 font-medium text-gray-700">X Position</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.cropX" 
                  @input="applyCropPreview"
                  min="0"
                  :max="originalWidth"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-16">{{ imageControls.cropX }}px</span>
              </div>
              <div class="crop-controls flex items-center gap-3">
                <label class="w-20 font-medium text-gray-700">Y Position</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.cropY" 
                  @input="applyCropPreview"
                  min="0"
                  :max="originalHeight"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-16">{{ imageControls.cropY }}px</span>
              </div>
              <div class="crop-controls flex items-center gap-3">
                <label class="w-20 font-medium text-gray-700">Width</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.cropWidth" 
                  @input="applyCropPreview"
                  min="1"
                  :max="originalWidth"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-16">{{ imageControls.cropWidth }}px</span>
              </div>
              <div class="crop-controls flex items-center gap-3">
                <label class="w-20 font-medium text-gray-700">Height</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.cropHeight" 
                  @input="applyCropPreview"
                  min="1"
                  :max="originalHeight"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-16">{{ imageControls.cropHeight }}px</span>
              </div>
            </div>
            <button @click="applyCrop" class="btn-primary mt-4">Apply Crop</button>
          </div>

          <!-- Adjustments Tab -->
          <div v-if="activeTab === 'adjust'" class="control-group space-y-4">
            <div class="control-row flex items-center gap-4">
              <label class="w-24 font-medium text-gray-700">Brightness</label>
              <input 
                type="range" 
                v-model.number="imageControls.brightness" 
                @input="applyAdjustments"
                min="0"
                max="200"
                class="slider flex-grow"
              >
              <span class="text-gray-600 w-12">{{ imageControls.brightness }}%</span>
            </div>
            <div class="control-row flex items-center gap-4">
              <label class="w-24 font-medium text-gray-700">Contrast</label>
              <input 
                type="range" 
                v-model.number="imageControls.contrast" 
                @input="applyAdjustments"
                min="0"
                max="200"
                class="slider flex-grow"
              >
              <span class="text-gray-600 w-12">{{ imageControls.contrast }}%</span>
            </div>
            <div class="control-row flex items-center gap-4">
              <label class="w-24 font-medium text-gray-700">Saturation</label>
              <input 
                type="range" 
                v-model.number="imageControls.saturation" 
                @input="applyAdjustments"
                min="0"
                max="200"
                class="slider flex-grow"
              >
              <span class="text-gray-600 w-12">{{ imageControls.saturation }}%</span>
            </div>
            <button @click="resetAdjustments" class="btn-secondary">Reset Adjustments</button>
          </div>
        </div>

        <div class="dialog-actions flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button @click="applyAllChanges" class="btn-primary">Apply All</button>
          <button @click="resetImage" class="btn-secondary">Reset</button>
          <button @click="closeImageControls" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'

// Import components
import EmojiTray from './EmojiTray.vue'
import MediaSelector from './MediaSelector.vue'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  readonly: Boolean,
  compact: Boolean,
  withEmoji: Boolean,
  allowImages: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'emoji-inserted'])

// Refs
const editorRef = ref(null)
const previewImage = ref(null)
const previewCanvas = ref(null)
const selectedImage = ref(null)

// State
const internalValue = ref(props.modelValue || '')
const showEmojiTray = ref(false)
const showLinkDialog = ref(false)
const showMediaSelector = ref(false)
const showImageControls = ref(false)
const linkUrl = ref('')
const lastSelection = ref(null)
const isInternalUpdate = ref(false)
const activeTab = ref('resize')
const originalWidth = ref(0)
const originalHeight = ref(0)
const aspectRatio = ref(1)

// Image controls
const imageControls = ref({
  width: 0,
  height: 0,
  maintainAspectRatio: true,
  cropX: 0,
  cropY: 0,
  cropWidth: 0,
  cropHeight: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100
})

// Constants
const controlTabs = [
  { id: 'resize', label: 'Resize' },
  { id: 'crop', label: 'Crop' },
  { id: 'adjust', label: 'Adjust' }
]

const presetSizes = [
  { name: 'Small', width: 300, height: 200 },
  { name: 'Medium', width: 600, height: 400 },
  { name: 'Large', width: 800, height: 600 },
  { name: 'Original', width: 0, height: 0 }
]

// Computed
const sizeClass = computed(() => {
  if (props.compact) return 'compact'
  return props.size
})

const canvasStyle = computed(() => {
  if (!selectedImage.value) return {}
  return {
    width: `${imageControls.value.width}px`,
    height: `${imageControls.value.height}px`
  }
})

// Methods
const saveSelection = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0 && editorRef.value?.contains(selection.anchorNode)) {
    lastSelection.value = selection.getRangeAt(0)
  }
}

const restoreSelection = () => {
  if (!lastSelection.value) return
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(lastSelection.value)
}

const updateEditorContent = (content) => {
  if (!editorRef.value) return
  
  if (editorRef.value.innerHTML !== content) {
    isInternalUpdate.value = true
    saveSelection()
    editorRef.value.innerHTML = content
    nextTick(() => {
      restoreSelection()
      isInternalUpdate.value = false
    })
  }
}

const handleInput = () => {
  if (isInternalUpdate.value) return
  if (editorRef.value) {
    saveSelection()
    internalValue.value = editorRef.value.innerHTML
    emit('update:modelValue', internalValue.value)
  }
}

const handleBlur = () => {
  cleanHTML()
}

const handlePaste = (event) => {
  // Prevent image paste if not allowed
  if (!props.allowImages) {
    const items = event.clipboardData?.items
    if (items) {
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault()
          alert('Images are not allowed in this field')
          return
        }
      }
    }
  }
  
  setTimeout(() => {
    cleanHTML()
    handleInput()
  }, 0)
}

const handleKeyDown = (event) => {
  if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
    saveSelection()
  }
}

const handleEditorClick = (event) => {
  if (event.target.tagName === 'IMG' && props.allowImages) {
    openImageControls(event.target)
  }
}

const execCommand = (command, showUI = false, value = null) => {
  if (!editorRef.value) return
  editorRef.value.focus()
  restoreSelection()
  document.execCommand(command, showUI, value)
  saveSelection()
  handleInput()
}

const isActive = (command) => {
  return document.queryCommandState(command)
}

const insertEmoji = (emoji) => {
  if (!editorRef.value) return
  editorRef.value.focus()
  restoreSelection()
  execCommand('insertText', false, emoji)
  showEmojiTray.value = false
  emit('emoji-inserted', emoji)
}

const insertLink = () => {
  if (linkUrl.value) {
    execCommand('createLink', false, linkUrl.value)
  }
  showLinkDialog.value = false
  linkUrl.value = ''
}

const insertTable = () => {
  const tableHTML = `
    <table border="1" class="w-full border-collapse my-4">
      <tr><td class="p-2 border border-gray-300">Cell 1</td><td class="p-2 border border-gray-300">Cell 2</td></tr>
      <tr><td class="p-2 border border-gray-300">Cell 3</td><td class="p-2 border border-gray-300">Cell 4</td></tr>
    </table>
  `
  execCommand('insertHTML', false, tableHTML)
}

const insertHorizontalRule = () => {
  execCommand('insertHorizontalRule', false, null)
}

const insertMedia = (mediaItem) => {
  if (!props.allowImages) return
  
  const imgHTML = `<img src="${mediaItem.url}" alt="${mediaItem.alt || ''}" class="max-w-full h-auto" />`
  execCommand('insertHTML', false, imgHTML)
  showMediaSelector.value = false
}

const pastePlainText = () => {
  navigator.clipboard.readText().then(text => {
    execCommand('insertText', false, text)
  })
}

const cleanHTML = () => {
  if (!editorRef.value) return
  
  let html = editorRef.value.innerHTML
  
  // Remove scripts, styles, and event handlers
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  html = html.replace(/on\w+="[^"]*"/g, '')
  html = html.replace(/on\w+='[^']*'/g, '')
  
  // Remove images if not allowed
  if (!props.allowImages) {
    html = html.replace(/<img[^>]*>/gi, '')
  }
  
  if (html !== editorRef.value.innerHTML) {
    updateEditorContent(html)
  }
}

// Image Control Methods
const openImageControls = (imgElement) => {
  if (!props.allowImages) return
  
  selectedImage.value = imgElement
  showImageControls.value = true
  nextTick(() => {
    initializeImageData()
  })
}

const closeImageControls = () => {
  showImageControls.value = false
  selectedImage.value = null
  resetImageControls()
}

const initializeImageData = () => {
  if (!selectedImage.value) return

  const img = selectedImage.value
  originalWidth.value = img.naturalWidth || img.width
  originalHeight.value = img.naturalHeight || img.height
  aspectRatio.value = originalWidth.value / originalHeight.value

  imageControls.value = {
    width: img.width || originalWidth.value,
    height: img.height || originalHeight.value,
    maintainAspectRatio: true,
    cropX: 0,
    cropY: 0,
    cropWidth: originalWidth.value,
    cropHeight: originalHeight.value,
    brightness: 100,
    contrast: 100,
    saturation: 100
  }
}

const resetImageControls = () => {
  imageControls.value = {
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100
  }
}

const applyResize = () => {
  if (!selectedImage.value) return

  if (imageControls.value.maintainAspectRatio) {
    if (imageControls.value.width !== selectedImage.value.width) {
      imageControls.value.height = Math.round(imageControls.value.width / aspectRatio.value)
    } else if (imageControls.value.height !== selectedImage.value.height) {
      imageControls.value.width = Math.round(imageControls.value.height * aspectRatio.value)
    }
  }

  selectedImage.value.width = imageControls.value.width
  selectedImage.value.height = imageControls.value.height
}

const toggleAspectRatio = () => {
  if (imageControls.value.maintainAspectRatio) {
    aspectRatio.value = imageControls.value.width / imageControls.value.height
  }
}

const applyPresetSize = (size) => {
  if (size.name === 'Original') {
    imageControls.value.width = originalWidth.value
    imageControls.value.height = originalHeight.value
  } else {
    imageControls.value.width = size.width
    imageControls.value.height = size.height
  }
  applyResize()
}

const applyCropPreview = () => {
  // Preview logic would be implemented here
}

const applyCrop = async () => {
  if (!selectedImage.value || !previewCanvas.value) return

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  
  canvas.width = imageControls.value.cropWidth
  canvas.height = imageControls.value.cropHeight
  
  ctx.drawImage(
    selectedImage.value,
    imageControls.value.cropX,
    imageControls.value.cropY,
    imageControls.value.cropWidth,
    imageControls.value.cropHeight,
    0,
    0,
    imageControls.value.cropWidth,
    imageControls.value.cropHeight
  )

  const croppedDataUrl = canvas.toDataURL('image/png')
  selectedImage.value.src = croppedDataUrl
  selectedImage.value.width = imageControls.value.cropWidth
  selectedImage.value.height = imageControls.value.cropHeight
  
  imageControls.value.cropX = 0
  imageControls.value.cropY = 0
  imageControls.value.cropWidth = selectedImage.value.width
  imageControls.value.cropHeight = selectedImage.value.height
}

const applyAdjustments = () => {
  if (!selectedImage.value) return

  selectedImage.value.style.filter = `
    brightness(${imageControls.value.brightness}%)
    contrast(${imageControls.value.contrast}%)
    saturate(${imageControls.value.saturation}%)
  `
}

const resetAdjustments = () => {
  imageControls.value.brightness = 100
  imageControls.value.contrast = 100
  imageControls.value.saturation = 100
  selectedImage.value.style.filter = 'none'
}

const applyAllChanges = () => {
  closeImageControls()
}

const resetImage = () => {
  if (!selectedImage.value) return

  selectedImage.value.width = originalWidth.value
  selectedImage.value.height = originalHeight.value
  selectedImage.value.style.filter = 'none'
  selectedImage.value.src = selectedImage.value.src
  
  initializeImageData()
}

// Watchers & Lifecycle
watch(() => props.modelValue, (newValue) => {
  if (newValue !== internalValue.value && !isInternalUpdate.value) {
    internalValue.value = newValue
    updateEditorContent(newValue || '')
  }
})

onMounted(() => {
  if (editorRef.value) {
    updateEditorContent(internalValue.value || '')
    if (!internalValue.value && props.placeholder) {
      editorRef.value.setAttribute('data-placeholder', props.placeholder)
    }
  }
})
</script>

<style scoped>
.wysiwyg-editor {
  position: relative;
}

/* Toolbar Styles */
.toolbar-btn {
  @apply px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer text-sm font-medium transition-colors duration-200;
}

.toolbar-btn:hover {
  @apply bg-gray-50 border-gray-400;
}

.toolbar-select {
  @apply px-2 py-2 border border-gray-300 rounded bg-white cursor-pointer text-sm;
}

.toolbar-divider {
  @apply w-px bg-gray-300 mx-1;
}

/* Editor Content Styles */
.editor-content {
  @apply p-4 outline-none font-sans leading-relaxed overflow-y-auto;
}

.editor-content.small {
  @apply min-h-[100px] max-h-[200px];
}

.editor-content.medium {
  @apply min-h-[200px] max-h-[400px];
}

.editor-content.large {
  @apply min-h-[400px] max-h-[600px];
}

.editor-content.compact {
  @apply min-h-[100px] max-h-[200px];
}

.editor-content.readonly {
  @apply bg-gray-50 cursor-not-allowed;
}

.editor-content.no-images img {
  @apply hidden;
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  @apply text-gray-400;
}

/* Dialog Overlay */
.dialog-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

/* Button Styles */
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200;
}

.btn-cancel {
  @apply bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200;
}

/* Slider Styles */
.slider {
  @apply h-1.5 bg-gray-200 rounded appearance-none cursor-pointer;
}

.slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

.slider::-moz-range-thumb {
  @apply w-4 h-4 bg-blue-500 rounded-full cursor-pointer border-0;
}

/* Editor Content Styling */
.editor-content :deep(h1),
.editor-content :deep(h2),
.editor-content :deep(h3),
.editor-content :deep(h4),
.editor-content :deep(h5),
.editor-content :deep(h6) {
  @apply my-4 text-gray-800 font-semibold;
}

.editor-content :deep(h4) { @apply text-xl; }
.editor-content :deep(h5) { @apply text-lg; }
.editor-content :deep(h6) { @apply text-base; }

.editor-content :deep(p) {
  @apply my-2;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  @apply my-2 pl-6;
}

.editor-content :deep(ul) {
  @apply list-disc;
}

.editor-content :deep(ol) {
  @apply list-decimal;
}

.editor-content :deep(a) {
  @apply text-blue-500 underline;
}

.editor-content :deep(table) {
  @apply my-4 border-collapse w-full;
}

.editor-content :deep(table td) {
  @apply p-2 border border-gray-300;
}

/* Responsive */
@media (max-width: 768px) {
  .editor-toolbar {
    @apply gap-0.5 p-2;
  }
  
  .toolbar-btn,
  .toolbar-select {
    @apply px-2 py-1 text-xs;
  }
  
  .image-controls-dialog {
    @apply w-[95%] m-4;
  }
  
  .control-row {
    @apply flex-col items-stretch gap-2;
  }
  
  .dialog-actions {
    @apply flex-col;
  }
}
</style>