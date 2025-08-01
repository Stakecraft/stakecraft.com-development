<template>
  <div class="admin-container">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <!-- <h1 class="sidebar-title">StakeCraft Admin</h1> -->
      </div>
      <nav class="sidebar-nav">
        <div class="nav-items">
          <button
            v-for="item in menuItems"
            :key="item.id"
            @click="activeSection = item.id"
            :class="['nav-item', { 'nav-item-active': activeSection === item.id }]"
          >
            <component :is="item.icon" class="nav-icon" />
            {{ item.name }}
          </button>
        </div>
      </nav>
    </div>

    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Main content -->
    <div class="main-content">
      <header class="top-bar">
        <div class="top-bar-content">
          <div class="top-bar-left">
            <button @click="sidebarOpen = !sidebarOpen" class="mobile-menu-btn">
              <Menu class="menu-icon" />
            </button>
            <h2 class="page-title">{{ getCurrentSectionTitle() }}</h2>
          </div>
          <div class="top-bar-right">
            <button class="notification-btn">
              <Bell class="bell-icon" />
            </button>
            <div class="user-avatar"></div>
          </div>
        </div>
      </header>

      <!-- Content area -->
      <main class="content-area">
        <!-- Menu Items Section -->
        <div v-if="activeSection === 'menu'" class="section">
          <div class="section-header">
            <h3 class="section-title">Menu Items Management</h3>
            <button @click="showMenuModal = true" class="btn btn-primary">
              <Plus class="btn-icon" />
              Add Menu Item
            </button>
          </div>

          <div v-if="loading.menu" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading menu items...</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="menu in menuData" :key="menu.id" class="table-row">
                  <td class="table-cell font-medium">{{ menu.name }}</td>
                  <td class="table-cell">{{ menu.url }}</td>
                  <td class="table-cell">
                    <span
                      :class="['status-badge', menu.active ? 'status-active' : 'status-inactive']"
                    >
                      {{ menu.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <div class="action-buttons">
                      <button @click="editMenuItem(menu)" class="action-btn edit-btn">
                        <Edit class="action-icon" />
                      </button>
                      <button @click="deleteMenuItem(menu.id)" class="action-btn delete-btn">
                        <Trash2 class="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mainnet Cards Section -->
        <div v-if="activeSection === 'mainnet'" class="section">
          <div class="section-header">
            <h3 class="section-title">Mainnet Cards</h3>
            <button @click="showMainnetModal = true" class="btn btn-primary">
              <Plus class="btn-icon" />
              Add Mainnet Card
            </button>
          </div>

          <div v-if="loading.mainnet" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading mainnet cards...</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Network</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="card in mainnetCards" :key="card.id" class="table-row">
                  <td class="table-cell">
                    <div class="network-cell">
                      <img
                        v-if="card.image"
                        :src="card.image"
                        :alt="card.title"
                        class="network-image"
                        @error="handleImageError"
                        @load="handleImageLoad"
                      />
                      <div v-else class="image-placeholder-small">
                        <ImageIcon class="placeholder-icon-small" />
                      </div>
                    </div>
                  </td>
                  <td class="table-cell font-medium">{{ card.title }}</td>
                  <td class="table-cell">{{ card.description.slice(0, 70) }}...</td>
                  <td class="table-cell">
                    <div class="action-buttons">
                      <button @click="editMainnetCard(card)" class="action-btn edit-btn">
                        <Edit class="action-icon" />
                      </button>
                      <button @click="deleteMainnetCard(card._id)" class="action-btn delete-btn">
                        <Trash2 class="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeSection === 'testnet'" class="section">
          <div class="section-header">
            <h3 class="section-title">Testnet Cards</h3>
            <button @click="showTestnetModal = true" class="btn btn-primary">
              <Plus class="btn-icon" />
              Add Testnet Card
            </button>
          </div>

          <div v-if="loading.testnet" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading testnet cards...</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Network</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="card in testnetCards" :key="card.id" class="table-row">
                  <td class="table-cell">
                    <div class="network-cell">
                      <img
                        v-if="card.image"
                        :src="card.image"
                        :alt="card.title"
                        class="network-image"
                      />
                      <div v-else class="image-placeholder-small">
                        <ImageIcon class="placeholder-icon-small" />
                      </div>
                    </div>
                  </td>
                  <td class="table-cell font-medium">{{ card.title }}</td>
                  <td class="table-cell">{{ card.description }}</td>
                  <td class="table-cell">
                    <div class="action-buttons">
                      <button @click="editTestnetCard(card)" class="action-btn edit-btn">
                        <Edit class="action-icon" />
                      </button>
                      <button @click="deleteTestnetCard(card._id)" class="action-btn delete-btn">
                        <Trash2 class="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeSection === 'partnerships'" class="section">
          <div class="section-header">
            <h3 class="section-title">Partnerships</h3>
            <button @click="showPartnershipModal = true" class="btn btn-primary">
              <Plus class="btn-icon" />
              Add Partnership
            </button>
          </div>

          <div class="partnerships-grid">
            <div v-for="partner in partnerships" :key="partner._id" class="partnership-card">
              <div class="partner-icon">
                <img v-if="partner.image" :src="partner.image" :alt="partner.title" />
                <Building class="default-icon" v-else />
              </div>
              <h4 class="partner-name">{{ partner.title }}</h4>
              <!-- <p class="partner-description">{{ partner.description }}</p> -->
              <div class="card-actions">
                <button @click="editPartnership(partner)" class="action-btn edit-btn">
                  <Edit class="action-icon" />
                </button>
                <button @click="deletePartnership(partner._id)" class="action-btn delete-btn">
                  <Trash2 class="action-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeSection === 'about'" class="section">
          <div class="section-header">
            <h3 class="section-title">About Content</h3>
            <button @click="showAboutModal = true" class="btn btn-primary">
              <Plus class="btn-icon" />
              Add About Content
            </button>
          </div>

          <div v-if="loading.about" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading about content...</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="content in aboutContent" :key="content._id" class="table-row">
                  <td class="table-cell font-medium">{{ content.title }}</td>
                  <td class="table-cell">{{ content.content }}</td>
                  <td class="table-cell">
                    <div class="action-buttons">
                      <button @click="editAboutContent(content)" class="action-btn edit-btn">
                        <Edit class="action-icon" />
                      </button>
                      <button
                        @click="deleteAboutContent(content._id)"
                        class="action-btn delete-btn"
                      >
                        <Trash2 class="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeSection === 'team'" class="section">
          <div class="section-header">
            <h3 class="section-title">Team Members</h3>
            <button @click="showTeamModal = true" class="btn btn-primary">
              <Plus class="btn-icon" />
              Add Team Member
            </button>
          </div>

          <div v-if="loading.team" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading team members...</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in teamMembers" :key="member._id" class="table-row">
                  <td class="table-cell">
                    <div class="member-cell">
                      <img
                        v-if="member.image"
                        :src="member.image"
                        :alt="member.name"
                        class="member-image"
                      />
                      <div v-else class="image-placeholder-small">
                        <ImageIcon class="placeholder-icon-small" />
                      </div>
                    </div>
                  </td>
                  <td class="table-cell font-medium">{{ member.name }}</td>
                  <td class="table-cell">{{ member.position }}</td>
                  <td class="table-cell">
                    <div class="action-buttons">
                      <button @click="editTeamMember(member)" class="action-btn edit-btn">
                        <Edit class="action-icon" />
                      </button>
                      <button @click="deleteTeamMember(member._id)" class="action-btn delete-btn">
                        <Trash2 class="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Components -->
    <MenuModal
      :show="showMenuModal"
      :editing="!!editingMenu"
      :item="editingMenu || {}"
      @close="closeMenuModal"
      @save="saveMenuItem"
    />

    <MainnetModal
      :show="showMainnetModal"
      :editing="!!editingMainnet"
      :card="editingMainnet || {}"
      @close="closeMainnetModal"
      @save="saveMainnetCard"
    />

    <TestnetModal
      :show="showTestnetModal"
      :editing="!!editingTestnet"
      :card="editingTestnet || {}"
      @close="closeTestnetModal"
      @save="saveTestnetCard"
    />

    <PartnershipModal
      :show="showPartnershipModal"
      :editing="!!editingPartnership"
      :partnership="editingPartnership || {}"
      @close="closePartnershipModal"
      @save="savePartnership"
    />

    <TeamModal
      :show="showTeamModal"
      :editing="!!editingTeamMember"
      :teamMember="editingTeamMember || {}"
      @close="closeTeamModal"
      @save="saveTeamMember"
    />

    <AboutModal
      :show="showAboutModal"
      :editing="!!editingAboutContent"
      :aboutContent="editingAboutContent || {}"
      @close="closeAboutModal"
      @save="saveAboutContent"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Menu,
  Bell,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Building,
  Settings,
  Globe,
  Network,
  FileText,
  User
} from 'lucide-vue-next'

// Import modal components
import MenuModal from '@/components/MenuModal.vue'
import MainnetModal from '@/components/MainnetModal.vue'
import TestnetModal from '@/components/TestnetModal.vue'
import PartnershipModal from '@/components/PartnershipModal.vue'
import TeamModal from '@/components/TeamModal.vue'
import AboutModal from '@/components/AboutModal.vue'

// Import API services
import {
  menuService,
  mainnetService,
  testnetService,
  partnershipService,
  teamService,
  aboutService
} from '@/services/adminService'

// Reactive data
const sidebarOpen = ref(false)
const activeSection = ref('menu')

// Loading states
const loading = ref({
  menu: false,
  mainnet: false,
  testnet: false,
  partnerships: false,
  team: false,
  about: false
})

// Modal states
const showMenuModal = ref(false)
const showMainnetModal = ref(false)
const showTestnetModal = ref(false)
const showPartnershipModal = ref(false)
const showTeamModal = ref(false)
const showAboutModal = ref(false)
// Editing states
const editingMenu = ref(null)
const editingMainnet = ref(null)
const editingTestnet = ref(null)
const editingPartnership = ref(null)
const editingTeamMember = ref(null)
const editingAboutContent = ref(null)
// Menu items for sidebar
const menuItems = [
  { id: 'menu', name: 'Menu Items', icon: Settings },
  { id: 'mainnet', name: 'Mainnet Cards', icon: Globe },
  { id: 'testnet', name: 'Testnet Cards', icon: Network },
  { id: 'partnerships', name: 'Partnerships', icon: Building },
  { id: 'team', name: 'Team Members', icon: User },
  { id: 'about', name: 'About Content', icon: FileText }
]

// Data from backend
const menuData = ref([])
const mainnetCards = ref([])
const testnetCards = ref([])
const partnerships = ref([])
const teamMembers = ref([])
const aboutContent = ref([])

// Load data on component mount
onMounted(async () => {
  await loadAllData()
})

// Load all data from backend
const loadAllData = async () => {
  try {
    await Promise.all([
      loadMenuData(),
      loadMainnetData(),
      loadTestnetData(),
      loadPartnershipsData(),
      loadTeamData(),
      loadAboutData()
    ])
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

// Load menu data
const loadMenuData = async () => {
  loading.value.menu = true
  try {
    const data = await menuService.getAll()
    menuData.value = data
  } catch (error) {
    console.error('Failed to load menu data:', error)
  } finally {
    loading.value.menu = false
  }
}

// Load mainnet data
const loadMainnetData = async () => {
  loading.value.mainnet = true
  try {
    const data = await mainnetService.getAll()
    mainnetCards.value = data?.data || []
  } catch (error) {
    console.error('Failed to load mainnet data:', error)
  } finally {
    loading.value.mainnet = false
  }
}

// Load testnet data
const loadTestnetData = async () => {
  loading.value.testnet = true
  try {
    const data = await testnetService.getAll()
    testnetCards.value = data?.data || []
  } catch (error) {
    console.error('Failed to load testnet data:', error)
  } finally {
    loading.value.testnet = false
  }
}

// Load partnerships data
const loadPartnershipsData = async () => {
  loading.value.partnerships = true
  try {
    const data = await partnershipService.getAll()
    partnerships.value = data?.data || []
  } catch (error) {
    console.error('Failed to load partnerships data:', error)
  } finally {
    loading.value.partnerships = false
  }
}

// Load team data
const loadTeamData = async () => {
  loading.value.team = true
  try {
    const data = await teamService.getAll()
    teamMembers.value = data?.data || []
    console.log('Team data response:', teamMembers.value)
  } catch (error) {
    console.error('Failed to load team data:', error)
    teamMembers.value = []
  } finally {
    loading.value.team = false
  }
}

// Load about data
const loadAboutData = async () => {
  loading.value.about = true
  try {
    const data = await aboutService.getAll()
    aboutContent.value = data?.data || []
  } catch (error) {
    console.error('Failed to load about data:', error)
  } finally {
    loading.value.about = false
  }
}

// Methods
const getCurrentSectionTitle = () => {
  const section = menuItems.find((item) => item.id === activeSection.value)
  return section ? section.name : 'Dashboard'
}

// Menu Modal Methods
const editMenuItem = (menu) => {
  editingMenu.value = menu
  showMenuModal.value = true
}

const closeMenuModal = () => {
  showMenuModal.value = false
  editingMenu.value = null
}

const saveMenuItem = async (itemData) => {
  try {
    if (editingMenu.value) {
      // Update existing menu item
      await menuService.update(editingMenu.value.id, itemData)
      const index = menuData.value.findIndex((m) => m.id === editingMenu.value.id)
      if (index !== -1) {
        menuData.value[index] = { ...editingMenu.value, ...itemData }
      }
    } else {
      // Create new menu item
      const newItem = await menuService.create(itemData)
      menuData.value.push(newItem)
    }
    closeMenuModal()
  } catch (error) {
    console.error('Failed to save menu item:', error)
    alert('Failed to save menu item. Please try again.')
  }
}

const deleteMenuItem = async (id) => {
  if (confirm('Are you sure you want to delete this menu item?')) {
    try {
      await menuService.delete(id)
      menuData.value = menuData.value.filter((m) => m.id !== id)
    } catch (error) {
      console.error('Failed to delete menu item:', error)
      alert('Failed to delete menu item. Please try again.')
    }
  }
}

// Mainnet Modal Methods
const editMainnetCard = (card) => {
  editingMainnet.value = card
  showMainnetModal.value = true
}

const closeMainnetModal = () => {
  showMainnetModal.value = false
  editingMainnet.value = null
}

const saveMainnetCard = async (cardData) => {
  try {
    if (editingMainnet.value) {
      const updatedCard = await mainnetService.update(editingMainnet.value._id, cardData)
      const index = mainnetCards.value.findIndex((c) => c.id === editingMainnet.value.id)
      if (index !== -1) {
        mainnetCards.value[index] = updatedCard.data || { ...editingMainnet.value, ...cardData }
      }
    } else {
      const newCard = await mainnetService.create(cardData)
      mainnetCards.value.push(newCard.data || newCard)
    }
    closeMainnetModal()
    await loadMainnetData() // Refresh the data to ensure consistency
  } catch (error) {
    console.error('Failed to save mainnet card:', error)
    alert('Failed to save mainnet card. Please try again.')
  }
}

const deleteMainnetCard = async (id) => {
  if (confirm('Are you sure you want to delete this mainnet card?')) {
    try {
      await mainnetService.delete(id)
      mainnetCards.value = mainnetCards.value.filter((c) => c._id !== id)
    } catch (error) {
      console.error('Failed to delete mainnet card:', error)
      alert('Failed to delete mainnet card. Please try again.')
    }
  }
}

// Testnet Modal Methods
const closeTestnetModal = () => {
  showTestnetModal.value = false
  editingTestnet.value = null
}

const saveTestnetCard = async (cardData) => {
  try {
    if (editingTestnet.value) {
      const updatedCard = await testnetService.update(editingTestnet.value._id, cardData)
      const index = testnetCards.value.findIndex((c) => c._id === editingTestnet.value._id)
      if (index !== -1) {
        testnetCards.value[index] = updatedCard.data || { ...editingTestnet.value, ...cardData }
      }
    } else {
      const newCard = await testnetService.create(cardData)
      testnetCards.value.push(newCard.data || newCard)
    }
    closeTestnetModal()
    await loadTestnetData() // Refresh the data to ensure consistency
  } catch (error) {
    console.error('Failed to save testnet card:', error)
    alert('Failed to save testnet card. Please try again.')
  }
}

const deleteTestnetCard = async (id) => {
  if (confirm('Are you sure you want to delete this testnet card?')) {
    try {
      await testnetService.delete(id)
      testnetCards.value = testnetCards.value.filter((c) => c._id !== id)
    } catch (error) {
      console.error('Failed to delete testnet card:', error)
      alert('Failed to delete testnet card. Please try again.')
    }
  }
}
const editTestnetCard = (card) => {
  editingTestnet.value = card
  showTestnetModal.value = true
}

// Partnerships Modal Methods
const editPartnership = (partner) => {
  editingPartnership.value = partner
  showPartnershipModal.value = true
}

const closePartnershipModal = () => {
  showPartnershipModal.value = false
  editingPartnership.value = null
}

const savePartnership = async (partnerData) => {
  try {
    if (editingPartnership.value) {
      const updatedPartner = await partnershipService.update(
        editingPartnership.value._id,
        partnerData
      )
      const index = partnerships.value.findIndex((p) => p._id === editingPartnership.value._id)
      if (index !== -1) {
        partnerships.value[index] = updatedPartner.data || {
          ...editingPartnership.value,
          ...partnerData
        }
      }
    } else {
      const newPartner = await partnershipService.create(partnerData)
      partnerships.value.push(newPartner.data || newPartner)
    }
    closePartnershipModal()
    await loadPartnershipsData() // Refresh the data to ensure consistency
  } catch (error) {
    console.error('Failed to save partnership:', error)
    alert('Failed to save partnership. Please try again.')
  }
}

const deletePartnership = async (id) => {
  if (confirm('Are you sure you want to delete this partnership?')) {
    try {
      await partnershipService.delete(id)
      partnerships.value = partnerships.value.filter((p) => p._id !== id)
    } catch (error) {
      console.error('Failed to delete partnership:', error)
      alert('Failed to delete partnership. Please try again.')
    }
  }
}

// Team Modal Methods
const editTeamMember = (member) => {
  editingTeamMember.value = member
  showTeamModal.value = true
}

const closeTeamModal = () => {
  showTeamModal.value = false
  editingTeamMember.value = null
}

const saveTeamMember = async (memberData) => {
  try {
    console.log('Current teamMembers.value:', teamMembers.value)
    console.log('teamMembers.value type:', typeof teamMembers.value)
    console.log('Is array?', Array.isArray(teamMembers.value))

    if (editingTeamMember.value) {
      const updatedMember = await teamService.update(editingTeamMember.value._id, memberData)
      const index = teamMembers.value.findIndex((m) => m._id === editingTeamMember.value._id)
      if (index !== -1) {
        teamMembers.value[index] = updatedMember.data || {
          ...editingTeamMember.value,
          ...memberData
        }
      }
    } else {
      const newMember = await teamService.create(memberData)
      console.log('New member response:', newMember)

      // Ensure teamMembers.value is an array
      if (!Array.isArray(teamMembers.value)) {
        console.log('teamMembers.value is not an array, initializing as empty array')
        teamMembers.value = []
      }

      // Add the new member to the array
      const memberToAdd = newMember.data || newMember
      console.log('Adding member to array:', memberToAdd)
      teamMembers.value.push(memberToAdd)
      console.log('Updated teamMembers.value:', teamMembers.value)
    }
    closeTeamModal()
    await loadTeamData() // Refresh the data to ensure consistency
  } catch (error) {
    console.error('Failed to save team member:', error)
    alert('Failed to save team member. Please try again.')
  }
}

const deleteTeamMember = async (id) => {
  if (confirm('Are you sure you want to delete this team member?')) {
    try {
      await teamService.delete(id)
      teamMembers.value = teamMembers.value.filter((m) => m._id !== id)
    } catch (error) {
      console.error('Failed to delete team member:', error)
      alert('Failed to delete team member. Please try again.')
    }
  }
}

// About Modal Methods
const editAboutContent = (content) => {
  editingAboutContent.value = content
  showAboutModal.value = true
}

const closeAboutModal = () => {
  showAboutModal.value = false
  editingAboutContent.value = null
}

const saveAboutContent = async (contentData) => {
  try {
    if (editingAboutContent.value) {
      const updatedContent = await aboutService.update(editingAboutContent.value._id, contentData)
      const index = aboutContent.value.findIndex((c) => c._id === editingAboutContent.value._id)
      if (index !== -1) {
        aboutContent.value[index] = updatedContent.data || {
          ...editingAboutContent.value,
          ...contentData
        }
      }
    } else {
      const newContent = await aboutService.create(contentData)
      aboutContent.value.push(newContent.data || newContent)
    }
    closeAboutModal()
    await loadAboutData() // Refresh the data to ensure consistency
  } catch (error) {
    console.error('Failed to save about content:', error)
    alert('Failed to save about content. Please try again.')
  }
}

const deleteAboutContent = async (id) => {
  if (confirm('Are you sure you want to delete this about content?')) {
    try {
      await aboutService.delete(id)
      aboutContent.value = aboutContent.value.filter((c) => c._id !== id)
    } catch (error) {
      console.error('Failed to delete about content:', error)
      alert('Failed to delete about content. Please try again.')
    }
  }
}

// Image handling functions
const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src)
  // You can add fallback logic here if needed
}

const handleImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-container {
  padding-top: 80px;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  position: fixed;
  /* top: 0;
  left: 0; */
  height: 100vh;
  width: 256px;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  z-index: 50;
}

.sidebar-open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .sidebar {
    transform: translateX(0);
  }
}

