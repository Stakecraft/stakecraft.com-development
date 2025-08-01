<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit Team Member' : 'Add Team Member' }}
        </h3>
        <form @submit.prevent="saveTeamMember" class="modal-form">
          <div class="form-group">
            <label class="form-label">Profile Photo</label>
            <div class="image-upload-container">
              <div v-if="imagePreview || form.avatar" class="image-preview">
                <img
                  :src="imagePreview || form.avatar"
                  :alt="form.name || 'Team member photo'"
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
              <div v-if="uploading" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <p class="progress-text">Uploading to IPFS...</p>
              </div>
              <div v-if="uploadError" class="upload-error">
                <p class="error-text">{{ uploadError }}</p>
                <button type="button" @click="retryUpload" class="retry-btn">Retry Upload</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input v-model="form.name" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Position</label>
            <input v-model="form.position" type="text" class="form-input" required />
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
  teamMember: {
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
  name: '',
  position: '',
  image: ''
})

watch(
  () => props.teamMember,
  (newTeamMember) => {
    if (newTeamMember && Object.keys(newTeamMember).length > 0) {
      form.name = newTeamMember.name || ''
      form.position = newTeamMember.position || ''
      form.image = newTeamMember.image || ''
      imagePreview.value = newTeamMember.image || null
    } else {
      form.name = ''
      form.position = ''
      form.image = ''
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

const saveTeamMember = () => {
  console.log('form', form)

  const teamMemberData = {
    name: form.name,
    position: form.position,
    image: form.image
  }

  emit('save', teamMemberData)
}
</script>

<style scoped>
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
  border-radius: 0.75rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 28rem;
  width: 100%;
  z-index: 1001;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-large {
  max-width: 45rem;
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
  padding: 2rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-input:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 2px 4px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  background-color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-textarea:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 2px 4px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f9fafb;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.social-links-grid {
  display: grid;
  gap: 1rem;
}

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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
}

.modal-actions .btn {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  min-width: 100px;
  border: none;
  cursor: pointer;
}

.modal-actions .btn-secondary {
  background-color: #f9fafb;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.modal-actions .btn-secondary:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-actions .btn-primary {
  background-color: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
}

.modal-actions .btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
