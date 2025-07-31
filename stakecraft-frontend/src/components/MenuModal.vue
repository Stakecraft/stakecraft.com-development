<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">{{ editing ? 'Edit Menu Item' : 'Add Menu Item' }}</h3>
        <form @submit.prevent="saveItem" class="modal-form">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input v-model="form.name" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">URL</label>
            <input v-model="form.url" type="text" class="form-input" required />
          </div>
          <div class="form-group checkbox-group">
            <input v-model="form.active" type="checkbox" class="form-checkbox" />
            <label class="checkbox-label">Active</label>
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
  item: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  name: '',
  url: '',
  active: true
})

// Watch for changes in the item prop to populate form
watch(
  () => props.item,
  (newItem) => {
    if (newItem && Object.keys(newItem).length > 0) {
      form.name = newItem.name || ''
      form.url = newItem.url || ''
      form.active = newItem.active !== undefined ? newItem.active : true
    } else {
      // Reset form when adding new item
      form.name = ''
      form.url = ''
      form.active = true
    }
  },
  { immediate: true }
)

const closeModal = () => {
  emit('close')
}

const saveItem = () => {
  const itemData = {
    name: form.name,
    url: form.url,
    active: form.active
  }

  emit('save', itemData)
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

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox {
  width: auto;
  height: 1rem;
  width: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.25rem;
  background-color: #ffffff;
  cursor: pointer;
}

.checkbox-label {
  margin-bottom: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
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
