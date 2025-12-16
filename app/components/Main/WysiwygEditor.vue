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
      <button @click="execCommand('justifyLeft')" class="toolbar-btn" title="Align Left">◀</button>
      <button @click="execCommand('justifyCenter')" class="toolbar-btn" title="Align Center">▣</button>
      <button @click="execCommand('justifyRight')" class="toolbar-btn" title="Align Right">▶</button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Lists & Indentation -->
      <button @click="execCommand('insertUnorderedList')" class="toolbar-btn" title="Bullet List">•</button>
      <button @click="execCommand('insertOrderedList')" class="toolbar-btn" title="Numbered List">1.</button>
      <button @click="execCommand('outdent')" class="toolbar-btn" title="Decrease Indent">◁</button>
      <button @click="execCommand('indent')" class="toolbar-btn" title="Increase Indent">▷</button>
      
      <div class="toolbar-divider"></div>
      
      <!-- Links & Tables -->
      <button @click="showLinkDialog = true" class="toolbar-btn" title="Insert Link">🔗</button>
      <button @click="insertTable" class="toolbar-btn" title="Insert Table">⬚</button>
      <button @click="insertHorizontalRule" class="toolbar-btn" title="Horizontal Line">—</button>
      
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
      @multiple-media-selected="insertMultipleMedia" 
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
                <span class="text-sm text-gray-600 w-12 text-right">{{ imageControls.cropX }}</span>
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
                <span class="text-sm text-gray-600 w-12 text-right">{{ imageControls.cropY }}</span>
              </div>
              <div class="crop-controls flex items-center gap-3">
                <label class="w-20 font-medium text-gray-700">Width</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.cropWidth" 
                  @input="applyCropPreview"
                  min="10"
                  :max="originalWidth"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-12 text-right">{{ imageControls.cropWidth }}</span>
              </div>
              <div class="crop-controls flex items-center gap-3">
                <label class="w-20 font-medium text-gray-700">Height</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.cropHeight" 
                  @input="applyCropPreview"
                  min="10"
                  :max="originalHeight"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-12 text-right">{{ imageControls.cropHeight }}</span>
              </div>
            </div>
            <button @click="applyCrop" class="btn-primary mt-4">Apply Crop</button>
          </div>

          <!-- Adjust Tab -->
          <div v-if="activeTab === 'adjust'" class="control-group space-y-4">
            <div class="adjust-controls space-y-3">
              <div class="flex items-center gap-3">
                <label class="w-24 font-medium text-gray-700">Brightness</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.brightness" 
                  @input="applyAdjustments"
                  min="0"
                  max="200"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-12 text-right">{{ imageControls.brightness }}%</span>
              </div>
              <div class="flex items-center gap-3">
                <label class="w-24 font-medium text-gray-700">Contrast</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.contrast" 
                  @input="applyAdjustments"
                  min="0"
                  max="200"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-12 text-right">{{ imageControls.contrast }}%</span>
              </div>
              <div class="flex items-center gap-3">
                <label class="w-24 font-medium text-gray-700">Saturation</label>
                <input 
                  type="range" 
                  v-model.number="imageControls.saturation" 
                  @input="applyAdjustments"
                  min="0"
                  max="200"
                  class="slider flex-grow"
                >
                <span class="text-sm text-gray-600 w-12 text-right">{{ imageControls.saturation }}%</span>
              </div>
            </div>
            <button @click="resetAdjustments" class="btn-secondary mt-4">Reset Adjustments</button>
          </div>
        </div>

        <div class="dialog-footer flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button @click="resetImage" class="btn-cancel">Reset All</button>
          <button @click="applyAllChanges" class="btn-primary">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import MediaSelector from './MediaSelector.vue'
import EmojiTray from './EmojiTray.vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'compact'].includes(value)
  },
  readonly: {
    type: Boolean,
    default: false
  },
  allowImages: {
    type: Boolean,
    default: true
  },
  withEmoji: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'emoji-inserted', 'inline-images-changed'])

