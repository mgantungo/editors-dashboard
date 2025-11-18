<!--components/Main/PublicationList.vue-->
<template>
  <div class="publication-list">
    <h3 class="list-title">Publications</h3>
    <div class="publication-grid">
      <div
        v-for="publication in publications"
        :key="publication.id"
        :class="['publication-card', { active: currentPublication?.id === publication.id }]"
        @click="selectPublication(publication)"
      >
        <div class="publication-icon">
          {{ publication.name.charAt(0) }}
        </div>
        <div class="publication-info">
          <h4>{{ publication.name }}</h4>
          <span class="article-count">{{ getArticleCount(publication.id) }} articles</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  publications: Array,
  currentPublication: Object,
  articleCounts: Object
})

const emit = defineEmits(['publication-selected'])

const selectPublication = (publication) => {
  emit('publication-selected', publication)
}

const getArticleCount = (publicationId) => {
  return props.articleCounts?.[publicationId] || 0
}
</script>

<style scoped>
.publication-list {
  padding: 1.5rem;
  background: white;
  border-right: 1px solid #e1e5e9;
  min-height: 100vh;
}

.list-title {
  margin-bottom: 1.5rem;
  color: #2d3748;
  font-weight: 600;
}

.publication-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.publication-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.publication-card:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.publication-card.active {
  border-color: #4299e1;
  background: #ebf8ff;
}

.publication-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  background: #4299e1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}

.publication-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
}

.article-count {
  font-size: 0.875rem;
  color: #718096;
}
</style>