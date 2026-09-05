import { ref } from 'vue'
import { API_BASE_URL } from '../config/api.js'
import { authHeaders } from '../services/authService'
import { isIpfsUrl, toPinataGatewayUrl } from '../utils/ipfsGateway.js'

export function useIPFS() {
  const uploading = ref(false)
  const uploadError = ref(null)

  const validateIPFSURL = (url) => isIpfsUrl(url)

  const getIPFSURL = (hash) => toPinataGatewayUrl(hash)

  /**
   * Uploads an image to IPFS through the backend.
   *
   * This used to call api.pinata.cloud directly from the browser using
   * VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY. Vite inlines every VITE_
   * variable into the production bundle, so those credentials were readable by
   * anyone who opened the site and could be used to pin arbitrary content to
   * the account. The keys now live only on the server, which authenticates the
   * uploader before forwarding the file to Pinata.
   */
  const uploadToIPFS = async (file) => {
    uploading.value = true
    uploadError.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/upload/ipfs`, {
        method: 'POST',
        // No Content-Type header: the browser sets it with the multipart
        // boundary. Only the auth header is added.
        headers: { ...authHeaders() },
        body: formData
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.')
        }
        throw new Error(result.message || `IPFS upload failed (${response.status})`)
      }

      const hash = result.hash || result.IpfsHash

      return {
        success: true,
        hash,
        url: toPinataGatewayUrl(result.url || hash)
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
        url: toPinataGatewayUrl(ipfsHash)
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
