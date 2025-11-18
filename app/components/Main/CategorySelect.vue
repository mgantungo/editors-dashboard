<!--components/Main/CategorySelect.vue-->
<template>
  <div class="category-select">
    <label v-if="label">{{ label }}</label>
    <select 
      v-model="selectedCategory" 
      class="category-dropdown"
      :class="{ 'has-value': selectedCategory }"
    >
      <option v-if="nullable" :value="null">
        {{ placeholder || 'Select category...' }}
      </option>
      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>
    
    <div v-if="selectedCategoryName" class="selected-category">
      Selected: <strong>{{ selectedCategoryName }}</strong>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: [String, Number],
  label: String,
  nullable: {
    type: Boolean,
    default: false
  },
  placeholder: String
})

const emit = defineEmits(['update:modelValue'])

const editorStore = useEditorStore()
const { categories } = storeToRefs(editorStore)

const selectedCategory = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return null
  const category = categories.value.find(cat => cat.id === selectedCategory.value)
  return category?.name || null
})
</script>

<style scoped>
.category-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-select label {
  font-weight: 600;
  color: #374151;
}

.category-dropdown {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.875rem;
}

.category-dropdown.has-value {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.selected-category {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}
</style>