<script setup lang="ts">
import { ref } from 'vue'
import type { SessionTemplate, ScheduledSession } from '../types/session'

const emit = defineEmits<{
  import: [data: (SessionTemplate | ScheduledSession)[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const jsonText = ref('')
const error = ref('')

const parseAndEmit = (text: string) => {
  error.value = ''
  try {
    let cleanText = text.trim()

    // Gérer le cas de plusieurs tableaux collés: ][ -> ,
    cleanText = cleanText.replace(/\]\s*\[/g, ',')

    const data = JSON.parse(cleanText)
    const sessions = Array.isArray(data) ? data : [data]
    emit('import', sessions)
    jsonText.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'JSON invalide'
  }
}

const handleFile = async (file: File) => {
  const text = await file.text()
  parseAndEmit(text)
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    handleFile(target.files[0])
  }
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFile(file)
  }
}

const onPaste = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text')
  if (text) {
    jsonText.value = text
  }
}

const handleSubmit = () => {
  if (jsonText.value.trim()) {
    parseAndEmit(jsonText.value)
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Drop zone -->
    <div
      class="border-2 border-dashed rounded-box p-6 transition-all cursor-pointer"
      :class="isDragging ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="onFileChange"
      />
      <div class="flex flex-col items-center gap-2 text-base-content/70">
        <span class="text-3xl">📁</span>
        <p class="text-sm font-medium">Glisse un fichier JSON ou clique</p>
      </div>
    </div>

    <div class="divider text-xs text-base-content/50">OU</div>

    <!-- Paste area -->
    <div class="space-y-2">
      <textarea
        v-model="jsonText"
        class="textarea textarea-bordered w-full h-40 font-mono text-sm"
        placeholder='Colle ton JSON ici...

[
  {
    "sport": "cycling",
    "type": "endurance",
    "title": "Sortie Z2",
    "duration_min": 90,
    "date": "2025-01-15"
  }
]'
        @paste="onPaste"
      ></textarea>
      <button
        class="btn btn-primary btn-sm w-full"
        :disabled="!jsonText.trim()"
        @click="handleSubmit"
      >
        Importer
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-error text-sm">
      <span>{{ error }}</span>
    </div>
  </div>
</template>
