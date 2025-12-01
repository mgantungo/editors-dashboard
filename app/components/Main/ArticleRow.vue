<!--components/Main/ArticleRow.vue-->
<template>
  <tr :class="['hover:bg-gray-50 transition-colors', selected ? 'bg-blue-50' : '']">
    <td class="px-4 py-3">
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('select', article.id)"
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
    </td>
    <td class="px-4 py-3">
      <div class="max-w-xs">
        <div class="font-medium text-gray-900 text-sm truncate">
          {{ article.title }}
        </div>
        <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
          <span
            v-for="tag in article.tags.slice(0, 2)"
            :key="tag"
            class="inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium"
          >
            {{ tag }}
          </span>
          <span v-if="article.tags.length > 2" class="text-gray-400 text-xs">
            +{{ article.tags.length - 2 }}
          </span>
        </div>
      </div>
    </td>
    <td class="px-4 py-3">
      <span 
        :class="[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          statusClasses[article.status] || 'bg-gray-100 text-gray-800'
        ]"
      >
        {{ article.status }}
      </span>
    </td>
    <td class="px-4 py-3 text-sm text-gray-900">
      {{ categoryName }}
    </td>
    <td class="px-4 py-3 text-sm text-gray-600 max-w-[200px]">
      <div class="truncate" :title="authorNames">
        {{ authorNames }}
      </div>
    </td>
    <td class="px-4 py-3 text-sm text-gray-500">
      {{ formattedDate }}
    </td>
    <td class="px-4 py-3">
      <span 
        :class="[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          article.live ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        ]"
      >
        {{ article.live ? 'Live' : 'Offline' }}
      </span>
    </td>
    <td class="px-4 py-3">
      <div class="flex items-center gap-1">
        <button
          @click="$emit('view', article)"
          class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="View"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </button>
        <button
          @click="$emit('edit', article)"
          class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Edit"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
        <button
          @click="$emit('preview', article)"
          class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
          title="Preview"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

// Import store to access authors
const editorStore = useEditorStore()
const { authors } = storeToRefs(editorStore)

const props = defineProps({
  article: Object,
  selected: Boolean,
  categories: Array
})

const emit = defineEmits(['select', 'edit', 'view', 'preview'])

const statusClasses = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  deleted: 'bg-gray-100 text-gray-800'
}

const categoryName = computed(() => {
  const category = props.categories?.find(cat => cat.id === props.article.category)
  return category?.name || 'Uncategorized'
})

const authorNames = computed(() => {
  if (!props.article.authors || !authors.value || props.article.authors.length === 0) {
    return 'No authors'
  }
  
  const names = props.article.authors.map(id => {
    const author = authors.value.find(a => a.id === id)
    return author?.name || 'Unknown Author'
  })
  
  return names.join(', ')
})

const formattedDate = computed(() => {
  if (!props.article.publishedAt) return '-'
  return new Date(props.article.publishedAt).toLocaleDateString()
})
</script>