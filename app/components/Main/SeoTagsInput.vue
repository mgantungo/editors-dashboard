<!--components/Main/SeoTagsInput.vue-->
<template>
  <div class="seo-tags-input">
    
    <div class="tags-container">
      <div
        v-for="tag in tags"
        :key="tag"
        class="tag"
      >
        <span>{{ tag }}</span>
        <button @click="removeTag(tag)" class="remove-tag">×</button>
      </div>
      
      <input
        v-model="inputValue"
        @keydown="handleKeydown"
        @focus="showSuggestions = true"
        @blur="onInputBlur"
        placeholder="Add tags..."
        class="tag-input"
        ref="tagInput"
        :disabled="isGeneratingTags"
      />
      
      <button 
        v-if="!isGeneratingTags" 
        @click="generateAITags" 
        class="ai-generate-btn"
        title="Generate AI-powered tags"
      >
        🚀 AI Suggest
      </button>
      
      <div v-else class="generating-indicator">
        <div class="spinner"></div>
        <span>Analyzing content...</span>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="validationErrors.length > 0" class="validation-errors">
      <div class="error-title">Invalid tags detected:</div>
      <div class="error-list">
        <div v-for="error in validationErrors" :key="error.tag" class="error-item">
          <span class="invalid-tag">"{{ error.tag }}"</span>
          <span class="error-reason">{{ error.reason }}</span>
          <button @click="removeTag(error.tag)" class="error-fix">Remove</button>
        </div>
      </div>
    </div>

    <!-- Intelligent Tag Suggestions -->
    <div v-if="showSuggestions && !isGeneratingTags" class="suggestions-container">
      <!-- Primary Tags -->
      <div v-if="primaryTags.length > 0" class="suggestion-section">
        <div class="suggestion-title">
          Primary Tags
          <span class="tag-category-badge">Essential</span>
        </div>
        <div class="suggestions">
          <div
            v-for="tag in primaryTags"
            :key="'primary-' + tag.tag"
            @mousedown="addTag(tag.tag)"
            class="suggestion-item primary-tag"
          >
            <span class="tag-text">{{ tag.tag }}</span>
            <div class="tag-meta">
              <span class="tag-type">{{ tag.type }}</span>
              <span class="tag-confidence" :title="`Confidence: ${tag.confidence}%`">
                {{ tag.confidence }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Tags -->
      <div v-if="secondaryTags.length > 0" class="suggestion-section">
        <div class="suggestion-title">
          Secondary Tags
          <span class="tag-category-badge">Contextual</span>
        </div>
        <div class="suggestions">
          <div
            v-for="tag in secondaryTags"
            :key="'secondary-' + tag.tag"
            @mousedown="addTag(tag.tag)"
            class="suggestion-item secondary-tag"
          >
            <span class="tag-text">{{ tag.tag }}</span>
            <div class="tag-meta">
              <span class="tag-type">{{ tag.type }}</span>
              <span class="tag-confidence" :title="`Confidence: ${tag.confidence}%`">
                {{ tag.confidence }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trending Tags -->
      <div v-if="trendingTags.length > 0" class="suggestion-section">
        <div class="suggestion-title">
          Trending Tags
          <span class="tag-category-badge">Hot Topics</span>
        </div>
        <div class="suggestions">
          <div
            v-for="tag in trendingTags"
            :key="'trending-' + tag.tag"
            @mousedown="addTag(tag.tag)"
            class="suggestion-item trending-tag"
          >
            <span class="tag-text">{{ tag.tag }}</span>
            <div class="tag-meta">
              <span class="tag-type">{{ tag.type }}</span>
              <span class="tag-confidence" :title="`Confidence: ${tag.confidence}%`">
                {{ tag.confidence }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tag Analytics -->
    <div v-if="tags.length > 0" class="tag-analytics">
      <div class="analytics-header">
        <span class="analytics-title">Tag Analysis</span>
        <button 
          @click="optimizeTags" 
          class="optimize-btn"
          :disabled="isOptimizing"
        >
          {{ isOptimizing ? 'Optimizing...' : '🚀 Optimize' }}
        </button>
      </div>
      <div class="analytics-items">
        <div class="analytics-item">
          <span class="label">Total Tags:</span>
          <span class="value">{{ validTags.length }}/15</span>
        </div>
        <div class="analytics-item">
          <span class="label">Primary Tags:</span>
          <span class="value">{{ primaryTagCount }}/{{ Math.min(8, validTags.length) }}</span>
        </div>
        <div class="analytics-item">
          <span class="label">SEO Score:</span>
          <span class="value" :class="{
            'good': seoScore >= 8,
            'average': seoScore >= 6 && seoScore < 8,
            'poor': seoScore < 6
          }">
            {{ seoScore }}/10
          </span>
        </div>
      </div>
    </div>

    <!-- SEO Guidelines -->
    <div class="seo-guidelines">
      <div class="guidelines-title">SEO Tag Guidelines</div>
      <div class="guidelines-list">
        <div class="guideline-item">✅ Use letters, numbers, and spaces only</div>
        <div class="guideline-item">✅ Keep tags between 2-30 characters</div>
        <div class="guideline-item">❌ No special characters (&, #, @, !, ', ", ,, ., etc.)</div>
        <div class="guideline-item">✅ Use descriptive, relevant phrases</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Array,
  title: String,
  summary: String,
  content: String,
  featuredImageCaption: String,
  category: String,
  author: String
})

const emit = defineEmits(['update:modelValue'])

const tags = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

const inputValue = ref('')
const showSuggestions = ref(false)
const tagInput = ref(null)
const isGeneratingTags = ref(false)
const isOptimizing = ref(false)
const aiSuggestedTags = ref([])

// Enhanced SEO Tag Validation
const validateTag = (tag) => {
  const issues = []
  
  // Strict character validation - only allow letters, numbers, spaces, and hyphens
  const validChars = /^[a-zA-Z0-9\s\-]+$/
  if (!validChars.test(tag)) {
    issues.push('Contains invalid characters (only letters, numbers, spaces, and hyphens allowed)')
  }
  
  // Check for HTML tags
  const htmlPattern = /<[^>]*>/
  if (htmlPattern.test(tag)) {
    issues.push('Contains HTML tags')
  }
  
  // Check length
  if (tag.length < 2) {
    issues.push('Too short (minimum 2 characters)')
  }
  
  if (tag.length > 30) {
    issues.push('Too long (maximum 30 characters)')
  }
  
  // Check for only whitespace
  if (tag.trim().length === 0) {
    issues.push('Empty or only whitespace')
  }
  
  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(tag)) {
    issues.push('Contains multiple consecutive spaces')
  }
  
  // Check for leading/trailing hyphens or spaces
  if (/^[\s\-]|[\s\-]$/.test(tag)) {
    issues.push('Has leading or trailing spaces/hyphens')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

const sanitizeTag = (tag) => {
  let sanitized = tag
  
  // Remove all special characters except hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-]/g, '')
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s{2,}/g, ' ')
  
  // Trim and remove leading/trailing hyphens and spaces
  sanitized = sanitized.trim().replace(/^[\s\-]+|[\s\-]+$/g, '')
  
  // Convert to title case for consistency
  sanitized = sanitized.split(' ')
    .map(word => {
      if (word.length === 0) return ''
      // Keep common acronyms in uppercase
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
  
  return sanitized
}

// Enhanced AI modeling for sports content
const analyzeContentWithAI = (content) => {
  const allText = [
    content.title,
    content.summary,
    content.content,
    content.imageCaption
  ].filter(Boolean).join(' ')

  if (!allText.trim()) {
    return { primary: [], secondary: [], trending: [] }
  }

  // Advanced sports content analysis
  const analysis = analyzeSportsContent(allText)
  
  return {
    primary: generatePrimaryTags(analysis),
    secondary: generateSecondaryTags(analysis),
    trending: generateTrendingTags(analysis)
  }
}

const analyzeSportsContent = (text) => {
  const analysis = {
    people: [],
    teams: [],
    competitions: [],
    events: [],
    locations: [],
    themes: [],
    dates: [],
    statistics: []
  }

  // Extract named entities with context
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  
  sentences.forEach(sentence => {
    // Extract people (proper nouns that appear to be names)
    const peopleMatches = sentence.match(/([A-Z][a-z]+ [A-Z][a-z]+)/g) || []
    peopleMatches.forEach(person => {
      if (!analysis.people.includes(person)) {
        analysis.people.push(person)
      }
    })

    // Extract teams and national teams
    const teamMatches = sentence.match(/([A-Z][a-z]+ (?:FC|United|City|National Team|national team))/g) || []
    teamMatches.forEach(team => {
      if (!analysis.teams.includes(team)) {
        analysis.teams.push(team)
      }
    })

    // Extract competitions and tournaments
    const competitionKeywords = ['World Cup', 'Champions League', 'Premier League', 'qualifiers', 'tournament']
    competitionKeywords.forEach(keyword => {
      if (sentence.includes(keyword)) {
        const competition = extractCompetitionContext(sentence, keyword)
        if (competition && !analysis.competitions.includes(competition)) {
          analysis.competitions.push(competition)
        }
      }
    })

    // Extract match fixtures
    const fixtureMatches = sentence.match(/([A-Z][a-z]+ (?:vs|v) [A-Z][a-z]+)/g) || []
    fixtureMatches.forEach(fixture => {
      if (!analysis.events.includes(fixture)) {
        analysis.events.push(fixture)
      }
    })

    // Extract locations and venues
    const locationMatches = sentence.match(/(?:in|at) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g) || []
    locationMatches.forEach(location => {
      const cleanLocation = location.replace(/^(in|at) /, '')
      if (!analysis.locations.includes(cleanLocation)) {
        analysis.locations.push(cleanLocation)
      }
    })

    // Extract key themes and topics
    const themes = extractThemesFromSentence(sentence)
    themes.forEach(theme => {
      if (!analysis.themes.includes(theme)) {
        analysis.themes.push(theme)
      }
    })

    // Extract dates and timeframes
    const dateMatches = sentence.match(/(?:next year|this week|last month|March|World Cup \d{4})/g) || []
    dateMatches.forEach(date => {
      if (!analysis.dates.includes(date)) {
        analysis.dates.push(date)
      }
    })
  })

  return analysis
}

const extractCompetitionContext = (sentence, keyword) => {
  const words = sentence.split(' ')
  const keywordIndex = words.findIndex(word => word.includes(keyword))
  
  if (keywordIndex !== -1) {
    // Get 2-3 words before the keyword for context
    const start = Math.max(0, keywordIndex - 2)
    const context = words.slice(start, keywordIndex + 1).join(' ')
    return sanitizeTag(context)
  }
  
  return sanitizeTag(keyword)
}

const extractThemesFromSentence = (sentence) => {
  const themes = []
  const lowerSentence = sentence.toLowerCase()
  
  // Competition themes
  if (lowerSentence.includes('competition') || lowerSentence.includes('battle') || lowerSentence.includes('fight')) {
    themes.push('competition for places')
  }
  
  if (lowerSentence.includes('starting') || lowerSentence.includes('line-up') || lowerSentence.includes('position')) {
    themes.push('starting lineup')
  }
  
  if (lowerSentence.includes('squad') || lowerSentence.includes('selection')) {
    themes.push('squad selection')
  }
  
  if (lowerSentence.includes('qualif') || lowerSentence.includes('qualifying')) {
    themes.push('qualifiers')
  }
  
  if (lowerSentence.includes('return') || lowerSentence.includes('back in')) {
    themes.push('player return')
  }
  
  if (lowerSentence.includes('injury') || lowerSentence.includes('surgery') || lowerSentence.includes('recovery')) {
    themes.push('injury recovery')
  }
  
  if (lowerSentence.includes('coach') || lowerSentence.includes('manager') || lowerSentence.includes('boss')) {
    themes.push('coach comments')
  }
  
  return themes.map(theme => sanitizeTag(theme))
}

const generatePrimaryTags = (analysis) => {
  const primaryTags = []
  
  // People (highest priority)
  analysis.people.forEach(person => {
    if (validateTag(person).isValid) {
      primaryTags.push({
        tag: person,
        type: 'Person',
        confidence: 95
      })
    }
  })
  
  // Teams and national teams
  analysis.teams.forEach(team => {
    const cleanTeam = sanitizeTag(team)
    if (validateTag(cleanTeam).isValid) {
      primaryTags.push({
        tag: cleanTeam,
        type: 'Team',
        confidence: 90
      })
    }
  })
  
  // Major competitions
  analysis.competitions.forEach(competition => {
    if (validateTag(competition).isValid) {
      primaryTags.push({
        tag: competition,
        type: 'Competition',
        confidence: 85
      })
    }
  })
  
  // Key match events
  analysis.events.forEach(event => {
    const cleanEvent = sanitizeTag(event)
    if (validateTag(cleanEvent).isValid) {
      primaryTags.push({
        tag: cleanEvent,
        type: 'Match',
        confidence: 80
      })
    }
  })
  
  return primaryTags.slice(0, 8)
}

const generateSecondaryTags = (analysis) => {
  const secondaryTags = []
  
  // Theme-based tags
  analysis.themes.forEach(theme => {
    secondaryTags.push({
      tag: theme,
      type: 'Theme',
      confidence: 75
    })
  })
  
  // Location-based tags
  analysis.locations.forEach(location => {
    const cleanLocation = sanitizeTag(location)
    if (validateTag(cleanLocation).isValid) {
      secondaryTags.push({
        tag: cleanLocation,
        type: 'Location',
        confidence: 70
      })
    }
  })
  
  // Combination tags (people + themes)
  analysis.people.forEach(person => {
    analysis.themes.forEach(theme => {
      const combinedTag = `${person} ${theme}`
      if (validateTag(combinedTag).isValid && combinedTag.length <= 30) {
        secondaryTags.push({
          tag: combinedTag,
          type: 'Context',
          confidence: 65
        })
      }
    })
  })
  
  return secondaryTags.slice(0, 10)
}

const generateTrendingTags = (analysis) => {
  const trendingTags = []
  
  // Time-sensitive tags
  analysis.dates.forEach(date => {
    const cleanDate = sanitizeTag(date)
    if (validateTag(cleanDate).isValid) {
      trendingTags.push({
        tag: cleanDate,
        type: 'Timeline',
        confidence: 60
      })
    }
  })
  
  // Breaking news style tags
  analysis.people.forEach(person => {
    const breakingTags = [
      `${person} latest`,
      `${person} update`,
      `${person} news`
    ]
    
    breakingTags.forEach(tag => {
      if (validateTag(tag).isValid) {
        trendingTags.push({
          tag,
          type: 'Breaking',
          confidence: 70
        })
      }
    })
  })
  
  // Performance and statistics tags
  if (analysis.themes.includes('qualifiers')) {
    trendingTags.push({
      tag: 'qualifying results',
      type: 'Performance',
      confidence: 65
    })
  }
  
  return trendingTags.slice(0, 6)
}

// Computed properties for categorized tags
const primaryTags = computed(() => aiSuggestedTags.value.primary || [])
const secondaryTags = computed(() => aiSuggestedTags.value.secondary || [])
const trendingTags = computed(() => aiSuggestedTags.value.trending || [])

const primaryTagCount = computed(() => {
  return validTags.value.filter(tag => 
    primaryTags.value.some(primary => primary.tag === tag)
  ).length
})

// Enhanced AI service
const useAITagService = () => {
  const generateTags = async (content) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const generatedTags = analyzeContentWithAI(content)
        resolve(generatedTags)
      }, 1200)
    })
  }

  return { generateTags }
}

