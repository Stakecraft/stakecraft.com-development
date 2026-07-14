import { ref, computed, onMounted } from 'vue'
import prefetchedData from '../data/prefetched.json'
import { API_BASE_URL } from '../config/api.js'

const menuItems = ref(getInitialMenuItems())
const loading = ref(false)
const error = ref(null)

// Fallback menu items (current hardcoded menu)
const fallbackMenuItems = [
  { title: 'Mainnet', link: '/#mainnet', metadata: { menuSection: 'center', isExternal: 'false' } },
  { title: 'Testnet', link: '/#testnet', metadata: { menuSection: 'center', isExternal: 'false' } },
  {
    title: 'Partnership',
    link: '/#partnership',
    metadata: { menuSection: 'center', isExternal: 'false' }
  },
  { title: 'Swap', link: '/swap', metadata: { menuSection: 'center', isExternal: 'false' } },
  {
    title: 'About Us',
    link: '/#aboutUs',
    metadata: { menuSection: 'center', isExternal: 'false' }
  },
  {
    title: 'Contacts',
    link: '/#contacts',
    metadata: { menuSection: 'center', isExternal: 'false' }
  },
  {
    title: 'Services',
    link: 'https://services.stakecraft.com/',
    metadata: { menuSection: 'right', isExternal: 'true' }
  },
  {
    title: 'Blog',
    link: 'https://stakecraft.medium.com/',
    metadata: { menuSection: 'right', isExternal: 'true' }
  }
]

function getInitialMenuItems() {
  const prefetchedMenu = prefetchedData.menu
  if (Array.isArray(prefetchedMenu) && prefetchedMenu.length > 0) {
    return prefetchedMenu
      .filter((item) => item.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }
  return fallbackMenuItems
}

export function useMenu() {
  const fetchMenuItems = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/content/menu`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // If we have menu items from the API, use them
      if (data.success && data.data && data.data.length > 0) {
        menuItems.value = data.data
          .filter((item) => item.isActive)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      } else {
        // Use fallback menu items if no items in database
        menuItems.value = fallbackMenuItems
      }
    } catch (err) {
      console.warn('Failed to load menu items from API, using fallback:', err)
      error.value = err
      // Use fallback menu items if API fails
      menuItems.value = fallbackMenuItems
    } finally {
      loading.value = false
    }
  }

  // Computed properties for different menu sections
  const centerMenuItems = computed(() =>
    menuItems.value.filter(
      (item) => item.metadata?.menuSection === 'center' || !item.metadata?.menuSection
    )
  )

  const rightMenuItems = computed(() =>
    menuItems.value.filter((item) => item.metadata?.menuSection === 'right')
  )

  // Initialize on first use
  onMounted(() => {
    fetchMenuItems()
  })

  return {
    menuItems,
    centerMenuItems,
    rightMenuItems,
    loading,
    error,
    fetchMenuItems
  }
}
