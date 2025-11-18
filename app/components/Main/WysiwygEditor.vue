<!--components/Main/WysiwygEditor.vue-->
<template>
  <div class="wysiwyg-editor">
    <div class="editor-toolbar">
      <button @click="execCommand('bold')" :class="{ active: isActive('bold') }" title="Bold">
        <strong>B</strong>
      </button>
      <button @click="execCommand('italic')" :class="{ active: isActive('italic') }" title="Italic">
        <em>I</em>
      </button>
      <button @click="execCommand('underline')" :class="{ active: isActive('underline') }" title="Underline">
        <u>U</u>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <select @change="execCommand('formatBlock', false, $event.target.value)" title="Heading">
        <option value="p">Paragraph</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </select>
      
      <select @change="execCommand('fontSize', false, $event.target.value)" title="Font Size">
        <option value="1">Small</option>
        <option value="3" selected>Normal</option>
        <option value="5">Large</option>
        <option value="7">X-Large</option>
      </select>
      
      <div class="toolbar-divider"></div>
      
      <button @click="execCommand('justifyLeft')" title="Align Left">⫷</button>
      <button @click="execCommand('justifyCenter')" title="Align Center">⫸</button>
      <button @click="execCommand('justifyRight')" title="Align Right">⫹</button>
      
      <div class="toolbar-divider"></div>
      
      <button @click="execCommand('insertUnorderedList')" title="Bullet List">•</button>
      <button @click="execCommand('insertOrderedList')" title="Numbered List">1.</button>
      <button @click="execCommand('outdent')" title="Decrease Indent">←</button>
      <button @click="execCommand('indent')" title="Increase Indent">→</button>
      
      <div class="toolbar-divider"></div>
      
      <button @click="showLinkDialog = true" title="Insert Link">🔗</button>
      <button @click="insertTable" title="Insert Table">⧫</button>
      <button @click="insertHorizontalRule" title="Horizontal Line">―</button>
      
      <div class="toolbar-divider"></div>
      
      <button @click="showMediaSelector = true" title="Insert Media">🖼️</button>
      
      <div class="toolbar-divider"></div>
      
      <button @click="execCommand('undo')" title="Undo">↶</button>
      <button @click="execCommand('redo')" title="Redo">↷</button>
      
      <div class="toolbar-divider"></div>
      
      <button v-if="withEmoji" @click="showEmojiTray = !showEmojiTray" title="Insert Emoji">😊</button>
      <button @click="pastePlainText" title="Paste as Plain Text">📋</button>
    </div>

    <div
      ref="editorRef"
      class="editor-content"
      :contenteditable="!readonly"
      @input="handleInput"
      @blur="handleBlur"
      @paste="handlePaste"
      @keydown="handleKeyDown"
      @mouseup="saveSelection"
      @keyup="saveSelection"
    ></div>

    <!-- Emoji Tray -->
    <EmojiTray
      v-if="showEmojiTray && withEmoji"
      @emoji-selected="insertEmoji"
      @close="showEmojiTray = false"
    />

    <!-- Link Dialog -->
    <div v-if="showLinkDialog" class="dialog-overlay" @click.self="showLinkDialog = false">
      <div class="dialog">
        <h3>Insert Link</h3>
        <input v-model="linkUrl" placeholder="https://example.com" class="link-input" />
        <div class="dialog-actions">
          <button @click="insertLink" class="btn-primary">Insert</button>
          <button @click="showLinkDialog = false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Media Selector -->
    <MediaSelector
      v-if="showMediaSelector"
      @media-selected="insertMedia"
      @close="showMediaSelector = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  readonly: Boolean,
  compact: Boolean,
  withEmoji: Boolean
})

const emit = defineEmits(['update:modelValue', 'emoji-inserted'])

const editorRef = ref(null)
const internalValue = ref(props.modelValue || '')
const showEmojiTray = ref(false)
const showLinkDialog = ref(false)
const showMediaSelector = ref(false)
const linkUrl = ref('')
const lastSelection = ref(null)
const isInternalUpdate = ref(false)

// Save current cursor position
const saveSelection = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0 && editorRef.value.contains(selection.anchorNode)) {
    lastSelection.value = selection.getRangeAt(0)
  }
}