const { generateTags } = useAITagService()

const generateAITags = async () => {
  if (!currentContent.value.title && !currentContent.value.content) {
    alert('Please add some content first to generate AI tags')
    return
  }

  isGeneratingTags.value = true
  try {
    const results = await generateTags(currentContent.value)
    aiSuggestedTags.value = results
    
    // Auto-add 2-3 primary tags if few tags exist
    if (tags.value.length < 3) {
      const autoAddTags = results.primary.slice(0, 3).map(tag => tag.tag)
      const newTags = [...tags.value, ...autoAddTags].slice(0, 15)
      tags.value = newTags
    }
  } catch (error) {
    console.error('Failed to generate AI tags:', error)
  } finally {
    isGeneratingTags.value = false
  }
}

// Validation state
const validationErrors = computed(() => {
  const errors = []
  tags.value.forEach(tag => {
    const validation = validateTag(tag)
    if (!validation.isValid) {
      errors.push({
        tag,
        reason: validation.issues.join(', ')
      })
    }
  })
  return errors
})

const validTags = computed(() => {
  return tags.value.filter(tag => validateTag(tag).isValid)
})

// Enhanced input validation
const handleKeydown = (event) => {
  // Prevent invalid characters from being entered
  const invalidChars = /[^a-zA-Z0-9\s\-]/
  if (invalidChars.test(event.key)) {
    event.preventDefault()
    return
  }
  
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    if (inputValue.value.trim() && tags.value.length < 15) {
      addTag(inputValue.value)
    }
  } else if (event.key === 'Backspace' && !inputValue.value && tags.value.length > 0) {
    removeTag(tags.value[tags.value.length - 1])
  }
}

