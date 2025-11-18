<!--components/Main/EditorStatusControls.vue-->
<template>
  <div class="status-controls">
    <div class="status-section">
      <label>Status *</label>
      <div class="status-options">
        <label
          v-for="option in statusOptions"
          :key="option.value"
          :class="['status-option', { active: status === option.value }]"
        >
          <input
            type="radio"
            :value="option.value"
            v-model="status"
            class="sr-only"
          />
          <span class="status-dot" :class="`dot-${option.value}`"></span>
          <span class="status-label">{{ option.label }}</span>
        </label>
      </div>
    </div>

    <div v-if="status === 'published'" class="publish-controls">
      <div class="form-group">
        <label>Date & Time Published *</label>
        <div class="datetime-inputs">
          <input
            type="date"
            v-model="datePart"
            class="date-input"
          />
          <input
            type="time"
            v-model="timePart"
            class="time-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="live" />
          <span>Live on Site</span>
        </label>
      </div>
    </div>

    <div v-if="status === 'deleted'" class="deleted-notice">
      <div class="notice-icon">⚠️</div>
      <p>This article has been deleted and is in read-only mode.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  status: String,
  publishedAt: String,
  live: Boolean
})

const emit = defineEmits([
  'update:status',
  'update:publishedAt', 
  'update:live'
])

const statusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'deleted', label: 'Deleted' }
]

const status = computed({
  get: () => props.status,
  set: (value) => emit('update:status', value)
})

const live = computed({
  get: () => props.live,
  set: (value) => emit('update:live', value)
})

const datePart = computed({
  get: () => props.publishedAt ? new Date(props.publishedAt).toISOString().split('T')[0] : '',
  set: (value) => updatePublishedAt(value, timePart.value)
})

const timePart = computed({
  get: () => props.publishedAt ? new Date(props.publishedAt).toTimeString().slice(0, 5) : '12:00',
  set: (value) => updatePublishedAt(datePart.value, value)
})

const updatePublishedAt = (date, time) => {
  if (date && time) {
    const datetime = new Date(`${date}T${time}`).toISOString()
    emit('update:publishedAt', datetime)
  }
}

// Set default published date if not set and status is published
watch(() => props.status, (newStatus) => {
  if (newStatus === 'published' && !props.publishedAt) {
    const now = new Date()
    emit('update:publishedAt', now.toISOString())
  }
})
</script>

<style scoped>
.status-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.status-section {
  margin-bottom: 1.5rem;
}

.status-section label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #374151;
}

.status-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-option:hover {
  border-color: #d1d5db;
}

.status-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.status-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.dot-published { background: #10b981; }
.dot-draft { background: #f59e0b; }
.dot-rejected { background: #ef4444; }
.dot-deleted { background: #6b7280; }

.status-label {
  font-weight: 500;
  color: #374151;
}

.publish-controls {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.datetime-inputs {
  display: flex;
  gap: 1rem;
}

.date-input,
.time-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.deleted-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
}

.notice-icon {
  font-size: 1.25rem;
}

.deleted-notice p {
  margin: 0;
  font-size: 0.875rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>