// Refs
const editorRef = ref(null)
const internalValue = ref(props.modelValue || '')
const isInternalUpdate = ref(false)
const lastSelection = ref(null)
const showLinkDialog = ref(false)
const linkUrl = ref('')
const showMediaSelector = ref(false)
const showEmojiTray = ref(false)

// NEW: Track inline images
const inlineImages = ref([])

// Image Controls
const selectedImage = ref(null)
const showImageControls = ref(false)
const previewImage = ref(null)
const previewCanvas = ref(null)
const activeTab = ref('resize')
const originalWidth = ref(0)
const originalHeight = ref(0)

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

const controlTabs = [
  { id: 'resize', label: 'Resize' },
  { id: 'crop', label: 'Crop' },
  { id: 'adjust', label: 'Adjust' }
]

const presetSizes = [
  { name: 'Small', width: 300, height: null },
  { name: 'Medium', width: 600, height: null },
  { name: 'Large', width: 900, height: null },
  { name: 'Full', width: 1200, height: null }
]

// Computed
const sizeClass = computed(() => props.size)

const canvasStyle = computed(() => {
  if (!selectedImage.value) return {}
  return {
    width: `${imageControls.value.width}px`,
    height: `${imageControls.value.height}px`
  }
})

// NEW: Extract inline images from content
const extractInlineImages = (content) => {
      const images = []
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      const imgElements = tempDiv.querySelectorAll('img')
      
      imgElements.forEach((img, index) => {
        const src = img.getAttribute('src')
        
        // Check if it's a base64 data URL (needs to be uploaded)
        if (src && src.startsWith('data:image/')) {
          const dataUrlMatch = src.match(/^data:image\/(png|jpeg|jpg|gif|webp|bmp|svg\+xml);base64,(.+)$/)
          
          if (dataUrlMatch) {
            const [, format, base64Data] = dataUrlMatch
            
            // Use existing data-inline-id if it exists
            let imageId = img.getAttribute('data-inline-id')
            
            // If no data-inline-id exists, generate one
            if (!imageId) {
              const timestamp = Date.now()
              imageId = `inline-${timestamp}-${index}`
              
              // Add the data-inline-id to the img element in the actual editor
              if (editorRef.value) {
                const editorImgs = editorRef.value.querySelectorAll('img[src^="data:image/"]')
                if (editorImgs[index]) {
                  editorImgs[index].setAttribute('data-inline-id', imageId)
                }
              }
            }
            
            // Extract alt text for filename
            const alt = img.getAttribute('alt') || img.getAttribute('title') || `inline-image-${index + 1}`
            
            // Convert base64 to blob
            const byteCharacters = atob(base64Data)
            const byteArrays = []
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
              const slice = byteCharacters.slice(offset, offset + 512)
              const byteNumbers = new Array(slice.length)
              
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i)
              }
              
              const byteArray = new Uint8Array(byteNumbers)
              byteArrays.push(byteArray)
            }
            
            const blob = new Blob(byteArrays, { type: `image/${format}` })
            
            // Create a File object with sanitized filename
            const extension = format === 'svg+xml' ? 'svg' : format
            const sanitizedName = sanitizeFilename(alt)
            const filename = `${sanitizedName}-${Date.now()}.${extension}`
            const file = new File([blob], filename, { type: `image/${format}` })
            
            images.push({
              id: imageId,  // Use the existing or generated ID
              file: file,
              dataUrl: src,
              alt: alt,
              format: format,
              originalElement: img.outerHTML
            })
          }
        }
      })
      
      console.log('Inline images extracted:', images.length)
      console.log('Image IDs:', images.map(img => img.id))
      return images
    }

// NEW: Sanitize filename to be server-friendly
const sanitizeFilename = (filename) => {
  if (!filename) return 'image'
  
  return filename
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9\-]+/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, '') // Remove trailing hyphens
    .substring(0, 50) // Limit length
    || 'image'
}

