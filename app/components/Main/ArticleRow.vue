<!--components/Main/AlbumEditor.vue-->
<template>
  <tr 
    :class="['article-row', rowClass]"
    @click="handleRowClick"
  >
    <td @click.stop>
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('select', article.id)"
        class="row-checkbox"
      />
    </td>
    <td>
      <div class="article-title">
        <span class="title-text">{{ article.title }}</span>
        <div class="article-badges">
          <span v-if="article.featured" class="featured-badge">Featured</span>
          <span v-if="article.breakingNews" class="breaking-badge">Breaking</span>
          <span v-if="article.premium" class="premium-badge">Premium</span>
        </div>
      </div>
    </td>
    <td>
      <span :class="['status-badge', `status-${article.status}`]">
        {{ formatStatus(article.status) }}
      </span>
    </td>
    <td>{{ getCategoryName(article.category) }}</td>
    <td>
      <div class="authors-list">
        <span
          v-for="author in limitedAuthors"
          :key="author.id"
          class="author-tag"
        >
          {{ author.name }}
        </span>
        <span v-if="article.authors.length > 2" class="more-authors">
          +{{ article.authors.length - 2 }}
        </span>
      </div>
    </td>
    <td>
      <span v-if="article.publishedAt" class="date-text">
        {{ formatDate(article.publishedAt) }}
      </span>
      <span v-else class="date-text muted">Not published</span>
    </td>
    <td>
      <span :class="['live-indicator', { live: article.live }]">
        {{ article.live ? 'Yes' : 'No' }}
      </span>
    </td>
    <td>
      <div class="action-buttons" @click.stop>
        <button
          v-if="canEdit"
          @click="$emit('edit', article)"
          class="btn-action edit"
          title="Edit article"
        >
          Edit
        </button>
        <button
          v-else-if="article.status === 'published'"
          @click="$emit('view', article)"
          class="btn-action view"
          title="View published article"
        >
          View
        </button>
        <button
          v-else-if="article.status === 'deleted'"
          @click="$emit('view', article)"
          class="btn-action restore"
          title="Restore deleted article"
        >
          Restore
        </button>
        <button
          @click="$emit('preview', article)"
          class="btn-action preview"
          title="Preview article"
        >
          Preview
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
// Import store for author data
const editorStore = useEditorStore()
const { authors } = storeToRefs(editorStore)

const props = defineProps({
  article: Object,
  selected: Boolean,
  categories: Array
})

const emit = defineEmits(['select', 'edit', 'view', 'preview'])

const rowClass = computed(() => ({
  'row-published': props.article.status === 'published',
  'row-draft': props.article.status === 'draft',
  'row-rejected': props.article.status === 'rejected',
  'row-deleted': props.article.status === 'deleted',
  'clickable': true
}))

const canEdit = computed(() => 
  !['published', 'deleted'].includes(props.article.status)
)

const limitedAuthors = computed(() => {
  if (!props.article.authors || !authors.value) return []
  
  return props.article.authors.slice(0, 2).map(authorId => {
    return authors.value.find(author => author.id === authorId) || { id: authorId, name: 'Unknown Author' }
  })
})

const handleRowClick = () => {
  if (canEdit.value) {
    emit('edit', props.article)
  } else {
    emit('view', props.article)
  }
}

const formatStatus = (status) => {
  const statusMap = {
    published: 'Published',
    draft: 'Draft',
    rejected: 'Rejected',
    deleted: 'Deleted'
  }
  return statusMap[status] || status
}

const getCategoryName = (categoryId) => {
  const category = props.categories?.find(cat => cat.id === categoryId)
  return category?.name || 'Uncategorized'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.article-row {
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.article-row:hover {
  background-color: #f9fafb;
}

.article-row.row-published {
  background-color: #f0f9ff;
}

.article-row.row-draft {
  background-color: #fffbeb;
}

.article-row.row-rejected {
  background-color: #fef2f2;
}

.article-row.row-deleted {
  background-color: #f9fafb;
  opacity: 0.7;
}

.row-checkbox {
  cursor: pointer;
}

.article-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-text {
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}

.article-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.featured-badge {
  background: #fbbf24;
  color: #78350f;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breaking-badge {
  background: #ef4444;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.premium-badge {
  background: #f59e0b;
  color: #78350f;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  text-align: center;
  min-width: 80px;
}

.status-published {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-draft {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.status-deleted {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.authors-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.author-tag {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-authors {
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
}

.date-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.date-text.muted {
  color: #9ca3af;
  font-style: italic;
}

.live-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  display: inline-block;
  text-align: center;
  min-width: 50px;
}

.live-indicator.live {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.375rem 0.75rem;
  border: 1px solid;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-action.edit {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-action.edit:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-action.view {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-action.view:hover {
  background: #059669;
  border-color: #059669;
}

.btn-action.restore {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-action.restore:hover {
  background: #d97706;
  border-color: #d97706;
}

.btn-action.preview {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.btn-action.preview:hover {
  background: #7c3aed;
  border-color: #7c3aed;
}

@media (max-width: 1024px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-action {
    min-width: 60px;
  }
}
</style>