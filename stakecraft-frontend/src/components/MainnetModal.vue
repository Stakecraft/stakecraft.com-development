<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit Mainnet Card' : 'Add Mainnet Card' }}
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
            <label class="form-label">Validators (one per line)</label>
            <textarea
              v-model="form.validatorText"
              class="form-textarea"
              rows="3"
              placeholder="Enter validator addresses, one per line"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Explorer URLs (one per line)</label>
            <textarea
              v-model="form.explorerText"
              class="form-textarea"
              rows="3"
              placeholder="Enter explorer URLs, one per line"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">How to Stake URL</label>
            <input
              v-model="form.howToStake"
              type="url"
              class="form-input"
              placeholder="Enter how to stake guide URL"
            />
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
import { ref, reactive, watch } from 'vue'
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
const { uploading, uploadError, uploadToIPFS } = useIPFS()
const fileInput = ref(null)
const imagePreview = ref(null)
const selectedFile = ref(null)

const form = reactive({
  image: '',
  title: '',
  description: '',
  validatorText: '',
  explorerText: '',
  howToStake: ''
})

watch(
  () => props.card,
  (newCard) => {
    if (newCard && Object.keys(newCard).length > 0) {
      form.image = newCard.image || ''
      form.title = newCard.title || ''
      form.description = newCard.description || ''
      form.validatorText = newCard.validator || ''
      form.explorerText = newCard.explorer || ''
      form.howToStake = newCard.howToStake || ''
      imagePreview.value = newCard.image || null
    } else {
      form.image = ''
      form.title = ''
      form.description = ''
      form.validatorText = ''
      form.explorerText = ''
      form.howToStake = ''
      imagePreview.value = null
      selectedFile.value = null
    }
  },
  { immediate: true }
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
      console.log('Image uploaded to IPFS:', result.url)
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
  console.log('form', form)

  const cardData = {
    image: form.image,
    title: form.title,
    description: form.description,
    validator: form.validatorText,
    explorer: form.explorerText,
    howToStake: form.howToStake
  }

  emit('save', cardData)
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 1rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 32rem;
  width: 100%;
  z-index: 1001;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
  overflow: hidden;
}

.modal-large {
  max-width: 50rem;
  max-height: 100vh;
  overflow-y: auto;
}

.modal-two {
  display: flex;
  flex-direction: row;
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
  padding: 0;
}

.modal-title {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: #1f2937;
  padding: 1.5rem 2rem;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

.modal-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

/* Image Upload Styles */
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-preview {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.preview-image {
  width: 100%;
  max-width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 1rem;
  border: 3px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.remove-image-btn:hover {
  background: #b91c1c;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #667eea;
  background-color: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(102, 126, 234, 0.15);
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s;
}

.upload-area:hover::before {
  left: 100%;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #6b7280;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #eff6ff;
  border-radius: 0.5rem;
  border: 1px solid #bfdbfe;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e7ff;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 4px;
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

.loading-spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.progress-text {
  font-size: 0.875rem;
  color: #1e40af;
  margin: 0;
  text-align: center;
}

.upload-error {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #fef2f2;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.error-text {
  font-size: 0.875rem;
  color: #dc2626;
  margin: 0;
  text-align: center;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background-color: #b91c1c;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.form-input:hover {
  border-color: #d1d5db;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background-color: #ffffff;
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.form-textarea:hover {
  border-color: #d1d5db;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background-color: #ffffff;
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem 2rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.modal-actions .btn {
  padding: 0.875rem 2rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  min-width: 120px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.modal-actions .btn-secondary {
  background-color: #ffffff;
  color: #64748b;
  border: 2px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.modal-actions .btn-secondary:hover:not(:disabled) {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
}

.modal-actions .btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
}

.modal-actions .btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(102, 126, 234, 0.5);
}
</style>
