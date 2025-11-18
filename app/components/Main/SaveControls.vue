<!--components/Main/SaveControls.vue-->
<template>
  <div class="save-controls">
    <div class="controls-left">
      <button
        v-if="!isNew"
        @click="$emit('preview')"
        class="btn-secondary"
      >
        Preview
      </button>
      
      <button
        v-if="hasDraft"
        @click="$emit('clear-draft')"
        class="btn-clear"
        title="Clear auto-saved draft"
      >
        Clear Draft
      </button>
    </div>
    
    <div class="controls-right">
      <button
        @click="$emit('cancel')"
        class="btn-cancel"
      >
        Cancel
      </button>
      
      <button
        v-if="status !== 'published'"
        @click="$emit('save-draft')"
        class="btn-secondary"
      >
        Save Draft
      </button>
      
      <button
        @click="$emit('save')"
        class="btn-save"
      >
        {{ saveButtonText }}
      </button>
      
      <button
        v-if="status !== 'published'"
        @click="$emit('publish')"
        class="btn-primary"
      >
        {{ publishButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  status: String,
  isNew: Boolean,
  hasDraft: Boolean
})

const emit = defineEmits(['save', 'save-draft', 'publish', 'preview', 'cancel', 'clear-draft'])

const saveButtonText = computed(() => {
  if (props.isNew) return 'Save Article'
  return 'Save Changes'
})

const publishButtonText = computed(() => {
  if (props.isNew) return 'Publish'
  return 'Update & Publish'
})
</script>

<style scoped>
.save-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.controls-left,
.controls-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-cancel {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-clear {
  background: none;
  border: 1px solid #f59e0b;
  color: #f59e0b;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-clear:hover {
  background: #fef3c7;
  color: #d97706;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-save {
  background: #059669;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-save:hover {
  background: #047857;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #2563eb;
}
</style>