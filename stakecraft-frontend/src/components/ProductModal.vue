<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" :class="`van-theme-${theme}`" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit project' : 'Add project' }}
        </h3>
        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input v-model="form.title" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Project link (URL)</label>
            <input
              v-model="form.link"
              type="url"
              class="form-input"
              placeholder="https://..."
            />
          </div>
          <div class="form-group">
            <label class="form-label">Explanation</label>
            <textarea
              v-model="form.explanation"
              class="form-textarea"
              rows="5"
              placeholder="Describe the project..."
            />
          </div>
          <div class="form-group">
            <label class="form-label">Images (IPFS)</label>
            <p class="form-hint">Upload one or more images; each file is pinned via Pinata and the gateway URL is stored.</p>
            <div class="images-grid">
              <div v-for="(url, idx) in form.images" :key="idx + url" class="thumb-wrap">
                <img :src="url" :alt="`Image ${idx + 1}`" class="thumb-img" />
                <button type="button" class="thumb-remove" @click="removeImage(idx)" title="Remove">
                  ×
                </button>
              </div>
              <div
                class="upload-tile"
                @click="triggerFileInput"
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  @change="handleFileSelect"
                  class="file-input"
                />
                <span v-if="uploading" class="upload-tile-text">Uploading…</span>
                <span v-else class="upload-tile-text">+ Add images</span>
              </div>
            </div>
            <div v-if="uploadError" class="upload-error">
              <p class="error-text">{{ uploadError }}</p>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-inline">
              <label class="form-label">Sort order</label>
              <input v-model.number="form.order" type="number" class="form-input form-input-narrow" />
            </div>
            <label class="checkbox-label">
              <input v-model="form.isActive" type="checkbox" />
              Active (visible on site)
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary" :disabled="uploading">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="uploading">
              {{ uploading ? 'Wait for uploads…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, inject } from 'vue'
import { useIPFS } from '@/composables/useIPFS'

const props = defineProps({
  show: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
  product: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'save'])

const theme = inject('theme', ref('light'))
const { uploading, uploadError, uploadToIPFS } = useIPFS()
const fileInput = ref(null)

const form = reactive({
  title: '',
  link: '',
  explanation: '',
  images: [],
  order: 0,
  isActive: true
})

const resetFromProduct = (p) => {
  if (p && Object.keys(p).length > 0) {
    form.title = p.title || ''
    form.link = p.link || ''
    form.explanation = p.explanation || ''
    form.images = Array.isArray(p.images) ? [...p.images] : []
    form.order = p.order ?? 0
    form.isActive = p.isActive !== false
  } else {
    form.title = ''
    form.link = ''
    form.explanation = ''
    form.images = []
    form.order = 0
    form.isActive = true
  }
}

watch(
  () => props.product,
  (p) => resetFromProduct(p),
  { immediate: true }
)

watch(
  () => props.show,
  (open) => {
    if (open) resetFromProduct(props.product)
  }
)

const closeModal = () => emit('close')

const triggerFileInput = () => fileInput.value?.click()

const uploadFiles = async (files) => {
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
  for (const file of list) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} is over 10MB — skipped`)
      continue
    }
    const result = await uploadToIPFS(file)
    if (result.success) {
      form.images.push(result.url)
    } else {
      alert(`IPFS upload failed: ${result.error || 'unknown error'}`)
      break
    }
  }
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files?.length) uploadFiles(files)
  event.target.value = ''
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  if (files?.length) uploadFiles(files)
}

const removeImage = (idx) => {
  form.images.splice(idx, 1)
}

const saveProduct = () => {
  emit('save', {
    title: form.title.trim(),
    link: form.link.trim(),
    explanation: form.explanation,
    images: [...form.images],
    order: Number(form.order) || 0,
    isActive: form.isActive
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 640px;
  width: 92%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal.van-theme-dark {
  background: var(--van-mainnet-network-background);
  border-color: #333;
}

.modal.van-theme-dark .modal-content {
  background: var(--van-mainnet-network-background);
}

.modal.van-theme-dark .modal-title,
.modal.van-theme-dark .form-label,
.modal.van-theme-dark .checkbox-label {
  color: #f9fafb;
}

.modal.van-theme-dark .form-input,
.modal.van-theme-dark .form-textarea {
  background-color: #374151;
  color: #fff;
  border-color: #4b5563;
}

.modal.van-theme-dark .form-hint {
  color: #9ca3af;
}

.modal.van-theme-dark .upload-tile {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

.modal.van-theme-dark .modal-actions {
  border-top-color: #4b5563;
}

.modal-large {
  max-width: 720px;
}

.modal-content {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 4px);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.25rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-hint {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.25rem;
}

.form-group-inline {
  flex: 0 0 auto;
}

.form-input-narrow {
  width: 6rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  margin-bottom: 0.25rem;
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.thumb-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-tile {
  width: 96px;
  height: 96px;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f9fafb;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.upload-tile:hover {
  border-color: #6366f1;
  background: #eef2ff;
}

.file-input {
  display: none;
}

.upload-tile-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  padding: 0.25rem;
}

.upload-error {
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.error-text {
  font-size: 0.875rem;
  color: #dc2626;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}
</style>
