<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" :class="`van-theme-${theme}`" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit FAQ' : 'Add FAQ' }}
        </h3>
        <form @submit.prevent="saveFaq" class="modal-form">
          <div class="form-group">
            <label class="form-label">Question</label>
            <input v-model="form.question" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Answer</label>
            <textarea
              v-model="form.answer"
              class="form-textarea"
              rows="6"
              placeholder="Enter the answer shown on the FAQ card"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Order</label>
            <input v-model.number="form.order" type="number" min="0" class="form-input" />
            <p class="form-hint">Lower numbers appear first</p>
          </div>

          <label class="checkbox-row">
            <input v-model="form.isActive" type="checkbox" />
            <span>Active (visible on site)</span>
          </label>

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
  faqItem: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])

const theme = inject('theme', ref('light'))

const form = reactive({
  question: '',
  answer: '',
  order: 0,
  isActive: true
})

watch(
  () => props.faqItem,
  (item) => {
    if (item && Object.keys(item).length > 0) {
      form.question = item.question || ''
      form.answer = item.answer || ''
      form.order = item.order ?? 0
      form.isActive = item.isActive !== false
    } else {
      form.question = ''
      form.answer = ''
      form.order = 0
      form.isActive = true
    }
  },
  { immediate: true }
)

const closeModal = () => {
  emit('close')
}

const saveFaq = () => {
  emit('save', {
    question: form.question.trim(),
    answer: form.answer.trim(),
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal.van-theme-dark {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
}

.modal-content {
  width: 92%;
  padding: 2rem;
  border-radius: 16px;
  background: white;
  overflow-y: auto;
  max-height: calc(90vh - 4px);
}

.modal.van-theme-dark .modal-content {
  background: var(--van-mainnet-network-background);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem;
}

.modal.van-theme-dark .modal-title {
  color: var(--van-text-color);
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

.modal.van-theme-dark .form-label {
  color: #f9fafb;
}

.form-hint {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  font-family: inherit;
}

.modal.van-theme-dark .form-input,
.modal.van-theme-dark .form-textarea {
  background-color: #374151;
  color: #fff;
  border-color: #4b5563;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.modal.van-theme-dark .modal-actions {
  border-top-color: #4b5563;
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

.btn-secondary {
  background: #6b7280;
  color: white;
}
</style>
