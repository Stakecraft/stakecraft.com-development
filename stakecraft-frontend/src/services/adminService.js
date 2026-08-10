// Admin API Service
import { authHeaders, clearSession } from './authService'
import { API_BASE_URL } from '../config/api.js'

// Broadcast rather than importing the router here: the router imports the
// views, the views import this service, and closing that loop would create a
// circular import.
const notifyUnauthorized = () => {
  window.dispatchEvent(new CustomEvent('auth:unauthorized'))
}

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearSession()
      notifyUnauthorized()
      throw new Error('Your session has expired. Please sign in again.')
    }
    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.')
    }
    if (response.status === 429) {
      throw new Error('Too many requests. Please slow down and try again shortly.')
    }

    const errorData = await response.json().catch(() => null)
    const errorMessage =
      errorData?.message || errorData?.error || `HTTP error! status: ${response.status}`
    console.error('API call failed:', endpoint, response.status, errorMessage)
    throw new Error(errorMessage)
  }

  return await response.json()
}

// Menu Items API
export const menuService = {
  async getAll() {
    return apiCall('/content/menu')
  },

  async create(menuData) {
    return apiCall('/content/menu', {
      method: 'POST',
      body: JSON.stringify(menuData)
    })
  },

  async update(id, menuData) {
    return apiCall(`/content/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuData)
    })
  },

  async delete(id) {
    return apiCall(`/content/menu/${id}`, {
      method: 'DELETE'
    })
  }
}

export const mainnetService = {
  /** @param {boolean} [includeHidden] — admin: pass true to list hidden cards */
  async getAll(includeHidden = false) {
    const q = includeHidden ? '?includeHidden=true' : ''
    return apiCall(`/mainnet/${q}`, {
      method: 'GET'
    })
  },

  async create(cardData) {
    return apiCall('/mainnet/', {
      method: 'POST',
      body: JSON.stringify(cardData)
    })
  },

  async update(id, cardData) {
    return apiCall(`/mainnet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cardData)
    })
  },

  async delete(id) {
    return apiCall(`/mainnet/${id}`, {
      method: 'DELETE'
    })
  },

  async updatePositions(positions) {
    return apiCall('/mainnet/positions/update', {
      method: 'PUT',
      body: JSON.stringify({ positions })
    })
  },

  async migrateToTestnet(ids) {
    return apiCall('/mainnet/migrate-to-testnet', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }
}

// Testnet Cards API
export const testnetService = {
  async getAll(includeHidden = false) {
    const q = includeHidden ? '?includeHidden=true' : ''
    return apiCall(`/testnet${q}`)
  },

  async create(cardData) {
    return apiCall('/testnet', {
      method: 'POST',
      body: JSON.stringify(cardData)
    })
  },

  async update(id, cardData) {
    return apiCall(`/testnet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cardData)
    })
  },

  async delete(id) {
    return apiCall(`/testnet/${id}`, {
      method: 'DELETE'
    })
  },

  async updatePositions(positions) {
    return apiCall('/testnet/positions/update', {
      method: 'PUT',
      body: JSON.stringify({ positions })
    })
  },

  async migrateToMainnet(ids) {
    return apiCall('/testnet/migrate-to-mainnet', {
      method: 'POST',
      body: JSON.stringify({ ids })
    })
  }
}

// Partnerships API
export const partnershipService = {
  async getAll(includeHidden = false) {
    const q = includeHidden ? '?includeHidden=true' : ''
    return apiCall(`/partnership${q}`)
  },

  async create(partnershipData) {
    return apiCall('/partnership', {
      method: 'POST',
      body: JSON.stringify(partnershipData)
    })
  },

  async update(id, partnershipData) {
    return apiCall(`/partnership/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnershipData)
    })
  },

  async delete(id) {
    return apiCall(`/partnership/${id}`, {
      method: 'DELETE'
    })
  }
}

// Team Members API
export const teamService = {
  async getAll() {
    return apiCall('/team')
  },

  async create(memberData) {
    return apiCall('/team', {
      method: 'POST',
      body: JSON.stringify(memberData)
    })
  },

  async update(id, memberData) {
    return apiCall(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    })
  },

  async delete(id) {
    return apiCall(`/team/${id}`, {
      method: 'DELETE'
    })
  }
}

// Products (portfolio / previous projects)
export const productService = {
  async getAll() {
    return apiCall('/products')
  },

  async create(data) {
    return apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async update(id, data) {
    return apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  async delete(id) {
    return apiCall(`/products/${id}`, {
      method: 'DELETE'
    })
  }
}

// About Content API
export const aboutService = {
  async getAll() {
    return apiCall('/about')
  },

  async getByType(type) {
    return apiCall(`/about?type=${type}`)
  },

  async create(aboutData) {
    return apiCall('/about', {
      method: 'POST',
      body: JSON.stringify(aboutData)
    })
  },

  async update(id, aboutData) {
    return apiCall(`/about/${id}`, {
      method: 'PUT',
      body: JSON.stringify(aboutData)
    })
  },

  async delete(id) {
    return apiCall(`/about/${id}`, {
      method: 'DELETE'
    })
  }
}

// FAQ API
export const faqService = {
  async getAll() {
    return apiCall('/faq')
  },

  async create(faqData) {
    return apiCall('/faq', {
      method: 'POST',
      body: JSON.stringify(faqData)
    })
  },

  async update(id, faqData) {
    return apiCall(`/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faqData)
    })
  },

  async delete(id) {
    return apiCall(`/faq/${id}`, {
      method: 'DELETE'
    })
  }
}
