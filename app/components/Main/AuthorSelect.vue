<!--components/Main/AuthorSelect.vue-->
<template>
  <div class="author-select">
    <div class="select-header">
      <button @click="showAddAuthorModal = true" class="add-author-btn">
        + Add Author
      </button>
    </div>
    
    <div class="selected-authors">
      <div
        v-for="author in selectedAuthors"
        :key="author.id"
        class="author-tag"
      >
        <span>{{ author.name }}</span>
        <button @click="removeAuthor(author)" class="remove-btn">×</button>
      </div>
    </div>

    <div class="dropdown" ref="dropdownRef">
      <input
        v-model="searchQuery"
        @focus="showDropdown = true"
        placeholder="Search authors..."
        class="search-input"
      />
      
      <div v-if="showDropdown" class="dropdown-list">
        <div
          v-for="author in filteredAuthors"
          :key="author.id"
          @click="selectAuthor(author)"
          class="dropdown-item"
        >
          <span>{{ author.name }}</span>
          <span v-if="isSelected(author)" class="selected-check">✓</span>
        </div>
        
        <div v-if="filteredAuthors.length === 0" class="no-results">
          No authors found
        </div>
      </div>
    </div>

    <!-- Add Author Modal -->
    <div v-if="showAddAuthorModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Add New Author</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="newAuthor.name" type="text" class="form-input" />
          </div>
          
          <div class="form-group">
            <label>Slug</label>
            <input v-model="newAuthor.slug" type="text" class="form-input" />
          </div>
          
          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="newAuthor.bio" class="form-textarea" rows="3"></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancel</button>
          <button @click="saveNewAuthor" class="btn-primary">Save Author</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import VueUse composable
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: Array,
  multiple: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedAuthors = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

const editorStore = useEditorStore()
const { authors } = storeToRefs(editorStore)

const showDropdown = ref(false)
const showAddAuthorModal = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)

const newAuthor = reactive({
  name: '',
  slug: '',
  bio: ''
})

const filteredAuthors = computed(() => {
  if (!authors.value) return []
  
  return authors.value.filter(author =>
    author.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectAuthor = (author) => {
  if (props.multiple) {
    if (!isSelected(author)) {
      selectedAuthors.value = [...selectedAuthors.value, author]
    }
  } else {
    selectedAuthors.value = [author]
  }
  searchQuery.value = ''
  showDropdown.value = false
}

const removeAuthor = (author) => {
  selectedAuthors.value = selectedAuthors.value.filter(a => a.id !== author.id)
}

const isSelected = (author) => {
  return selectedAuthors.value.some(a => a.id === author.id)
}

const saveNewAuthor = async () => {
  if (!newAuthor.name.trim()) return
  
  // Generate slug if not provided
  if (!newAuthor.slug) {
    newAuthor.slug = newAuthor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  }
  
  // In real app, call API to create author
  const createdAuthor = {
    id: Date.now(),
    ...newAuthor
  }
  
  authors.value.push(createdAuthor)
  selectAuthor(createdAuthor)
  closeModal()
}

const closeModal = () => {
  showAddAuthorModal.value = false
  newAuthor.name = ''
  newAuthor.slug = ''
  newAuthor.bio = ''
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  showDropdown.value = false
})
</script>

<style scoped>
.author-select {
  position: relative;
}

.select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.add-author-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.selected-authors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.author-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #e5e7eb;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-btn:hover {
  background: #d1d5db;
}

.dropdown {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.selected-check {
  color: #10b981;
  font-weight: bold;
}

.no-results {
  padding: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.modal-overlay {
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

.modal {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
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
</style>