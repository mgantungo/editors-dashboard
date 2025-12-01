<!--components/Main/PublicationList.vue-->
<template>
  <div class="publication-list">
    <div class="list-header">
      <h3 class="list-title">Publications</h3>
      <span class="publication-count">{{ publications.length }} total</span>
    </div>
    <div class="publication-scroll-container">
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
  width: 280px;
  background: white;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  left: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e1e5e9;
  background: white;
  flex-shrink: 0;
}

.list-title {
  color: #2d3748;
  font-weight: 600;
  margin: 0;
  font-size: 1.125rem;
}

.publication-count {
  font-size: 0.75rem;
  color: #718096;
  background: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.publication-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.publication-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Custom scrollbar styling */
.publication-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.publication-scroll-container::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.publication-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.publication-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.publication-card {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.publication-card:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.publication-card.active {
  border-color: #4299e1;
  background: #ebf8ff;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.15);
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
  flex-shrink: 0;
  font-size: 1.125rem;
}

.publication-info {
  flex: 1;
  min-width: 0;
}

.publication-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

.article-count {
  font-size: 0.75rem;
  color: #718096;
  display: block;
  line-height: 1.3;
}

/* Responsive design */
@media (max-width: 1024px) {
  .publication-list {
    width: 280px;
  }
  
  .list-header,
  .publication-scroll-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 768px) {
  .publication-list {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #e1e5e9;
  }
  
  .publication-scroll-container {
    max-height: 200px;
    padding: 1rem;
  }
  
  .list-header {
    padding: 1rem;
  }
  
  .publication-card {
    align-items: center;
  }
  
  .publication-info h4 {
    font-size: 0.875rem;
    line-height: 1.3;
  }
}
</style>