// NEW: Update inline images URLs after upload
const updateInlineImagesUrls = (uploadedImages) => {
  if (!editorRef.value || !uploadedImages || uploadedImages.length === 0) return
  
  let content = editorRef.value.innerHTML
  
  uploadedImages.forEach(uploaded => {
    // Find the image by data-inline-id
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    
    const img = tempDiv.querySelector(`img[data-inline-id="${uploaded.id}"]`)
    if (img) {
      // Replace the data URL with the server URL
      img.setAttribute('src', uploaded.url)
      // Remove the tracking attribute
      img.removeAttribute('data-inline-id')
    }
    
    content = tempDiv.innerHTML
  })
  
  // Update the editor content
  updateEditorContent(content)
}

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
    
    // NEW: Check for and remove blob URLs before processing
    const images = editorRef.value.querySelectorAll('img[src^="blob:"]')
    if (images.length > 0) {
      console.warn('Detected blob URLs in content - this should not happen!')
      images.forEach(img => {
        console.warn('Removing blob URL image:', img.src)
        img.remove()
      })
    }
    
    internalValue.value = editorRef.value.innerHTML
    
    // NEW: Extract and emit inline images
    const extractedImages = extractInlineImages(internalValue.value)
    inlineImages.value = extractedImages
    emit('inline-images-changed', extractedImages)
    
    emit('update:modelValue', internalValue.value)
  }
}

const handleBlur = () => {
  cleanHTML()
}

const handlePaste = async (event) => {
  console.log('🔍 PASTE EVENT TRIGGERED')
  console.log('Clipboard data:', event.clipboardData)
  
  const items = event.clipboardData?.items
  
  if (!items) {
    console.log('❌ No clipboard items')
    setTimeout(() => {
      cleanHTML()
      handleInput()
    }, 0)
    return
  }
  
  console.log('📋 Clipboard items count:', items.length)
  
  // Check if there's an image in the clipboard
  let hasImage = false
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    console.log(`Item ${i}: type=${item.type}, kind=${item.kind}`)
    if (item.type.indexOf('image') !== -1) {
      hasImage = true
      break
    }
  }
  
  console.log('📷 Has image:', hasImage)
  
  // If there's an image, handle it specially
  if (hasImage) {
    console.log('🚫 PREVENTING DEFAULT for image paste')
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    
    if (!props.allowImages) {
      alert('Images are not allowed in this field')
      return
    }
    
    // Process the image
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        console.log('📥 Getting image file from clipboard')
        const file = item.getAsFile()
        console.log('File:', file)
        
        if (file) {
          console.log('✅ Converting to base64...')
          const reader = new FileReader()
          reader.onload = (e) => {
            const base64Data = e.target.result
            console.log('✅ Base64 conversion complete, length:', base64Data.length)
            
            // Generate filename from alt or timestamp
            const timestamp = Date.now()
            const extension = file.type.split('/')[1] || 'png'
            const filename = `pasted-image-${timestamp}.${extension}`
            console.log('📝 Filename:', filename)
            
            // Save current selection
            saveSelection()
            
            // Insert image at cursor position
            const img = document.createElement('img')
            img.src = base64Data
            img.alt = filename.replace(/\.[^/.]+$/, '')
            img.className = 'max-w-full h-auto my-2'
            
            console.log('✅ Image element created:', img)
            
            // Insert into editor
            if (lastSelection.value) {
              restoreSelection()
              const range = lastSelection.value
              range.deleteContents()
              range.insertNode(img)
              
              // Move cursor after image
              range.setStartAfter(img)
              range.collapse(true)
              
              const selection = window.getSelection()
              selection.removeAllRanges()
              selection.addRange(range)
              
              console.log('✅ Image inserted at cursor position')
            } else {
              editorRef.value.appendChild(img)
              console.log('✅ Image appended to editor')
            }
            
            // Trigger input to extract the image
            console.log('🔄 Triggering handleInput...')
            nextTick(() => {
              handleInput()
            })
          }
          
          reader.onerror = (error) => {
            console.error('❌ FileReader error:', error)
          }
          
          reader.readAsDataURL(file)
        } else {
          console.error('❌ Could not get file from clipboard item')
        }
        break
      }
    }
  } else {
    console.log('ℹ️ No image, allowing default paste')
    setTimeout(() => {
      cleanHTML()
      handleInput()
    }, 0)
  }
}