.sidebar-header {
  height: 20px;
  /* background: #f8f9fa; */
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  margin: 0;
}

.sidebar-nav {
  margin-top: 2rem;
}

.nav-items {
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-align: left;
  border-radius: 0.5rem;
  transition: all 0.2s;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
}

.nav-item:hover {
  background-color: #f9fafb;
  color: #111827;
}

.nav-item-active {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-right: 4px solid #1d4ed8;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

@media (min-width: 1024px) {
  .sidebar-overlay {
    display: none;
  }
}

/* Main Content Styles */
.main-content {
  margin-left: 0;
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 256px;
  }
}

.top-bar {
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e7eb;
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.mobile-menu-btn {
  display: block;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn:hover {
  background-color: #f3f4f6;
}

@media (min-width: 1024px) {
  .mobile-menu-btn {
    display: none;
  }
}

.menu-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.page-title {
  margin-left: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-btn {
  padding: 0.5rem;
  border-radius: 50%;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
}

.notification-btn:hover {
  background-color: #f3f4f6;
}

.bell-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
}

/* Content Area Styles */
.content-area {
  padding: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

/* Table Styles */
.table-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-cell {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
  color: #111827;
}

.network-cell {
  display: flex;
  align-items: center;
}

.network-image {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 0.375rem;
}

.image-placeholder-small {
  width: 3rem;
  height: 3rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.placeholder-icon-small {
  width: 1.5rem;
  height: 1.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
}

.edit-btn {
  color: #3b82f6;
}

.edit-btn:hover {
  color: #1d4ed8;
}

.delete-btn {
  color: #dc2626;
}

.delete-btn:hover {
  color: #991b1b;
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

/* Card Styles */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-image {
  aspect-ratio: 16/9;
  background-color: #f3f4f6;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.placeholder-icon {
  width: 3rem;
  height: 3rem;
}

.card-content {
  padding: 1rem;
}

.card-title {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.card-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
}

.stake-code {
  background-color: #f9fafb;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  color: #374151;
  margin-bottom: 0.75rem;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Partnership Styles */
.partnerships-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.partnership-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  text-align: center;
}

.partner-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem auto;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.partner-icon img {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
}

.default-icon {
  width: 2rem;
  height: 2rem;
  color: #9ca3af;
}

.partner-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.partner-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

/* Content Card Styles */
.content-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header-title {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.capabilities-text {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Team Styles */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.member-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-image {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.team-member {
  text-align: center;
}

.member-photo {
  width: 6rem;
  height: 6rem;
  margin: 0 auto 1rem auto;
  background-color: #f3f4f6;
  border-radius: 50%;
  overflow: hidden;
}

.member-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.user-icon {
  width: 2rem;
  height: 2rem;
}

.member-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.member-position {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.member-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .partnerships-grid {
    grid-template-columns: 1fr;
  }

  .team-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    min-width: 600px;
  }
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}
</style>
