<!--components/Main/EmojiTray.vue-->
<template>
  <div class="emoji-tray">
    <div class="emoji-header">
      <h4>Emoji</h4>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <div class="emoji-search">
      <input
        v-model="searchQuery"
        placeholder="Search emoji..."
        class="search-input"
      />
    </div>
    
    <div class="emoji-categories">
      <button
        v-for="category in categories"
        :key="category"
        :class="['category-btn', { active: activeCategory === category }]"
        @click="activeCategory = category"
      >
        {{ categoryIcons[category] }}
      </button>
    </div>
    
    <div class="emoji-grid">
      <button
        v-for="emoji in filteredEmojis"
        :key="emoji"
        @click="selectEmoji(emoji)"
        class="emoji-btn"
        :title="getEmojiName(emoji)"
      >
        {{ emoji }}
      </button>
    </div>
    
    <div v-if="filteredEmojis.length === 0" class="no-emoji">
      No emoji found
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['emoji-selected', 'close'])

const searchQuery = ref('')
const activeCategory = ref('smileys')

// Sample emoji data - in real app, use a proper emoji library
const emojiData = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍'],
  animals: ['🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴'],
  food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼'],
  objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
}

const categories = Object.keys(emojiData)

const categoryIcons = {
  smileys: '😀',
  people: '👋',
  animals: '🐵',
  food: '🍎',
  travel: '🚗',
  objects: '📱',
  symbols: '❤️'
}

const filteredEmojis = computed(() => {
  let emojis = emojiData[activeCategory.value] || []
  
  if (searchQuery.value) {
    emojis = emojis.filter(emoji => 
      getEmojiName(emoji).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return emojis
})

const selectEmoji = (emoji) => {
  emit('emoji-selected', emoji)
  emit('close')
}

const getEmojiName = (emoji) => {
  // Simple mapping - in real app, use proper emoji name library
  const names = {
    '😀': 'Grinning Face',
    '😃': 'Grinning Face with Big Eyes',
    '😄': 'Grinning Face with Smiling Eyes',
    '👋': 'Waving Hand',
    '🐵': 'Monkey Face',
    '🍎': 'Red Apple',
    '🚗': 'Automobile',
    '📱': 'Mobile Phone',
    '❤️': 'Red Heart'
  }
  return names[emoji] || emoji
}
</script>

<style scoped>
.emoji-tray {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.emoji-header h4 {
  margin: 0;
  color: #374151;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
}

.emoji-search {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.emoji-categories {
  display: flex;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.5rem;
  overflow-x: auto;
}

.category-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.375rem;
  font-size: 1.25rem;
  transition: background-color 0.2s ease;
}

.category-btn:hover {
  background: #f3f4f6;
}

.category-btn.active {
  background: #3b82f6;
  color: white;
}

.emoji-grid {
  flex: 1;
  padding: 0.75rem;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 200px;
}

.emoji-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.375rem;
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

.emoji-btn:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.no-emoji {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}
</style>