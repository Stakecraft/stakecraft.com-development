// Admin API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Menu Items API
export const menuService = {
  // Get all menu items
  async getAll() {
    return apiCall('/admin/menu-items')
  },

  // Create new menu item
  async create(menuData) {
    return apiCall('/admin/menu-items', {
      method: 'POST',
      body: JSON.stringify(menuData)
    })
  },

  // Update menu item
  async update(id, menuData) {
    return apiCall(`/admin/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuData)
    })
  },

  // Delete menu item
  async delete(id) {
    return apiCall(`/admin/menu-items/${id}`, {
      method: 'DELETE'
    })
  }
}

export const mainnetService = {
  async getAll() {
    return apiCall('/mainnet/', {
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
  }
}

// Testnet Cards API
export const testnetService = {
  // Get all testnet cards
  async getAll() {
    return apiCall('/testnet')
  },

  // Create new testnet card
  async create(cardData) {
    return apiCall('/testnet', {
      method: 'POST',
      body: JSON.stringify(cardData)
    })
  },

  // Update testnet card
  async update(id, cardData) {
    return apiCall(`/testnet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cardData)
    })
  },

  // Delete testnet card
  async delete(id) {
    return apiCall(`/testnet/${id}`, {
      method: 'DELETE'
    })
  }
}

// Partnerships API
export const partnershipService = {
  // Get all partnerships
  async getAll() {
    return apiCall('/partnership')
  },

  // Create new partnership
  async create(partnershipData) {
    return apiCall('/partnership', {
      method: 'POST',
      body: JSON.stringify(partnershipData)
    })
  },

  // Update partnership
  async update(id, partnershipData) {
    return apiCall(`/partnership/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnershipData)
    })
  },

  // Delete partnership
  async delete(id) {
    return apiCall(`/partnership/${id}`, {
      method: 'DELETE'
    })
  }
}

// Team Members API
export const teamService = {
  // Get all team members
  async getAll() {
    return apiCall('/team')
  },

  // Create new team member
  async create(memberData) {
    return apiCall('/team', {
      method: 'POST',
      body: JSON.stringify(memberData)
    })
  },

  // Update team member
  async update(id, memberData) {
    return apiCall(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    })
  },

  // Delete team member
  async delete(id) {
    return apiCall(`/team/${id}`, {
      method: 'DELETE'
    })
  }
}

// About Content API
export const aboutService = {
  // Get about content
  async getAll() {
    return apiCall('/about')
  },

  // Get about content by type
  async getByType(type) {
    return apiCall(`/about?type=${type}`)
  },

  // Create new about content
  async create(aboutData) {
    return apiCall('/about', {
      method: 'POST',
      body: JSON.stringify(aboutData)
    })
  },

  // Update about content
  async update(id, aboutData) {
    return apiCall(`/about/${id}`, {
      method: 'PUT',
      body: JSON.stringify(aboutData)
    })
  },

  // Delete about content
  async delete(id) {
    return apiCall(`/about/${id}`, {
      method: 'DELETE'
    })
  }
}