const addTag = (tag) => {
  let cleanTag = tag.trim()
  cleanTag = sanitizeTag(cleanTag)
  
  const validation = validateTag(cleanTag)
  if (!validation.isValid) return
  
  if (cleanTag && !tags.value.includes(cleanTag) && tags.value.length < 15) {
    tags.value = [...tags.value, cleanTag]
  }
  inputValue.value = ''
  showSuggestions.value = false
  tagInput.value?.focus()
}

const removeTag = (tag) => {
  tags.value = tags.value.filter(t => t !== tag)
}

const onInputBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const currentContent = computed(() => ({
  title: props.title || '',
  summary: props.summary?.replace(/<[^>]*>/g, ' ') || '',
  content: props.content?.replace(/<[^>]*>/g, ' ') || '',
  imageCaption: props.featuredImageCaption || '',
  category: props.category || '',
  author: props.author || ''
}))

// SEO Scoring
const seoScore = computed(() => {
  let score = 0
  
  // Tag count optimization
  if (validTags.value.length >= 5 && validTags.value.length <= 12) score += 4
  else if (validTags.value.length > 0) score += 2
  
  // Primary tag presence
  if (primaryTagCount.value >= 3) score += 3
  else if (primaryTagCount.value > 0) score += 1
  
  // Tag diversity (mix of primary, secondary, trending)
  const hasPrimary = primaryTagCount.value > 0
  const hasSecondary = validTags.value.some(tag => 
    secondaryTags.value.some(secondary => secondary.tag === tag)
  )
  const hasTrending = validTags.value.some(tag => 
    trendingTags.value.some(trending => trending.tag === tag)
  )
  
  if (hasPrimary && hasSecondary && hasTrending) score += 3
  else if (hasPrimary && (hasSecondary || hasTrending)) score += 2
  
  return Math.min(10, score)
})