const handleDrop = async (event) => {
  console.log('🔍 DROP EVENT TRIGGERED')
  console.log('Drop data:', event.dataTransfer)
  
  const items = event.dataTransfer?.items || event.dataTransfer?.files
  
  if (!items) {
    console.log('❌ No drop items')
    return
  }
  
  console.log('📦 Drop items count:', items.length)
  
  // Check if there's an image being dropped
  let hasImage = false
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const itemType = item.type || (item.kind === 'file' ? 'file' : '')
    console.log(`Drop item ${i}: type=${itemType}, kind=${item.kind}`)
    if (itemType.indexOf('image') !== -1) {
      hasImage = true
      break
    }
  }
  
  console.log('📷 Has image in drop:', hasImage)
  
  if (hasImage) {
    console.log('🚫 PREVENTING DEFAULT for image drop')
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    
    if (!props.allowImages) {
      alert('Images are not allowed in this field')
      return
    }
    
    // Process the image
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemType = item.type || (item.kind === 'file' ? 'file' : '')
      
      if (itemType.indexOf('image') !== -1) {
        console.log('📥 Getting image file from drop')
        const file = item.getAsFile ? item.getAsFile() : item
        console.log('Dropped file:', file)
        
        if (file) {
          console.log('✅ Converting dropped image to base64...')
          const reader = new FileReader()
          reader.onload = (e) => {
            const base64Data = e.target.result
            console.log('✅ Base64 conversion complete, length:', base64Data.length)
            
            // Generate filename
            const timestamp = Date.now()
            const extension = file.type.split('/')[1] || 'png'
            const filename = `dropped-image-${timestamp}.${extension}`
            console.log('📝 Filename:', filename)
            
            // Insert image at drop position
            const img = document.createElement('img')
            img.src = base64Data
            img.alt = filename.replace(/\.[^/.]+$/, '')
            img.className = 'max-w-full h-auto my-2'
            
            console.log('✅ Image element created for drop:', img)
            
            // Try to get drop position
            let inserted = false
            if (document.caretRangeFromPoint) {
              const range = document.caretRangeFromPoint(event.clientX, event.clientY)
              if (range && editorRef.value.contains(range.startContainer)) {
                range.insertNode(img)
                range.setStartAfter(img)
                range.collapse(true)
                
                const selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
                inserted = true
                console.log('✅ Image inserted at drop position')
              }
            }
            
            if (!inserted) {
              editorRef.value.appendChild(img)
              console.log('✅ Image appended to editor (fallback)')
            }
            
            // Trigger input to extract the image
            console.log('🔄 Triggering handleInput after drop...')
            nextTick(() => {
              handleInput()
            })
          }
          
          reader.onerror = (error) => {
            console.error('❌ FileReader error on drop:', error)
          }
          
          reader.readAsDataURL(file)
        } else {
          console.error('❌ Could not get file from drop item')
        }
        break
      }
    }
  }
}

