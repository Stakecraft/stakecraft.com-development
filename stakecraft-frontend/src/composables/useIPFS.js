import { ref } from 'vue'
import { API_BASE_URL } from '../config/api.js'

export function useIPFS() {
  const uploading = ref(false)
  const uploadError = ref(null)

  // IPFS Gateway URL - you can change this to your preferred gateway
  const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

  // Utility function to validate IPFS URL
  const validateIPFSURL = (url) => {
    if (!url) return false

    // Check if it's a valid IPFS URL
    if (
      url.startsWith('https://ipfs.io/ipfs/') ||
      url.startsWith('http://ipfs.io/ipfs/') ||
      url.startsWith('https://gateway.pinata.cloud/ipfs/') ||
      url.startsWith('https://dweb.link/ipfs/')
    ) {
      return true
    }

    // Check if it's just a hash (Qm...)
    if (url.startsWith('Qm') && url.length > 40) {
      return true
    }

    return false
  }

  // Utility function to get IPFS URL from hash or URL
  const getIPFSURL = (hash) => {
    if (!hash) return null

    // If it's already a full URL, return as is
    if (hash.startsWith('http')) {
      return hash
    }

    // If it's just a hash, convert to full URL
    if (hash.startsWith('Qm')) {
      return `${IPFS_GATEWAY}${hash}`
    }

    return null
  }

  // Upload file to IPFS via backend proxy (keeps Pinata keys server-side)
  const uploadToIPFS = async (file) => {
    uploading.value = true
    uploadError.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(`${API_BASE_URL}/upload/ipfs`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      const ipfsHash = result.hash || result.IpfsHash

      return {
        success: true,
        hash: ipfsHash,
        url: `${IPFS_GATEWAY}${ipfsHash}`
      }
    } catch (error) {
      console.error('IPFS upload error:', error)
      uploadError.value = error.message
      return {
        success: false,
        error: error.message
      }
    } finally {
      uploading.value = false
    }
  }

  // Alternative upload method using a different IPFS service
  const uploadToIPFSAlternative = async (file) => {
    uploading.value = true
    uploadError.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Example using Infura IPFS (you need to set up an Infura account)
      const response = await fetch(`https://ipfs.infura.io:5001/api/v0/add`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      const ipfsHash = result.Hash

      return {
        success: true,
        hash: ipfsHash,
        url: `${IPFS_GATEWAY}${ipfsHash}`
      }
    } catch (error) {
      console.error('IPFS upload error:', error)
      uploadError.value = error.message
      return {
        success: false,
        error: error.message
      }
    } finally {
      uploading.value = false
    }
  }

  return {
    uploading,
    uploadError,
    uploadToIPFS,
    uploadToIPFSAlternative,
    getIPFSURL,
    validateIPFSURL
  }
}
