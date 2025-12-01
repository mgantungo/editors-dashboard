<!--components/Main/SaveControls.vue-->
<template>
  <div class="save-controls bg-gray-50 border-t border-gray-200 p-4">
    <div class="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
      <!-- Row 1: Two buttons -->
      <button
        v-if="!isNew"
        @click="$emit('preview')"
        class="bg-gray-600 text-white border-none px-4 py-2 rounded cursor-pointer font-medium hover:bg-gray-700 transition-colors"
      >
        Preview
      </button>
      
      <button
        v-if="hasDraft"
        @click="$emit('clear-draft')"
        class="bg-transparent border border-amber-500 text-amber-500 px-4 py-2 rounded cursor-pointer font-medium hover:bg-amber-50 hover:text-amber-600 transition-colors"
        title="Clear auto-saved draft"
      >
        Clear Draft
      </button>

      <!-- Row 2: Two buttons -->
      <button
        @click="$emit('cancel')"
        class="bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded cursor-pointer font-medium hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
      
      <button
        v-if="status !== 'published'"
        @click="$emit('save-draft')"
        class="bg-gray-600 text-white border-none px-4 py-2 rounded cursor-pointer font-medium hover:bg-gray-700 transition-colors"
      >
        Save Draft
      </button>

      <!-- Row 3: Single full-width button -->
      <button
        @click="$emit('save')"
        class="bg-emerald-600 text-white border-none px-4 py-2 rounded cursor-pointer font-medium hover:bg-emerald-700 transition-colors col-span-2"
      >
        {{ saveButtonText }}
      </button>

      <!-- Row 4: Single full-width button -->
      <button
        v-if="status !== 'published'"
        @click="$emit('publish')"
        class="bg-blue-500 text-white border-none px-4 py-2 rounded cursor-pointer font-medium hover:bg-blue-600 transition-colors col-span-2"
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