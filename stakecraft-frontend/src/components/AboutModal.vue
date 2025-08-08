<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit About Content' : 'Add About Content' }}
        </h3>
        <form @submit.prevent="saveAboutContent" class="modal-form">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input v-model="form.title" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Content</label>
            <textarea
              v-model="form.content"
              class="form-textarea"
              rows="6"
              placeholder="Enter about content"
              required
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ editing ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  editing: {
    type: Boolean,
    default: false
  },
  aboutContent: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  title: '',
  content: ''
})

watch(
  () => props.aboutContent,
  (newContent) => {
    if (newContent && Object.keys(newContent).length > 0) {
      form.title = newContent.title || ''
      form.content = newContent.content || ''
    } else {
      form.title = ''
      form.content = ''
    }
  },
  { immediate: true }
)

const closeModal = () => {
  emit('close')
}

const saveAboutContent = () => {
  const contentData = {
    title: form.title,
    content: form.content
  }

  emit('save', contentData)
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
