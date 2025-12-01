<!--components/Main/PublicationList.vue-->
<template>
  <aside class="publication-list">
    <div class="publication-header">
      <h3>Publications</h3>
      <div class="user-badge" :title="authStore.user?.email">
        {{ authStore.userInitials }}
      </div>
    </div>
    
    <div class="publication-items">
      <div
        v-for="publication in publications"
        :key="publication.id"
        :class="[
          'publication-item',
          {
            'active': currentPublication?.id === publication.id,
            'disabled': !isPublicationAllowed(publication.id),
            'allowed': isPublicationAllowed(publication.id)
          }
        ]"
        @click="handlePublicationSelect(publication)"
      >
        <div class="publication-info">
          <h4>{{ publication.name }}</h4>
          <p>{{ publication.description }}</p>
          <div v-if="!isPublicationAllowed(publication.id)" class="access-denied">
            <span class="access-icon">🔒</span>
            <span class="access-text">No Access</span>
          </div>
        </div>
        <div class="publication-meta">
          <span class="article-count">{{ articleCounts[publication.id] || 0 }}</span>
          <div v-if="isPublicationAllowed(publication.id)" class="access-indicator">
            <span class="indicator-dot"></span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="publication-footer">
      <div class="session-info">
        <span class="session-text">Session Active</span>
        <span class="session-indicator"></span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  publications: Array,
  currentPublication: Object,
  articleCounts: Object
})

const emit = defineEmits(['publication-selected'])

const isPublicationAllowed = (publicationId) => {
  return authStore.allowedPublications.includes(publicationId)
}

const handlePublicationSelect = (publication) => {
  if (isPublicationAllowed(publication.id)) {
    emit('publication-selected', publication)
  }
}
</script>

<style scoped>
.publication-list {
  width: 300px;
  background: white;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.publication-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publication-header h3 {
  margin: 0;
  color: #1a1d23;
  font-size: 1.125rem;
  font-weight: 600;
}

.user-badge {
  width: 36px;
  height: 36px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.publication-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.publication-item {
  padding: 16px 24px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.publication-item:hover:not(.disabled) {
  background: #f8fafc;
  border-left-color: #e2e8f0;
}

.publication-item.active:not(.disabled) {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.publication-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #fafafa;
}

.publication-info {
  flex: 1;
}

.publication-info h4 {
  margin: 0 0 4px 0;
  color: #1a1d23;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
}

.publication-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.4;
}

.access-denied {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.access-icon {
  font-size: 0.75rem;
}

.access-text {
  color: #ef4444;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
}

.publication-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.article-count {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.access-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.publication-item.disabled .article-count {
  background: #e5e7eb;
  color: #9ca3af;
}

.publication-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-text {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
}

.session-indicator {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Scrollbar Styling */
.publication-items::-webkit-scrollbar {
  width: 4px;
}

.publication-items::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.publication-items::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.publication-items::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .publication-list {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e1e5e9;
  }
  
  .publication-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    padding: 16px;
  }
  
  .publication-item {
    border-left: none;
    border-bottom: 3px solid transparent;
    border-radius: 8px;
    background: #f8fafc;
  }
  
  .publication-item:hover:not(.disabled) {
    border-left-color: transparent;
    border-bottom-color: #e2e8f0;
  }
  
  .publication-item.active:not(.disabled) {
    border-left-color: transparent;
    border-bottom-color: #3b82f6;
  }
}
</style>