// Restore cursor position
const restoreSelection = () => {
  if (!lastSelection.value) return
  
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(lastSelection.value)
}

// Update content without losing cursor
const updateEditorContent = (content) => {
  if (!editorRef.value) return
  
  // Only update if content is different
  if (editorRef.value.innerHTML !== content) {
    isInternalUpdate.value = true
    saveSelection() // Save before updating
    
    editorRef.value.innerHTML = content
    
    nextTick(() => {
      restoreSelection() // Restore after update
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
  // Clean up HTML on blur
  cleanHTML()
}

const handlePaste = (event) => {
  // Allow default paste behavior, then clean
  setTimeout(() => {
    cleanHTML()
    handleInput()
  }, 0)
}

const handleKeyDown = (event) => {
  // Save selection on key events
  if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
    saveSelection()
  }
}

const execCommand = (command, showUI = false, value = null) => {
  if (!editorRef.value) return
  
  // Focus and restore selection before command
  editorRef.value.focus()
  restoreSelection()
  
  document.execCommand(command, showUI, value)
  
  // Save selection after command
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
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px;">Cell 1</td><td style="padding: 8px;">Cell 2</td></tr>
      <tr><td style="padding: 8px;">Cell 3</td><td style="padding: 8px;">Cell 4</td></tr>
    </table>
  `
  execCommand('insertHTML', false, tableHTML)
}

const insertHorizontalRule = () => {
  execCommand('insertHorizontalRule', false, null)
}

const insertMedia = (mediaItem) => {
  const imgHTML = `<img src="${mediaItem.url}" alt="${mediaItem.alt || ''}" style="max-width: 100%; height: auto;" />`
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
  
  // Basic sanitization - remove scripts, styles, etc.
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  html = html.replace(/on\w+="[^"]*"/g, '')
  html = html.replace(/on\w+='[^']*'/g, '')
  
  // Update only if changed
  if (html !== editorRef.value.innerHTML) {
    updateEditorContent(html)
  }
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== internalValue.value && !isInternalUpdate.value) {
    internalValue.value = newValue
    updateEditorContent(newValue || '')
  }
})

onMounted(() => {
  if (editorRef.value) {
    updateEditorContent(internalValue.value || '')
    
    // Set placeholder if empty
    if (!internalValue.value && props.placeholder) {
      editorRef.value.setAttribute('data-placeholder', props.placeholder)
    }
  }
})
</script>

<style scoped>
.wysiwyg-editor {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.editor-toolbar button,
.editor-toolbar select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
}

.editor-toolbar button:hover,
.editor-toolbar select:hover {
  background: #f3f4f6;
}

.editor-toolbar button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.toolbar-divider {
  width: 1px;
  background: #d1d5db;
  margin: 0 0.25rem;
}

.editor-content {
  min-height: 200px;
  max-height: 400px;
  padding: 1rem;
  outline: none;
  font-family: inherit;
  line-height: 1.6;
  overflow-y: auto;
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  color: #9ca3af;
}

.editor-content.compact {
  min-height: 100px;
  max-height: 200px;
}

.dialog-overlay {
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
}

.dialog {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  min-width: 400px;
}

.link-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin: 1rem 0;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

/* Improve editor content styling */
.editor-content h1,
.editor-content h2,
.editor-content h3,
.editor-content h4,
.editor-content h5,
.editor-content h6 {
  margin: 1em 0 0.5em 0;
  color: #1d3557;
}

.editor-content p {
  margin: 0.5em 0;
}

.editor-content ul,
.editor-content ol {
  margin: 0.5em 0;
  padding-left: 2em;
}

.editor-content a {
  color: #00b4d8;
  text-decoration: underline;
}

.editor-content table {
  margin: 1em 0;
  border-collapse: collapse;
  width: 100%;
}

.editor-content table td {
  padding: 8px;
  border: 1px solid #ddd;
}

@media (max-width: 768px) {
  .editor-toolbar {
    gap: 2px;
    padding: 8px;
  }
  
  .editor-toolbar button,
  .editor-toolbar select {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .dialog {
    min-width: 300px;
    margin: 1rem;
  }
}
</style>