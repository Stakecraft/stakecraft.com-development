import { ref, computed, onMounted } from 'vue'
import prefetchedData from '../data/prefetched.json'
import { API_BASE_URL } from '../config/api.js'

// Fallback menu items (current hardcoded menu)
const fallbackMenuItems = [
  { title: 'Mainnet', link: '/#mainnet', metadata: { menuSection: 'center', isExternal: 'false' } },
  { title: 'Testnet', link: '/#testnet', metadata: { menuSection: 'center', isExternal: 'false' } },
  {
    title: 'FAQ',
    link: '/#faq',
    order: 3,
    metadata: { menuSection: 'center', isExternal: 'false' }
  },
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

const faqMenuItem = {
  title: 'FAQ',
  link: '/#faq',
  order: 3,
  isActive: true,
  metadata: { menuSection: 'center', isExternal: 'false' }
}

function sortMenuItems(items) {
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0))
}

function withFaqMenuItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return sortMenuItems(fallbackMenuItems)
  }

  const hasFaq = items.some(
    (item) => item.link === '/#faq' || /^faq$/i.test(String(item.title || '').trim())
  )
  if (hasFaq) {
    return sortMenuItems(items)
  }

  const testnetIndex = items.findIndex(
    (item) => item.link === '/#testnet' || item.title === 'Testnet'
  )
  const next = [...items]
  next.splice(testnetIndex >= 0 ? testnetIndex + 1 : next.length, 0, faqMenuItem)
  return sortMenuItems(next)
}

function getInitialMenuItems() {
  const prefetchedMenu = prefetchedData.menu
  if (Array.isArray(prefetchedMenu) && prefetchedMenu.length > 0) {
    return withFaqMenuItem(
      prefetchedMenu.filter((item) => item.isActive !== false)
    )
  }
  return sortMenuItems(fallbackMenuItems)
}

const menuItems = ref(getInitialMenuItems())
const loading = ref(false)
const error = ref(null)

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
        menuItems.value = withFaqMenuItem(data.data.filter((item) => item.isActive))
      } else {
        // Use fallback menu items if no items in database
        menuItems.value = sortMenuItems(fallbackMenuItems)
      }
    } catch (err) {
      console.warn('Failed to load menu items from API, using fallback:', err)
      error.value = err
      // Use fallback menu items if API fails
      menuItems.value = sortMenuItems(fallbackMenuItems)
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