const handleDragOver = (event) => {
  // Prevent default to allow drop
  if (props.allowImages) {
    event.preventDefault()
  }
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
  if (!linkUrl.value) return
  
  restoreSelection()
  
  const selection = window.getSelection()
  const selectedText = selection.toString()
  
  if (selectedText) {
    execCommand('createLink', false, linkUrl.value)
  } else {
    const link = document.createElement('a')
    link.href = linkUrl.value
    link.textContent = linkUrl.value
    link.target = '_blank'
    
    const range = selection.getRangeAt(0)
    range.insertNode(link)
    
    range.setStartAfter(link)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  linkUrl.value = ''
  showLinkDialog.value = false
  handleInput()
}

const insertTable = () => {
  if (!editorRef.value) return
  
  const table = document.createElement('table')
  table.className = 'border-collapse w-full my-4'
  
  for (let i = 0; i < 3; i++) {
    const row = table.insertRow()
    for (let j = 0; j < 3; j++) {
      const cell = row.insertCell()
      cell.className = 'p-2 border border-gray-300'
      cell.textContent = ' '
    }
  }
  
  restoreSelection()
  const range = window.getSelection().getRangeAt(0)
  range.insertNode(table)
  
  range.setStartAfter(table)
  range.collapse(true)
  
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  
  handleInput()
}

const insertHorizontalRule = () => {
  execCommand('insertHorizontalRule')
}

const insertMultipleMedia = (selectedMedia) => {
  if (!editorRef.value || !selectedMedia || selectedMedia.length === 0) return
  
  restoreSelection()
  const range = window.getSelection().getRangeAt(0)
  
  selectedMedia.forEach((media, index) => {
    const img = document.createElement('img')
    img.src = media.url
    img.alt = media.alt || media.name || 'Image'
    img.className = 'max-w-full h-auto my-2'
    
    range.insertNode(img)
    
    if (index < selectedMedia.length - 1) {
      const br = document.createElement('br')
      range.setStartAfter(img)
      range.insertNode(br)
      range.setStartAfter(br)
    } else {
      range.setStartAfter(img)
    }
  })
  
  range.collapse(true)
  
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  
  showMediaSelector.value = false
  handleInput()
}

const pastePlainText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      restoreSelection()
      execCommand('insertText', false, text)
    }
  } catch (err) {
    console.error('Failed to read clipboard:', err)
  }
}

const cleanHTML = () => {
  if (!editorRef.value) return
  
  const content = editorRef.value.innerHTML
  const cleaned = content
    .replace(/<div>/g, '<p>')
    .replace(/<\/div>/g, '</p>')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p>')
  
  if (cleaned !== content) {
    updateEditorContent(cleaned)
  }
}

// Image Control Methods
const openImageControls = (img) => {
  selectedImage.value = img
  originalWidth.value = img.naturalWidth || img.width
  originalHeight.value = img.naturalHeight || img.height
  
  initializeImageData()
  showImageControls.value = true
}

const closeImageControls = () => {
  showImageControls.value = false
  selectedImage.value = null
}

const initializeImageData = () => {
  if (!selectedImage.value) return
  
  imageControls.value.width = selectedImage.value.width
  imageControls.value.height = selectedImage.value.height
  imageControls.value.cropX = 0
  imageControls.value.cropY = 0
  imageControls.value.cropWidth = selectedImage.value.width
  imageControls.value.cropHeight = selectedImage.value.height
  imageControls.value.brightness = 100
  imageControls.value.contrast = 100
  imageControls.value.saturation = 100
}

const toggleAspectRatio = () => {
  if (imageControls.value.maintainAspectRatio) {
    applyResize()
  }
}

const applyResize = () => {
  if (!selectedImage.value) return
  
  if (imageControls.value.maintainAspectRatio) {
    const aspectRatio = originalWidth.value / originalHeight.value
    
    if (imageControls.value.width !== selectedImage.value.width) {
      imageControls.value.height = Math.round(imageControls.value.width / aspectRatio)
    } else if (imageControls.value.height !== selectedImage.value.height) {
      imageControls.value.width = Math.round(imageControls.value.height * aspectRatio)
    }
  }
  
  selectedImage.value.width = imageControls.value.width
  selectedImage.value.height = imageControls.value.height
}

const applyPresetSize = (size) => {
  if (!selectedImage.value) return
  
  const aspectRatio = originalWidth.value / originalHeight.value
  imageControls.value.width = size.width
  imageControls.value.height = size.height || Math.round(size.width / aspectRatio)
  
  applyResize()
}

const applyCropPreview = () => {
  if (!previewCanvas.value || !selectedImage.value) return
  
  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  
  canvas.width = imageControls.value.cropWidth
  canvas.height = imageControls.value.cropHeight
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
}

