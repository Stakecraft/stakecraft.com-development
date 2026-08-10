import { ref, computed } from 'vue'
import axios from 'axios'
import prefetchedData from '../data/prefetched.json'
import { API_BASE_URL } from '../config/api.js'

// IPFS Gateway URL
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export function useContent() {
  const mainnet = ref(prefetchedData.mainnet || [])
  const testnet = ref(prefetchedData.testnet || [])
  const partnerships = ref(prefetchedData.partnership || [])
  const about = ref(prefetchedData.about || [])
  const team = ref(prefetchedData.team || [])
  const faq = ref(prefetchedData.faq || [])
  const menu = ref(prefetchedData.menu || [])
  const products = ref([])

  // Individual loading states for each section
  const loading = ref({
    mainnet: false,
    testnet: false,
    partnerships: false,
    about: false,
    team: false,
    faq: false,
    menu: false,
    products: false
  })

  // Individual error states for each section
  const error = ref({
    mainnet: null,
    testnet: null,
    partnerships: null,
    about: null,
    team: null,
    faq: null,
    menu: null,
    products: null
  })

  // Helper function to convert IPFS hash to URL
  const getIPFSURL = (hash) => {
    if (!hash) return null
    // Check if it's already a full URL
    if (hash.startsWith('http')) return hash
    // Convert IPFS hash to URL
    return `${IPFS_GATEWAY}${hash}`
  }

  // Helper function to process content with IPFS images
  const normalizeImageList = (urls) => {
    if (!Array.isArray(urls)) return []
    return urls.map((u) => (u ? getIPFSURL(u) : null)).filter(Boolean)
  }

  const processContentWithIPFS = (content) => {
    if (!content) return content

    if (Array.isArray(content)) {
      return content.map((item) => ({
        ...item,
        image: item.image ? getIPFSURL(item.image) : null,
        images: item.images ? normalizeImageList(item.images) : item.images
      }))
    }

    return {
      ...content,
      image: content.image ? getIPFSURL(content.image) : null,
      images: content.images ? normalizeImageList(content.images) : content.images
    }
  }

  const extractListPayload = (responseData) => {
    const payload = responseData?.data ?? responseData
    if (!Array.isArray(payload)) {
      throw new Error('API returned non-array payload')
    }
    return payload
  }

  const fetchMainnet = async () => {
    const hasCachedData = Array.isArray(mainnet.value) && mainnet.value.length > 0
    try {
      if (!hasCachedData) {
        loading.value.mainnet = true
      }
      error.value.mainnet = null
      const response = await axios.get(`${API_BASE_URL}/mainnet/`)
      mainnet.value = processContentWithIPFS(extractListPayload(response.data))
    } catch (err) {
      if (!hasCachedData) {
        error.value.mainnet = err.message
      }
      console.error('Error fetching mainnet:', err)
    } finally {
      loading.value.mainnet = false
    }
  }

  const fetchTestnet = async () => {
    const hasCachedData = Array.isArray(testnet.value) && testnet.value.length > 0
    try {
      if (!hasCachedData) {
        loading.value.testnet = true
      }
      error.value.testnet = null
      const response = await axios.get(`${API_BASE_URL}/testnet/`)
      testnet.value = processContentWithIPFS(extractListPayload(response.data))
    } catch (err) {
      if (!hasCachedData) {
        error.value.testnet = err.message
      }
      console.error('Error fetching testnet:', err)
    } finally {
      loading.value.testnet = false
    }
  }

  const fetchPartnerships = async () => {
    const hasCachedData = Array.isArray(partnerships.value) && partnerships.value.length > 0
    try {
      if (!hasCachedData) {
        loading.value.partnerships = true
      }
      error.value.partnerships = null
      const response = await axios.get(`${API_BASE_URL}/partnership/`)
      partnerships.value = processContentWithIPFS(extractListPayload(response.data))
    } catch (err) {
      if (!hasCachedData) {
        error.value.partnerships = err.message
      }
      console.error('Error fetching partnerships:', err)
    } finally {
      loading.value.partnerships = false
    }
  }

  const fetchProducts = async () => {
    try {
      loading.value.products = true
      error.value.products = null
      const response = await axios.get(`${API_BASE_URL}/products/`)
      const raw = response.data?.data || response.data || []
      const list = Array.isArray(raw) ? raw : []
      products.value = list.map((item) => ({
        ...item,
        images: normalizeImageList(item.images || [])
      }))
    } catch (err) {
      error.value.products = err.message
      console.error('Error fetching products:', err)
    } finally {
      loading.value.products = false
    }
  }

  const fetchAbout = async () => {
    const hasCachedData = Array.isArray(about.value) && about.value.length > 0
    try {
      if (!hasCachedData) {
        loading.value.about = true
      }
      error.value.about = null
      const response = await axios.get(`${API_BASE_URL}/about/`)
      about.value = processContentWithIPFS(extractListPayload(response.data))
    } catch (err) {
      if (!hasCachedData) {
        error.value.about = err.message
      }
      console.error('Error fetching about:', err)
    } finally {
      loading.value.about = false
    }
  }

  const fetchTeam = async () => {
    const hasCachedData = Array.isArray(team.value) && team.value.length > 0
    try {
      if (!hasCachedData) {
        loading.value.team = true
      }
      error.value.team = null
      const response = await axios.get(`${API_BASE_URL}/team/`)
      team.value = processContentWithIPFS(extractListPayload(response.data))
    } catch (err) {
      if (!hasCachedData) {
        error.value.team = err.message
      }
      console.error('Error fetching team:', err)
    } finally {
      loading.value.team = false
    }
  }

  const fetchFaq = async () => {
    const hasCachedData = Array.isArray(faq.value) && faq.value.length > 0
    try {
      if (!hasCachedData) {
        loading.value.faq = true
      }
      error.value.faq = null
      const response = await axios.get(`${API_BASE_URL}/faq/`)
      faq.value = extractListPayload(response.data)
    } catch (err) {
      if (!hasCachedData) {
        error.value.faq = err.message
      }
      console.error('Error fetching FAQ:', err)
    } finally {
      loading.value.faq = false
    }
  }

  // Get mainnet networks
  const getMainnetNetworks = computed(() => {
    if (!mainnet.value || !Array.isArray(mainnet.value)) return []
    return [...mainnet.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const getTestnetNetworks = computed(() => {
    if (!testnet.value || !Array.isArray(testnet.value)) return []
    return [...testnet.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const getPartnerships = computed(() => {
    return partnerships.value
  })

  const getAboutContent = computed(() => {
    return about.value
  })

  const getTeamMembers = computed(() => {
    return team.value
  })

  const getFaqItems = computed(() => {
    if (!Array.isArray(faq.value)) return []
    return [...faq.value]
      .filter((item) => item.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const getMenuItems = computed(() => {
    return menu.value
  })

  const getProducts = computed(() => {
    if (!products.value || !Array.isArray(products.value)) return []
    return [...products.value]
      .filter((p) => p.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  return {
    // content
    mainnet,
    testnet,
    partnerships,
    about,
    team,
    faq,
    menu,
    products,
    loading,
    error,
    fetchMainnet,
    fetchTestnet,
    fetchPartnerships,
    fetchProducts,
    fetchAbout,
    fetchTeam,
    fetchFaq,
    getMainnetNetworks,
    getTestnetNetworks,
    getPartnerships,
    getAboutContent,
    getTeamMembers,
    getFaqItems,
    getMenuItems,
    getProducts,
    getIPFSURL,
    processContentWithIPFS
  }
}
