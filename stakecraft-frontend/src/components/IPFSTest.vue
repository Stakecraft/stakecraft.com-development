<template>
  <div class="ipfs-test">
    <h2>IPFS Upload Test</h2>

    <div class="upload-section">
      <input type="file" accept="image/*" @change="handleFileSelect" ref="fileInput" />
      <button @click="handleUpload" :disabled="!selectedFile || uploading">
        {{ uploading ? 'Uploading...' : 'Upload to IPFS' }}
      </button>
    </div>

    <div v-if="uploadError" class="error">Error: {{ uploadError }}</div>

    <div v-if="uploadResult" class="result">
      <h3>Upload Result:</h3>
      <p><strong>Hash:</strong> {{ uploadResult.hash }}</p>
      <p>
        <strong>URL:</strong> <a :href="uploadResult.url" target="_blank">{{ uploadResult.url }}</a>
      </p>
      <div v-if="uploadResult.url" class="image-preview">
        <img :src="uploadResult.url" alt="Uploaded image" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useIPFS } from '../composables/useIPFS.js'

export default {
  name: 'IPFSTest',
  setup() {
    const { uploadToIPFS, uploading, uploadError } = useIPFS()
    const selectedFile = ref(null)
    const uploadResult = ref(null)
    const fileInput = ref(null)

    const handleFileSelect = (event) => {
      selectedFile.value = event.target.files[0]
    }

    const handleUpload = async () => {
      if (!selectedFile.value) return

      const result = await uploadToIPFS(selectedFile.value)
      if (result.success) {
        uploadResult.value = result
      }
    }

    return {
      selectedFile,
      uploadResult,
      uploading,
      uploadError,
      fileInput,
      handleFileSelect,
      handleUpload
    }
  }
}
</script>

<style scoped>
.ipfs-test {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.upload-section {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.error {
  color: red;
  margin: 1rem 0;
  padding: 1rem;
  background: #fee;
  border-radius: 4px;
}

.result {
  margin: 1rem 0;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 4px;
}

.image-preview {
  margin-top: 1rem;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

input[type='file'] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