// Initialize sanitization
onMounted(() => {
  const sanitizedTags = tags.value.map(tag => sanitizeTag(tag)).filter(tag => {
    const validation = validateTag(tag)
    return validation.isValid && tag.length > 0
  })
  
  const uniqueTags = [...new Set(sanitizedTags)]
  if (uniqueTags.length !== tags.value.length) {
    tags.value = uniqueTags
  }
})

// Auto-generate when significant content is available
watch(() => [props.title, props.content], ([newTitle, newContent], [oldTitle, oldContent]) => {
  const hasSignificantContent = newContent && newContent.length > 300
  const isNewContent = !oldContent && newContent
  
  if ((isNewContent && hasSignificantContent) && tags.value.length < 3) {
    generateAITags()
  }
}, { deep: true })
</script>

<style scoped>
.seo-tags-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.seo-tags-input label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  min-height: 3rem;
  align-items: center;
  transition: border-color 0.2s ease;
}

.tags-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #e5e7eb;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.tag:hover {
  background: #d1d5db;
}

.remove-tag {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1rem;
  color: #6b7280;
}

.remove-tag:hover {
  background: #9ca3af;
  color: white;
}

.tag-input {
  border: none;
  outline: none;
  padding: 0.5rem;
  flex: 1;
  min-width: 100px;
  background: transparent;
}

