<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  geminiApiKey?: string
}>()

const emit = defineEmits<{
  saveApiKey: [apiKey: string | null]
  close: []
}>()

const localGeminiApiKey = ref(props.geminiApiKey || '')
const saved = ref(false)

watch(
  () => props.geminiApiKey,
  (newKey) => {
    localGeminiApiKey.value = newKey || ''
  }
)

const saveConfig = () => {
  emit('saveApiKey', localGeminiApiKey.value.trim() || null)
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

const hasKey = () => !!localGeminiApiKey.value.trim()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-2xl">&#9881;</span>
        <h3 class="font-bold text-lg">Configuration</h3>
      </div>
      <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">&#10005;</button>
    </div>

    <div class="space-y-4">
      <!-- Divider -->
      <div class="divider text-xs text-base-content/50 mt-0">Intelligence artificielle</div>

      <!-- Gemini API Key -->
      <div>
        <label class="text-sm font-medium mb-1 block">Cle API Gemini</label>
        <div class="flex gap-2">
          <input
            v-model="localGeminiApiKey"
            type="password"
            class="input input-bordered flex-1"
            placeholder="AIza..."
          />
          <button
            class="btn"
            :class="saved ? 'btn-success' : 'bg-emerald-500 text-white hover:bg-emerald-600 border-0'"
            @click="saveConfig"
          >
            {{ saved ? '&#10003;' : '&#128190;' }}
          </button>
        </div>
        <p class="text-xs text-base-content/50 mt-2">
          Recupere ta cle sur <a href="https://aistudio.google.com/apikey" target="_blank" class="link link-primary">Google AI Studio</a>
        </p>
        <div v-if="hasKey()" class="mt-2 flex items-center gap-2 text-xs text-success">
          <span>&#10003;</span>
          <span>Cle API configuree</span>
        </div>
        <div v-else class="mt-2 flex items-center gap-2 text-xs text-warning">
          <span>&#9888;</span>
          <span>Configure ta cle pour utiliser l'IA</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end pt-4 border-t border-base-300">
      <button class="btn btn-ghost" @click="emit('close')">Fermer</button>
    </div>
  </div>
</template>