const applyCrop = () => {
  if (!selectedImage.value) return
  
  const canvas = document.createElement('canvas')
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

// NEW: Expose method to get inline images
const getInlineImages = () => {
  return inlineImages.value
}

// Expose method to parent components
defineExpose({
  getInlineImages,
  updateInlineImagesUrls
})

// Watchers & Lifecycle
watch(() => props.modelValue, (newValue) => {
  if (newValue !== internalValue.value && !isInternalUpdate.value) {
    internalValue.value = newValue
    updateEditorContent(newValue || '')
    
    // Extract inline images when content loads
    const extractedImages = extractInlineImages(newValue || '')
    inlineImages.value = extractedImages
    emit('inline-images-changed', extractedImages)
  }
})

onMounted(() => {
  if (editorRef.value) {
    updateEditorContent(internalValue.value || '')
    if (!internalValue.value && props.placeholder) {
      editorRef.value.setAttribute('data-placeholder', props.placeholder)
    }
    
    // Extract inline images on mount
    const extractedImages = extractInlineImages(internalValue.value || '')
    inlineImages.value = extractedImages
    if (extractedImages.length > 0) {
      emit('inline-images-changed', extractedImages)
    }
    
    // NEW: Use beforeinput event which fires BEFORE paste
    const handleBeforeInput = (event) => {
      console.log('⚡ BEFOREINPUT EVENT:', event.inputType, event)
      
      if (event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop') {
        const dataTransfer = event.dataTransfer
        if (dataTransfer && dataTransfer.items) {
          for (let i = 0; i < dataTransfer.items.length; i++) {
            const item = dataTransfer.items[i]
            console.log(`beforeinput item ${i}:`, item.type, item.kind)
            if (item.type.indexOf('image') !== -1) {
              console.log('🚫 PREVENTING DEFAULT in beforeinput for image')
              event.preventDefault()
              
              if (!props.allowImages) {
                alert('Images are not allowed in this field')
                return
              }
              
              // Handle the image
              const file = item.getAsFile()
              if (file) {
                console.log('✅ Got file from beforeinput, converting to base64...')
                const reader = new FileReader()
                reader.onload = (e) => {
                  const base64Data = e.target.result
                  console.log('✅ Base64 ready, inserting...')
                  
                  const timestamp = Date.now()
                  const extension = file.type.split('/')[1] || 'png'
                  const filename = `pasted-image-${timestamp}.${extension}`
                  
                  const img = document.createElement('img')
                  img.src = base64Data
                  img.alt = filename.replace(/\.[^/.]+$/, '')
                  img.className = 'max-w-full h-auto my-2'
                  
                  const selection = window.getSelection()
                  if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0)
                    range.deleteContents()
                    range.insertNode(img)
                    range.setStartAfter(img)
                    range.collapse(true)
                    selection.removeAllRanges()
                    selection.addRange(range)
                  } else {
                    editorRef.value.appendChild(img)
                  }
                  
                  nextTick(() => {
                    handleInput()
                  })
                }
                reader.readAsDataURL(file)
              }
              return
            }
          }
        }
      }
    }
    
    // CRITICAL: Attach beforeinput FIRST (highest priority)
    console.log('🔧 Attaching beforeinput event listener...')
    editorRef.value.addEventListener('beforeinput', handleBeforeInput, { capture: true })
    
    // CRITICAL: Directly attach paste and drop handlers with capture phase
    console.log('🔧 Attaching paste and drop event listeners directly...')
    editorRef.value.addEventListener('paste', handlePaste, { capture: true })
    editorRef.value.addEventListener('drop', handleDrop, { capture: true })
    editorRef.value.addEventListener('dragover', handleDragOver, false)
    console.log('✅ Event listeners attached successfully')
    console.log('📋 Paste handler:', handlePaste)
    console.log('📦 Drop handler:', handleDrop)
  }
})

onBeforeUnmount(() => {
  if (editorRef.value) {
    console.log('🧹 Cleaning up event listeners...')
    editorRef.value.removeEventListener('paste', handlePaste, { capture: true })
    editorRef.value.removeEventListener('drop', handleDrop, { capture: true })
    editorRef.value.removeEventListener('dragover', handleDragOver, false)
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