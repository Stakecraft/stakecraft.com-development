<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" :class="`van-theme-${theme}`" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit Testnet Card' : 'Add Testnet Card' }}
        </h3>
        <form @submit.prevent="saveCard" class="modal-form">
          <div class="form-group">
            <label class="form-label">Network Image</label>
            <div class="image-upload-container">
              <!-- Image Preview -->
              <div v-if="imagePreview || form.image" class="image-preview">
                <img
                  :src="imagePreview || form.image"
                  :alt="form.title || 'Network image'"
                  class="preview-image"
                />
                <button
                  type="button"
                  @click="removeImage"
                  class="remove-image-btn"
                  title="Remove image"
                >
                  ×
                </button>
              </div>

              <!-- Upload Area -->
              <div
                v-else
                class="upload-area"
                @click="triggerFileInput"
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="file-input"
                  style="display: none"
                />
                <div class="upload-content">
                  <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p class="upload-text">Click to upload or drag and drop</p>
                  <p class="upload-hint">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>

              <!-- Upload Progress -->
              <div v-if="uploading" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <p class="progress-text">Uploading to IPFS...</p>
              </div>

              <!-- Upload Error -->
              <div v-if="uploadError" class="upload-error">
                <p class="error-text">{{ uploadError }}</p>
                <button type="button" @click="retryUpload" class="retry-btn">Retry Upload</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Title</label>
            <input v-model="form.title" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-textarea" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Order</label>
            <input
              v-model.number="form.order"
              type="number"
              min="0"
              class="form-input"
              placeholder="Enter display order (0 = first)"
            />
            <div class="form-hint">Lower numbers appear first in the list</div>
            <div v-if="orderError" class="form-error">{{ orderError }}</div>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
              :disabled="uploading"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="uploading">
              <span v-if="uploading" class="loading-spinner-small"></span>
              {{ uploading ? 'Saving...' : 'Save' }}
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
  show: {
    type: Boolean,
    default: false
  },
  editing: {
    type: Boolean,
    default: false
  },
  card: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])

// Theme injection
const theme = inject('theme', ref('light'))
const { uploading, uploadError, uploadToIPFS } = useIPFS()
const fileInput = ref(null)
const orderError = ref('')
const imagePreview = ref(null)
const selectedFile = ref(null)

const form = reactive({
  image: '',
  title: '',
  description: '',
  order: 0
})

watch(
  () => props.card,
  (newCard) => {
    if (newCard && Object.keys(newCard).length > 0) {
      form.image = newCard.image || ''
      form.title = newCard.title || ''
      form.description = newCard.description || ''
      form.order = newCard.order || 0
      imagePreview.value = newCard.image || null
    } else {
      form.image = ''
      form.title = ''
      form.description = ''
      form.order = 0
      imagePreview.value = null
      selectedFile.value = null
    }
    // Clear errors when form resets
    orderError.value = ''
  },
  { immediate: true }
)

// Clear order error when order changes
watch(
  () => form.order,
  () => {
    orderError.value = ''
  }
)

const closeModal = () => {
  emit('close')
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    handleFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    handleFile(file)
  }
}

const handleFile = async (file) => {
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB')
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  selectedFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  await uploadToIPFSAndSave(file)
}

const uploadToIPFSAndSave = async (file) => {
  try {
    const result = await uploadToIPFS(file)

    if (result.success) {
      form.image = result.url
    } else {
      console.error('IPFS upload failed:', result.error)
      alert('Failed to upload image to IPFS. Please try again.')
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('Failed to upload image. Please try again.')
  }
}

const removeImage = () => {
  imagePreview.value = null
  selectedFile.value = null
  form.image = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const retryUpload = async () => {
  if (selectedFile.value) {
    await uploadToIPFSAndSave(selectedFile.value)
  }
}

const saveCard = () => {
  const cardData = {
    image: form.image,
    title: form.title,
    description: form.description
  }

  emit('save', cardData)
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.modal.van-theme-dark {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
}

.modal.van-theme-dark .modal-content {
  background: var(--van-mainnet-network-background);
}

.modal.van-theme-dark .modal-title {
  color: var(--van-text-color);
  background: var(--van-mainnet-network-background);
}

.modal.van-theme-dark .form-label {
  color: #f9fafb;
}

.modal.van-theme-dark .form-input,
.modal.van-theme-dark .form-textarea {
  background-color: #374151;
  color: #ffffff;
  border-color: #4b5563;
}

.modal.van-theme-dark .upload-area {
  background-color: #374151;
  border-color: #4b5563;
}

.modal.van-theme-dark .upload-text {
  color: #f9fafb;
}

.modal.van-theme-dark .upload-hint {
  color: #9ca3af;
}

.modal.van-theme-dark .modal-actions {
  background: var(--van-mainnet-network-background);
  border-top: 1px solid #4b5563;
}

.modal-large {
  max-width: 600px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  width: 92%;
  padding: 2rem;
  border-radius: 16px;
  background: white;
  overflow-y: auto;
  max-height: calc(90vh - 4px);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  padding-top: 0.5rem;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background: white;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Image Upload Styles */
.image-upload-container {
  width: 100%;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.upload-area {
  width: 100%;
  height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.upload-content {
  text-align: center;
  color: #6b7280;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #9ca3af;
}

.upload-text {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.upload-hint {
  font-size: 0.875rem;
  margin: 0;
  color: #6b7280;
}

.upload-progress {
  width: 100%;
  padding: 1rem;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: #e0f2fe;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #0ea5e9;
  animation: progress-animation 2s ease-in-out infinite;
}

@keyframes progress-animation {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.progress-text {
  font-size: 0.875rem;
  color: #0369a1;
  margin: 0;
}

.upload-error {
  width: 100%;
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  text-align: center;
}

.error-text {
  font-size: 0.875rem;
  color: #dc2626;
  margin: 0 0 0.5rem 0;
}

.retry-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background-color: #b91c1c;
}

.loading-spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-error {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
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

.btn-secondary:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    margin: 0.5rem;
    border-radius: 12px;
    max-height: 95vh;
  }

  .modal-content {
    padding: 1.5rem;
    border-radius: 12px;
    max-height: calc(95vh - 4px);
  }

  .modal-title {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .modal-actions {
    flex-direction: column;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    padding-top: 1rem;
    margin-top: 0.5rem;
  }

  .btn {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }
}
</style>
