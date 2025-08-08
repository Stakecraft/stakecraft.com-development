<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal modal-large" @click.stop>
      <div class="modal-content">
        <h3 class="modal-title">
          {{ editing ? 'Edit Menu Item' : 'Add Menu Item' }}
        </h3>
        <form @submit.prevent="saveMenuItem" class="modal-form">
          <div class="form-group">
            <label class="form-label">Menu Item Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Enter menu item name"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">URL/Link *</label>
            <input
              v-model="form.url"
              type="text"
              class="form-input"
              placeholder="Enter URL (e.g., /#mainnet, /swap, https://services.stakecraft.com/)"
              required
            />
            <div class="form-hint">
              <p>Examples:</p>
              <ul>
                <li>
                  Internal links: <code>/#mainnet</code>, <code>/swap</code>, <code>/#aboutUs</code>
                </li>
                <li>
                  External links: <code>https://services.stakecraft.com/</code>,
                  <code>https://stakecraft.medium.com/</code>
                </li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Display Order</label>
            <input
              v-model.number="form.order"
              type="number"
              min="0"
              class="form-input"
              placeholder="Enter display order (0 = first)"
            />
            <div class="form-hint">Lower numbers appear first in the menu</div>
            <div v-if="orderError" class="form-error">{{ orderError }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.isActive" type="checkbox" class="checkbox-input" />
                <span class="checkbox-text">Active (visible in menu)</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Menu Section</label>
            <select v-model="form.menuSection" class="form-select">
              <option value="center">Center Menu (Mainnet, Testnet, etc.)</option>
              <option value="right">Right Menu (Services, Blog)</option>
            </select>
            <div class="form-hint">Choose where this menu item should appear</div>
          </div>

          <div class="form-group">
            <label class="form-label">External Link</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input v-model="form.isExternal" type="checkbox" class="checkbox-input" />
                <span class="checkbox-text">Open in new tab (for external links)</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || isDuplicateOrder"
            >
              {{ isSubmitting ? 'Saving...' : editing ? 'Update' : 'Create' }} Menu Item
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
  menuItem: {
    type: Object,
    default: () => ({})
  },
  existingMenuItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  name: '',
  url: '',
  order: 0,
  isActive: true,
  menuSection: 'center',
  isExternal: false
})

const orderError = ref('')
const isSubmitting = ref(false)
const isDuplicateOrder = ref(false)

// Watch for menuItem changes to populate form
watch(
  () => props.menuItem,
  (newMenuItem) => {
    if (newMenuItem && Object.keys(newMenuItem).length > 0) {
      form.name = newMenuItem.title || ''
      form.url = newMenuItem.link || ''
      form.order = newMenuItem.order || 0
      form.isActive = newMenuItem.isActive !== false
      form.menuSection = newMenuItem.metadata?.menuSection || 'center'
      form.isExternal = newMenuItem.metadata?.isExternal === 'true'
    } else {
      // Reset form for new item
      form.name = ''
      form.url = ''
      form.order = 0
      form.isActive = true
      form.menuSection = 'center'
      form.isExternal = false
    }
    // Clear errors when form resets
    orderError.value = ''
    isDuplicateOrder.value = false
  },
  { immediate: true }
)

// Clear order error and check for duplicates when order changes
watch(
  () => form.order,
  (newOrder) => {
    orderError.value = ''

    // Check for duplicate order in real-time
    if (newOrder !== undefined && newOrder !== null && newOrder !== '') {
      const currentItemId = props.menuItem?._id
      const duplicate = props.existingMenuItems.find(
        (item) => item.order === newOrder && item._id !== currentItemId
      )

      if (duplicate) {
        isDuplicateOrder.value = true
        orderError.value = `Order ${newOrder} is already taken by "${duplicate.title}". Please choose a different order number.`
      } else {
        isDuplicateOrder.value = false
      }
    } else {
      isDuplicateOrder.value = false
    }
  }
)

const closeModal = () => {
  // Reset all states when closing
  isSubmitting.value = false
  orderError.value = ''
  isDuplicateOrder.value = false
  emit('close')
}

// Expose method to reset submission state (called from parent)
const resetSubmissionState = () => {
  isSubmitting.value = false
}

// Expose methods for parent component
defineExpose({
  resetSubmissionState
})

const saveMenuItem = () => {
  // Don't submit if there's a duplicate order
  if (isDuplicateOrder.value) {
    return
  }

  // Clear previous errors
  orderError.value = ''

  // Validate form
  if (!form.name.trim() || !form.url.trim()) {
    alert('Please fill in all required fields')
    return
  }

  isSubmitting.value = true

  // Prepare data for backend
  const menuData = {
    type: 'menu',
    title: form.name.trim(),
    link: form.url.trim(),
    order: form.order || 0,
    isActive: form.isActive,
    metadata: {
      menuSection: form.menuSection,
      isExternal: form.isExternal.toString()
    }
  }

  emit('save', menuData)
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
  overflow: hidden; /* Hide overflow to ensure clean borders */
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-large {
  max-width: 600px;
}

.modal-content {
  padding: 2rem;
  border-radius: 16px; /* Match parent border radius */
  background: white;
  overflow-y: auto;
  max-height: calc(90vh - 4px); /* Account for border */
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
.form-select {
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
.form-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-hint p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.form-hint ul {
  margin: 0;
  padding-left: 1rem;
}

.form-hint li {
  margin-bottom: 0.25rem;
}

.form-hint code {
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.form-error {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
  font-weight: 500;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #6366f1;
}

.checkbox-text {
  user-select: none;
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