/* Suggestions */
.suggestions-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.suggestion-section {
  border-bottom: 1px solid #f3f4f6;
}

.suggestion-section:last-child {
  border-bottom: none;
}

.suggestion-title {
  padding: 0.75rem 1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.suggestions {
  padding: 0 0.5rem 0.5rem;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  margin: 0.25rem 0;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background: #f3f4f6;
}

.suggestion-item.high-score {
  border-left: 3px solid #10b981;
}

.suggestion-item.medium-score {
  border-left: 3px solid #f59e0b;
}

.tag-text {
  flex: 1;
}

.tag-score {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
}

/* Popular Tags */
.popular-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.popular-tags-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.popular-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.popular-tag {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-tag:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Tag Analytics */
.tag-analytics {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
}

.analytics-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.analytics-items {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.analytics-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.analytics-item .label {
  font-size: 0.75rem;
  color: #6b7280;
}

.analytics-item .value {
  font-weight: 600;
  font-size: 0.875rem;
}

.analytics-item .value.good {
  color: #10b981;
}

.analytics-item .value.average {
  color: #f59e0b;
}

.analytics-item .value.poor {
  color: #ef4444;
}

.analytics-item .value.warning {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .analytics-items {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .suggestions-container {
    max-height: 250px;
  }
}




/*styles for the AI features */

.ai-generate-btn {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  margin-left: 0.5rem;
  transition: background-color 0.2s ease;
}

.ai-generate-btn:hover {
  background: #7c3aed;
}

.generating-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.refresh-btn:hover {
  background: #f3f4f6;
}

.tag-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-confidence {
  font-size: 0.7rem;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 0.1rem 0.4rem;
  border-radius: 0.5rem;
}

.quick-add-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;
}

.quick-add-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.quick-add-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.optimize-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background-color 0.2s ease;
}

.optimize-btn:hover:not(:disabled) {
  background: #059669;
}

.optimize-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.ai-analysis {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
}

.analysis-title {
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.analysis-item {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

.suggestion-item.high-relevance {
  border-left: 3px solid #10b981;
}

.suggestion-item.medium-relevance {
  border-left: 3px solid #f59e0b;
}


/* Enhanced styles for categorized tags */
.tag-category-badge {
  background: #e5e7eb;
  color: #374151;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.primary-tag {
  border-left: 4px solid #10b981;
}

.secondary-tag {
  border-left: 4px solid #f59e0b;
}

.trending-tag {
  border-left: 4px solid #ef4444;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 0.375rem;
  margin: 0.25rem 0;
  transition: all 0.2s ease;
  border-left: 4px solid #e5e7eb;
}

.suggestion-item:hover {
  background: #f8fafc;
  transform: translateX(2px);
}

.tag-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tag-type {
  font-size: 0.7rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
}

.tag-confidence {
  font-size: 0.7rem;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  min-width: 2.5rem;
  text-align: center;
}
</style>