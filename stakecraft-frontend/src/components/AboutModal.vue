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
  console.log('form', form)

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
