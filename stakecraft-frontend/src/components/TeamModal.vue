<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" :class="`van-theme-${theme}`" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit Team Member' : 'Add Team Member' }}
        </h3>
        <form @submit.prevent="saveTeamMember" class="modal-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input v-model="form.name" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Position</label>
            <textarea v-model="form.position" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">LinkedIn Profile URL</label>
            <input
              v-model="form.linkedin"
              type="url"
              class="form-input"
              placeholder="https://www.linkedin.com/in/username"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, inject } from 'vue'

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

// Theme injection
const theme = inject('theme', ref('light'))

const form = reactive({
  name: '',
  position: '',
  linkedin: ''
})

watch(
  () => props.teamMember,
  (newTeamMember) => {
    if (newTeamMember && Object.keys(newTeamMember).length > 0) {
      form.name = newTeamMember.name || ''
      form.position = newTeamMember.position || ''
      form.linkedin = newTeamMember.linkedin || ''
    } else {
      form.name = ''
      form.position = ''
      form.linkedin = ''
    }
  },
  { immediate: true }
)

const closeModal = () => {
  emit('close')
}

const saveTeamMember = () => {
  const teamMemberData = {
    name: form.name,
    position: form.position,
    linkedin: form.linkedin
  }

  emit('save', teamMemberData)
}
</script>

<style scoped>
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

/* Dark mode styles */
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
  /* border: 2px solid #e5e7eb; */
}

.preview-image {
  width: 100%;
  height: 100%;
  /* object-fit: cover; */
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
