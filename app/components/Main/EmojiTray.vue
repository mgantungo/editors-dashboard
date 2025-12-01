<!--components/Main/EmojiTray.vue-->
<template>
  <div class="emoji-tray">
    <div class="emoji-tray-header">
      <h4>Select Emoji</h4>
      <div class="emoji-categories">
        <button
          v-for="category in categories"
          :key="category.name"
          @click="activeCategory = category.name"
          :class="{ active: activeCategory === category.name }"
          class="category-btn"
          :title="category.title"
        >
          {{ category.icon }}
        </button>
      </div>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <div class="emoji-search">
      <input
        v-model="searchQuery"
        placeholder="Search emojis..."
        class="search-input"
        @input="handleSearch"
      />
    </div>
    
    <div class="emoji-grid">
      <button
        v-for="emoji in filteredEmojis"
        :key="emoji.unified"
        @click="selectEmoji(emoji)"
        class="emoji-btn"
        :title="emoji.name"
      >
        {{ getEmojiCharacter(emoji) }}
      </button>
    </div>
    
    <div v-if="loading" class="loading">Loading emojis...</div>
    <div v-else-if="filteredEmojis.length === 0" class="no-results">
      No emojis found for "{{ searchQuery }}"
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['emoji-selected', 'close'])

const emojis = ref([])
const loading = ref(true)
const activeCategory = ref('smileys_emotion')
const searchQuery = ref('')

const categories = [
  { name: 'smileys_emotion', icon: '😀', title: 'Smileys & Emotion' },
  { name: 'people_body', icon: '👋', title: 'People & Body' },
  { name: 'animals_nature', icon: '🐶', title: 'Animals & Nature' },
  { name: 'food_drink', icon: '🍎', title: 'Food & Drink' },
  { name: 'travel_places', icon: '🚗', title: 'Travel & Places' },
  { name: 'activities', icon: '⚽', title: 'Activities' },
  { name: 'objects', icon: '💡', title: 'Objects' },
  { name: 'symbols', icon: '❤️', title: 'Symbols' },
  { name: 'flags', icon: '🏳️', title: 'Flags' }
]

// Fetch emojis from GitHub repository
const fetchEmojis = async () => {
  try {
    loading.value = true
    const response = await fetch('https://raw.githubusercontent.com/iamcal/emoji-data/master/emoji.json')
    
    if (response.ok) {
      const data = await response.json()
      // Filter only emojis that have unified code and are not variants
      emojis.value = data.filter(emoji => 
        emoji.unified && 
        !emoji.variations && 
        emoji.category &&
        emoji.sort_order
      ).sort((a, b) => a.sort_order - b.sort_order)
    } else {
      throw new Error('Failed to fetch emojis')
    }
  } catch (error) {
    console.error('Failed to fetch emojis:', error)
    loadFallbackEmojis()
  } finally {
    loading.value = false
  }
}

// Convert unified code to emoji character
const getEmojiCharacter = (emoji) => {
  if (!emoji.unified) return ''
  
  // Convert unified code (e.g., "1F600") to emoji character
  const codePoints = emoji.unified.split('-').map(code => parseInt(code, 16))
  return String.fromCodePoint(...codePoints)
}

// Select emoji and emit event
const selectEmoji = (emoji) => {
  const emojiChar = getEmojiCharacter(emoji)
  emit('emoji-selected', emojiChar)
}

// Handle search input
const handleSearch = () => {
  // If there's a search query, clear the active category
  if (searchQuery.value) {
    activeCategory.value = null
  }
}

// Filter emojis based on category and search
const filteredEmojis = computed(() => {
  let filtered = emojis.value
  
  // Filter by category if no search query
  if (activeCategory.value && !searchQuery.value) {
    filtered = filtered.filter(emoji => emoji.category === activeCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(emoji => 
      emoji.name.toLowerCase().includes(query) ||
      (emoji.short_name && emoji.short_name.toLowerCase().includes(query)) ||
      (emoji.keywords && emoji.keywords.some(keyword => keyword.toLowerCase().includes(query)))
    )
  }
  
  return filtered.slice(0, 200) // Limit to 200 emojis for performance
})

// Fallback emojis in case API fails
const loadFallbackEmojis = () => {
  emojis.value = [
    {
      unified: '1F600',
      name: 'grinning face',
      category: 'smileys_emotion',
      sort_order: 1
    },
    {
      unified: '1F603',
      name: 'grinning face with big eyes',
      category: 'smileys_emotion',
      sort_order: 2
    },
    {
      unified: '1F604',
      name: 'grinning face with smiling eyes',
      category: 'smileys_emotion',
      sort_order: 3
    },
    {
      unified: '1F601',
      name: 'beaming face with smiling eyes',
      category: 'smileys_emotion',
      sort_order: 4
    },
    {
      unified: '1F606',
      name: 'grinning squinting face',
      category: 'smileys_emotion',
      sort_order: 5
    },
    {
      unified: '1F605',
      name: 'grinning face with sweat',
      category: 'smileys_emotion',
      sort_order: 6
    },
    {
      unified: '1F602',
      name: 'face with tears of joy',
      category: 'smileys_emotion',
      sort_order: 7
    },
    {
      unified: '1F923',
      name: 'rolling on the floor laughing',
      category: 'smileys_emotion',
      sort_order: 8
    },
    {
      unified: '1F60A',
      name: 'smiling face with smiling eyes',
      category: 'smileys_emotion',
      sort_order: 9
    },
    {
      unified: '1F607',
      name: 'smiling face with halo',
      category: 'smileys_emotion',
      sort_order: 10
    },
    // Add more fallback emojis as needed
  ]
}

onMounted(() => {
  fetchEmojis()
})
</script>

<style scoped>
.emoji-tray {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  width: 380px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, sans-serif;
}

.emoji-tray-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: #f9fafb;
  border-radius: 0.75rem 0.75rem 0 0;
}

.emoji-tray-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.emoji-categories {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  justify-content: center;
}

.category-btn {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 0.375rem;
  cursor: pointer;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: scale(1.05);
}

.category-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #ef4444;
  color: white;
}

.emoji-search {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 0.375rem;
  padding: 1rem;
  overflow-y: auto;
  flex-grow: 1;
}

.emoji-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-height: 44px;
}

.emoji-btn:hover {
  background: #3b82f6;
  transform: scale(1.15);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading, .no-results {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  color: #3b82f6;
}

/* Custom scrollbar */
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive design */
@media (max-width: 480px) {
  .emoji-tray {
    width: 100vw;
    max-width: 100vw;
    right: -1rem;
    border-radius: 0.75rem 0 0 0.75rem;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    padding: 0.75rem;
  }
  
  .emoji-btn {
    font-size: 1.25rem;
    min-height: 40px;
  }
}
</style>