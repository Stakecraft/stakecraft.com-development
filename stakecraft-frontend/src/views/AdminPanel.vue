<template>
  <div class="admin-container" :class="`van-theme-${theme}`">
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
                  <th>Section</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="menu in menuData" :key="menu._id" class="table-row">
                  <td class="table-cell font-medium">{{ menu.title }}</td>
                  <td class="table-cell">
                    <span class="url-text">{{ menu.link }}</span>
                    <span v-if="menu.metadata?.isExternal === 'true'" class="external-badge"
                      >External</span
                    >
                  </td>
                  <td class="table-cell">
                    <span class="section-badge" :class="menu.metadata?.menuSection || 'center'">
                      {{
                        (menu.metadata?.menuSection || 'center').charAt(0).toUpperCase() +
                        (menu.metadata?.menuSection || 'center').slice(1)
                      }}
                    </span>
                  </td>
                  <td class="table-cell">{{ menu.order || 0 }}</td>
                  <td class="table-cell">
                    <span
                      :class="['status-badge', menu.isActive ? 'status-active' : 'status-inactive']"
                    >
                      {{ menu.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <div class="action-buttons">
                      <button @click="editMenuItem(menu)" class="action-btn edit-btn">
                        <Edit class="action-icon" />
                      </button>
                      <button @click="deleteMenuItem(menu._id)" class="action-btn delete-btn">
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
            <div class="section-actions">
              <button @click="showMainnetModal = true" class="btn btn-primary">
                <Plus class="btn-icon" />
                Add Mainnet Card
              </button>
              <button @click="showMainnetPositionManager = true" class="btn btn-secondary">
                <Move class="btn-icon" />
                Manage Positions
              </button>
            </div>
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
                  <th>Order</th>
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
                  <td class="table-cell">{{ card.description }}</td>
                  <td class="table-cell">{{ card.order || 0 }}</td>
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
            <div class="section-actions">
              <button @click="showTestnetModal = true" class="btn btn-primary">
                <Plus class="btn-icon" />
                Add Testnet Card
              </button>
              <button @click="showTestnetPositionManager = true" class="btn btn-secondary">
                <Move class="btn-icon" />
                Manage Positions
              </button>
            </div>
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
                  <th>Order</th>
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
                  <td class="table-cell">{{ card.order || 0 }}</td>
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

        <!-- Network Migration Section -->
        <div v-if="activeSection === 'migration'" class="section">
          <div class="section-header">
            <h3 class="section-title">Network Migration</h3>
          </div>

          <div class="migration-info-banner">
            <ArrowLeftRight class="info-icon" />
            <p>
              Select networks below to migrate them between Mainnet and Testnet. This is useful when
              a network graduates from testnet to mainnet or needs to be moved back for testing.
            </p>
          </div>

          <div class="migration-container">
            <!-- Mainnet to Testnet -->
            <div class="migration-panel">
              <div class="migration-panel-header mainnet-header">
                <Globe class="panel-icon" />
                <h4>Mainnet Networks</h4>
                <span class="network-count">{{ mainnetCards.length }} networks</span>
              </div>

              <div class="migration-panel-actions">
                <button @click="selectAllMainnet" class="btn btn-sm btn-outline">
                  <CheckSquare class="btn-icon-sm" />
                  {{ selectedMainnetForMigration.length === mainnetCards.length ? 'Deselect All' : 'Select All' }}
                </button>
                <span class="selected-count" v-if="selectedMainnetForMigration.length > 0">
                  {{ selectedMainnetForMigration.length }} selected
                </span>
              </div>

              <div v-if="loading.mainnet" class="loading-container-small">
                <div class="loading-spinner"></div>
              </div>

              <div v-else class="migration-cards-list">
                <div
                  v-for="card in mainnetCards"
                  :key="card._id"
                  class="migration-card-item"
                  :class="{ selected: selectedMainnetForMigration.includes(card._id) }"
                  @click="toggleMainnetSelection(card._id)"
                >
                  <div class="migration-checkbox">
                    <input
                      type="checkbox"
                      :checked="selectedMainnetForMigration.includes(card._id)"
                      @click.stop
                      @change="toggleMainnetSelection(card._id)"
                    />
                  </div>
                  <img
                    v-if="card.image"
                    :src="card.image"
                    :alt="card.title"
                    class="migration-card-image"
                  />
                  <div v-else class="migration-card-placeholder">
                    <ImageIcon class="placeholder-icon-xs" />
                  </div>
                  <div class="migration-card-info">
                    <span class="migration-card-title">{{ card.title }}</span>
                  </div>
                </div>
              </div>

              <div class="migration-panel-footer">
                <button
                  @click="migrateMainnetToTestnet"
                  class="btn btn-migrate btn-migrate-to-testnet"
                  :disabled="selectedMainnetForMigration.length === 0 || migratingNetworks"
                >
                  <span v-if="migratingNetworks" class="loading-spinner-small"></span>
                  <ArrowRight v-else class="btn-icon" />
                  Migrate to Testnet
                </button>
              </div>
            </div>

            <!-- Migration Arrow -->
            <div class="migration-arrow">
              <ArrowLeftRight class="arrow-icon" />
            </div>

            <!-- Testnet to Mainnet -->
            <div class="migration-panel">
              <div class="migration-panel-header testnet-header">
                <Network class="panel-icon" />
                <h4>Testnet Networks</h4>
                <span class="network-count">{{ testnetCards.length }} networks</span>
              </div>

              <div class="migration-panel-actions">
                <button @click="selectAllTestnet" class="btn btn-sm btn-outline">
                  <CheckSquare class="btn-icon-sm" />
                  {{ selectedTestnetForMigration.length === testnetCards.length ? 'Deselect All' : 'Select All' }}
                </button>
                <span class="selected-count" v-if="selectedTestnetForMigration.length > 0">
                  {{ selectedTestnetForMigration.length }} selected
                </span>
              </div>

              <div v-if="loading.testnet" class="loading-container-small">
                <div class="loading-spinner"></div>
              </div>

              <div v-else class="migration-cards-list">
                <div
                  v-for="card in testnetCards"
                  :key="card._id"
                  class="migration-card-item"
                  :class="{ selected: selectedTestnetForMigration.includes(card._id) }"
                  @click="toggleTestnetSelection(card._id)"
                >
                  <div class="migration-checkbox">
                    <input
                      type="checkbox"
                      :checked="selectedTestnetForMigration.includes(card._id)"
                      @click.stop
                      @change="toggleTestnetSelection(card._id)"
                    />
                  </div>
                  <img
                    v-if="card.image"
                    :src="card.image"
                    :alt="card.title"
                    class="migration-card-image"
                  />
                  <div v-else class="migration-card-placeholder">
                    <ImageIcon class="placeholder-icon-xs" />
                  </div>
                  <div class="migration-card-info">
                    <span class="migration-card-title">{{ card.title }}</span>
                  </div>
                </div>
              </div>

              <div class="migration-panel-footer">
                <button
                  @click="migrateTestnetToMainnet"
                  class="btn btn-migrate btn-migrate-to-mainnet"
                  :disabled="selectedTestnetForMigration.length === 0 || migratingNetworks"
                >
                  <span v-if="migratingNetworks" class="loading-spinner-small"></span>
                  <ArrowLeft v-else class="btn-icon" />
                  Migrate to Mainnet
                </button>
              </div>
            </div>
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

    <MenuModal
      ref="menuModalRef"
      :show="showMenuModal"
      :editing="!!editingMenu"
      :menuItem="editingMenu || {}"
      :existingMenuItems="menuData"
      @close="closeMenuModal"
      @save="saveMenuItem"
    />

    <!-- Position Manager Modals -->
    <div
      v-if="showMainnetPositionManager"
      class="modal-overlay"
      @click="closeMainnetPositionManager"
    >
      <div class="modal-container" :class="`van-theme-${theme}`" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Manage Mainnet Card Positions</h3>
            <button @click="closeMainnetPositionManager" class="close-button">×</button>
          </div>
          <div class="modal-body">
            <div class="position-instructions">
              <p>
                Drag and drop cards to reorder them. The new order will be reflected on the main
                page.
              </p>
            </div>
            <div class="cards-list">
              <div
                v-for="(card, index) in mainnetCards"
                :key="card._id"
                class="card-item"
                :class="{ dragging: draggedCard === card._id }"
                draggable="true"
                @dragstart="startDrag($event, card._id)"
                @dragover.prevent
                @drop="dropCard($event, card._id)"
                @dragenter.prevent
              >
                <div class="card-handle">⋮⋮</div>
                <div class="card-content">
                  <img v-if="card.image" :src="card.image" :alt="card.title" class="card-image" />
                  <div v-else class="card-image-placeholder">🖼️</div>
                  <div class="card-info">
                    <h4 class="card-title">{{ card.title }}</h4>
                    <p class="card-description">{{ card.description.slice(0, 100) }}...</p>
                  </div>
                </div>
                <div class="card-position">{{ index + 1 }}</div>
              </div>
            </div>
            <div class="modal-actions">
              <button
                @click="saveMainnetPositions"
                class="btn btn-primary"
                :disabled="savingPositions"
              >
                <span v-if="savingPositions" class="loading-spinner-small"></span>
                {{ savingPositions ? 'Saving...' : 'Save Positions' }}
              </button>
              <button
                @click="closeMainnetPositionManager"
                class="btn btn-secondary"
                :disabled="savingPositions"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showTestnetPositionManager"
      class="modal-overlay"
      @click="closeTestnetPositionManager"
    >
      <div class="modal-container" :class="`van-theme-${theme}`" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Manage Testnet Card Positions</h3>
            <button @click="closeTestnetPositionManager" class="close-button">×</button>
          </div>
          <div class="modal-body">
            <div class="position-instructions">
              <p>
                Drag and drop cards to reorder them. The new order will be reflected on the main
                page.
              </p>
            </div>
            <div class="cards-list">
              <div
                v-for="(card, index) in testnetCards"
                :key="card._id"
                class="card-item"
                :class="{ dragging: draggedCard === card._id }"
                draggable="true"
                @dragstart="startDrag($event, card._id)"
                @dragover.prevent
                @drop="dropCard($event, card._id)"
                @dragenter.prevent
              >
                <div class="card-handle">⋮⋮</div>
                <div class="card-content">
                  <img v-if="card.image" :src="card.image" :alt="card.title" class="card-image" />
                  <div v-else class="card-image-placeholder">🖼️</div>
                  <div class="card-info">
                    <h4 class="card-title">{{ card.title }}</h4>
                    <p class="card-description">{{ card.description.slice(0, 100) }}...</p>
                  </div>
                </div>
                <div class="card-position">{{ index + 1 }}</div>
              </div>
            </div>
            <div class="modal-actions">
              <button
                @click="saveTestnetPositions"
                class="btn btn-primary"
                :disabled="savingPositions"
              >
                <span v-if="savingPositions" class="loading-spinner-small"></span>
                {{ savingPositions ? 'Saving...' : 'Save Positions' }}
              </button>
              <button
                @click="closeTestnetPositionManager"
                class="btn btn-secondary"
                :disabled="savingPositions"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
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
  User,
  Move,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  CheckSquare
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

// Theme injection
const theme = inject('theme')

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
const showMainnetPositionManager = ref(false)
const showTestnetPositionManager = ref(false)
// Editing states
const editingMenu = ref(null)
const menuModalRef = ref(null)
const editingMainnet = ref(null)
const editingTestnet = ref(null)
const editingPartnership = ref(null)
const editingTeamMember = ref(null)
const editingAboutContent = ref(null)

// Migration states
const selectedMainnetForMigration = ref([])
const selectedTestnetForMigration = ref([])
const migratingNetworks = ref(false)
// Menu items for sidebar
const menuItems = [
  { id: 'menu', name: 'Menu Items', icon: Settings },
  { id: 'mainnet', name: 'Mainnet Cards', icon: Globe },
  { id: 'testnet', name: 'Testnet Cards', icon: Network },
  { id: 'migration', name: 'Network Migration', icon: ArrowLeftRight },
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
    const response = await menuService.getAll()
    menuData.value = response.data || []
  } catch (error) {
    console.error('Failed to load menu data:', error)
    // If we get a 404, it means no menu items exist yet, which is fine
    if (error.message.includes('404')) {
      menuData.value = []
    } else {
      menuData.value = []
      alert('Failed to load menu items. Please check if the backend server is running.')
    }
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
      const updatedItem = await menuService.update(editingMenu.value._id, itemData)
      const index = menuData.value.findIndex((m) => m._id === editingMenu.value._id)
      if (index !== -1) {
        menuData.value[index] = updatedItem.data || { ...editingMenu.value, ...itemData }
      }
    } else {
      // Create new menu item
      const newItem = await menuService.create(itemData)
      menuData.value.push(newItem.data || newItem)
    }
    closeMenuModal()
    await loadMenuData() // Refresh the data to ensure consistency
  } catch (error) {
    console.error('Failed to save menu item:', error)

    // Reset submission state to re-enable the button
    menuModalRef.value?.resetSubmissionState()

    // Check for order validation error
    if (error.message.includes('Order') && error.message.includes('already taken')) {
      alert(`Error: ${error.message}`)
    } else {
      alert('Failed to save menu item. Please try again.')
    }
  }
}

const deleteMenuItem = async (id) => {
  if (confirm('Are you sure you want to delete this menu item?')) {
    try {
      await menuService.delete(id)
      menuData.value = menuData.value.filter((m) => m._id !== id)
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
      // Ensure teamMembers.value is an array
      if (!Array.isArray(teamMembers.value)) {
        teamMembers.value = []
      }

      // Add the new member to the array
      const memberToAdd = newMember.data || newMember
      teamMembers.value.push(memberToAdd)
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

// Position Management Methods
const closeMainnetPositionManager = () => {
  showMainnetPositionManager.value = false
}

const closeTestnetPositionManager = () => {
  showTestnetPositionManager.value = false
}

const savingPositions = ref(false)

const saveMainnetPositions = async () => {
  try {
    savingPositions.value = true
    const positions = mainnetCards.value.map((card, index) => ({
      id: card._id,
      order: index + 1
    }))
    await mainnetService.updatePositions(positions)
    await loadMainnetData() // Refresh the data
    alert('Mainnet positions saved successfully!')
    closeMainnetPositionManager()
  } catch (error) {
    console.error('Failed to save mainnet positions:', error)
    alert('Failed to save positions. Please try again.')
  } finally {
    savingPositions.value = false
  }
}

const saveTestnetPositions = async () => {
  try {
    savingPositions.value = true
    const positions = testnetCards.value.map((card, index) => ({
      id: card._id,
      order: index + 1
    }))
    await testnetService.updatePositions(positions)
    await loadTestnetData() // Refresh the data
    alert('Testnet positions saved successfully!')
    closeTestnetPositionManager()
  } catch (error) {
    console.error('Failed to save testnet positions:', error)
    alert('Failed to save positions. Please try again.')
  } finally {
    savingPositions.value = false
  }
}

// Drag and drop functionality
const draggedCard = ref(null)

const startDrag = (event, cardId) => {
  draggedCard.value = cardId
  event.dataTransfer.effectAllowed = 'move'
}

const dropCard = (event, targetCardId) => {
  event.preventDefault()

  if (!draggedCard.value || draggedCard.value === targetCardId) {
    draggedCard.value = null
    return
  }

  // Get the current section (mainnet or testnet)
  const currentCards = activeSection.value === 'mainnet' ? mainnetCards.value : testnetCards.value

  // Find the dragged and target cards
  const draggedIndex = currentCards.findIndex((card) => card._id === draggedCard.value)
  const targetIndex = currentCards.findIndex((card) => card._id === targetCardId)

  if (draggedIndex === -1 || targetIndex === -1) {
    draggedCard.value = null
    return
  }

  // Remove dragged card from its current position
  const [draggedItem] = currentCards.splice(draggedIndex, 1)

  // Insert dragged card at target position
  currentCards.splice(targetIndex, 0, draggedItem)

  // Update order numbers
  currentCards.forEach((card, index) => {
    card.order = index + 1
  })

  draggedCard.value = null
}

// Migration Functions
const toggleMainnetSelection = (cardId) => {
  const index = selectedMainnetForMigration.value.indexOf(cardId)
  if (index === -1) {
    selectedMainnetForMigration.value.push(cardId)
  } else {
    selectedMainnetForMigration.value.splice(index, 1)
  }
}

const toggleTestnetSelection = (cardId) => {
  const index = selectedTestnetForMigration.value.indexOf(cardId)
  if (index === -1) {
    selectedTestnetForMigration.value.push(cardId)
  } else {
    selectedTestnetForMigration.value.splice(index, 1)
  }
}

const selectAllMainnet = () => {
  if (selectedMainnetForMigration.value.length === mainnetCards.value.length) {
    selectedMainnetForMigration.value = []
  } else {
    selectedMainnetForMigration.value = mainnetCards.value.map((card) => card._id)
  }
}

const selectAllTestnet = () => {
  if (selectedTestnetForMigration.value.length === testnetCards.value.length) {
    selectedTestnetForMigration.value = []
  } else {
    selectedTestnetForMigration.value = testnetCards.value.map((card) => card._id)
  }
}

const migrateMainnetToTestnet = async () => {
  if (selectedMainnetForMigration.value.length === 0) {
    alert('Please select at least one mainnet network to migrate')
    return
  }

  const selectedNames = mainnetCards.value
    .filter((card) => selectedMainnetForMigration.value.includes(card._id))
    .map((card) => card.title)
    .join(', ')

  if (
    !confirm(
      `Are you sure you want to migrate the following networks from Mainnet to Testnet?\n\n${selectedNames}`
    )
  ) {
    return
  }

  try {
    migratingNetworks.value = true
    const result = await mainnetService.migrateToTestnet(selectedMainnetForMigration.value)

    if (result.success) {
      alert(result.msg)
      selectedMainnetForMigration.value = []
      // Refresh both lists
      await Promise.all([loadMainnetData(), loadTestnetData()])
    } else {
      alert('Migration failed: ' + (result.msg || 'Unknown error'))
    }
  } catch (error) {
    console.error('Migration error:', error)
    alert('Failed to migrate networks: ' + error.message)
  } finally {
    migratingNetworks.value = false
  }
}

const migrateTestnetToMainnet = async () => {
  if (selectedTestnetForMigration.value.length === 0) {
    alert('Please select at least one testnet network to migrate')
    return
  }

  const selectedNames = testnetCards.value
    .filter((card) => selectedTestnetForMigration.value.includes(card._id))
    .map((card) => card.title)
    .join(', ')

  if (
    !confirm(
      `Are you sure you want to migrate the following networks from Testnet to Mainnet?\n\n${selectedNames}\n\nNote: You may need to update validator, howToStake, and explorer fields after migration.`
    )
  ) {
    return
  }

  try {
    migratingNetworks.value = true
    const result = await testnetService.migrateToMainnet(selectedTestnetForMigration.value)

    if (result.success) {
      alert(result.msg)
      selectedTestnetForMigration.value = []
      // Refresh both lists
      await Promise.all([loadMainnetData(), loadTestnetData()])
    } else {
      alert('Migration failed: ' + (result.msg || 'Unknown error'))
    }
  } catch (error) {
    console.error('Migration error:', error)
    alert('Failed to migrate networks: ' + error.message)
  } finally {
    migratingNetworks.value = false
  }
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
  transition: background-color 0.3s ease;
}

/* Dark theme styles */
.admin-container.van-theme-dark {
  background-color: var(--van-background);
  color: var(--van-text-color);
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
  transition: all 0.3s ease-in-out;
  z-index: 50;
}

.van-theme-dark .sidebar {
  background: var(--van-mainnet-network-background);
  border-right: 1px solid #333;
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

.van-theme-dark .nav-item:hover {
  background-color: #374151;
  color: #f9fafb;
}

.nav-item-active {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-right: 4px solid #1d4ed8;
}

.van-theme-dark .nav-item-active {
  background-color: #1e40af;
  color: #dbeafe;
  border-right: 4px solid var(--van-seconday-color);
}

.van-theme-dark .nav-item {
  color: #d1d5db;
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
  transition: all 0.3s ease;
}

.van-theme-dark .top-bar {
  background: var(--van-header-background);
  border-bottom: 1px solid #333;
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
  transition: color 0.3s ease;
}

.van-theme-dark .page-title {
  color: var(--van-text-color);
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

.theme-toggle-wrapper {
  display: flex;
  align-items: center;
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
  transition: color 0.3s ease;
}

.van-theme-dark .section-title {
  color: var(--van-text-color);
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
  transition: all 0.3s ease;
}

.van-theme-dark .table-container {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.van-theme-dark .data-table thead {
  background-color: #374151;
  border-bottom: 1px solid #4b5563;
}

.data-table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.3s ease;
}

.van-theme-dark .data-table th {
  color: #f9fafb;
}

.table-row:hover {
  background-color: #f9fafb;
  transition: background-color 0.3s ease;
}

.van-theme-dark .table-row:hover {
  background-color: #374151;
}

.table-cell {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.van-theme-dark .table-cell {
  border-bottom: 1px solid #4b5563;
  color: #f9fafb;
}

.font-medium {
  font-weight: 500;
  color: #111827;
  transition: color 0.3s ease;
}

.van-theme-dark .font-medium {
  color: #ffffff;
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

.url-text {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #374151;
  word-break: break-all;
}

.van-theme-dark .url-text {
  color: #f9fafb;
}

.external-badge {
  background-color: #f0f9ff;
  color: #0369a1;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.section-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.section-badge.center {
  background-color: #f0f9ff;
  color: #0369a1;
}

.section-badge.right {
  background-color: #fef3c7;
  color: #92400e;
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
  transition: all 0.3s ease;
}

.van-theme-dark .card {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
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
  transition: all 0.3s ease;
}

.van-theme-dark .partnership-card {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
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
  transition: color 0.3s ease;
}

.van-theme-dark .partner-name {
  color: var(--van-text-color);
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
  transition: all 0.3s ease;
}

.van-theme-dark .content-card {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
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

  .section-actions {
    flex-direction: column;
    gap: 0.5rem;
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

  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .card-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .card-content {
    gap: 0.75rem;
  }

  .card-image {
    width: 40px;
    height: 40px;
  }

  .card-image-placeholder {
    width: 40px;
    height: 40px;
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
  transition: all 0.3s ease;
}

.van-theme-dark .loading-container {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
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

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}

.loading-container p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Position Manager Styles */
.section-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 90%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.van-theme-dark .modal-container {
  background: var(--van-mainnet-network-background);
  border: 1px solid #333;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.van-theme-dark .modal-header {
  background: #374151;
  border-bottom: 1px solid #4b5563;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  transition: color 0.3s ease;
}

.van-theme-dark .modal-title {
  color: var(--van-text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.close-button:hover {
  color: #374151;
}

.modal-body {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 1rem 2rem;
  min-height: 0;
  max-height: calc(80vh - 140px);
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.position-instructions {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.van-theme-dark .position-instructions {
  background: #1e3a8a;
  border: 1px solid #3b82f6;
}

.position-instructions p {
  margin: 0;
  color: #0369a1;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.van-theme-dark .position-instructions p {
  color: #60a5fa;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  min-height: 200px;
  overflow-y: auto;
  max-height: calc(80vh - 300px);
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.cards-list::-webkit-scrollbar {
  width: 8px;
}

.cards-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.cards-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.cards-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: grab;
  transition: all 0.2s;
  min-height: 80px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.van-theme-dark .card-item {
  background: var(--van-mainnet-network-background);
  border: 1px solid #4b5563;
}

.card-item:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.card-item:active {
  cursor: grabbing;
}

.card-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-item.drag-over {
  border-color: #6366f1;
  background-color: #f0f9ff;
  transform: scale(1.02);
}

.card-handle {
  color: #9ca3af;
  cursor: grab;
  padding: 0.5rem;
  font-size: 1.2rem;
  user-select: none;
  border-radius: 0.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.card-handle:hover {
  color: #6366f1;
  background-color: #f3f4f6;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.card-image {
  width: 48px;
  height: 48px;
  border-radius: 0.375rem;
  object-fit: cover;
}

.card-image-placeholder {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1.5rem;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.van-theme-dark .card-title {
  color: #ffffff;
}

.card-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.van-theme-dark .card-description {
  color: #d1d5db;
}

.card-position {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.van-theme-dark .modal-actions {
  background: #374151;
  border-top: 1px solid #4b5563;
}

/* Network Migration Styles */
.migration-info-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  border: 1px solid #93c5fd;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.van-theme-dark .migration-info-banner {
  background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
  border: 1px solid #3b82f6;
}

.migration-info-banner .info-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #2563eb;
  flex-shrink: 0;
}

.van-theme-dark .migration-info-banner .info-icon {
  color: #60a5fa;
}

.migration-info-banner p {
  margin: 0;
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.5;
}

.van-theme-dark .migration-info-banner p {
  color: #bfdbfe;
}

.migration-container {
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
}

@media (max-width: 1024px) {
  .migration-container {
    flex-direction: column;
  }
}

.migration-panel {
  flex: 1;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.van-theme-dark .migration-panel {
  background: var(--van-mainnet-network-background);
  border: 1px solid #374151;
}

.migration-panel-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.van-theme-dark .migration-panel-header {
  border-bottom: 1px solid #374151;
}

.migration-panel-header.mainnet-header {
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
}

.van-theme-dark .migration-panel-header.mainnet-header {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
}

.migration-panel-header.testnet-header {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.van-theme-dark .migration-panel-header.testnet-header {
  background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
}

.migration-panel-header .panel-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.mainnet-header .panel-icon {
  color: #059669;
}

.van-theme-dark .mainnet-header .panel-icon {
  color: #34d399;
}

.testnet-header .panel-icon {
  color: #d97706;
}

.van-theme-dark .testnet-header .panel-icon {
  color: #fbbf24;
}

.migration-panel-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.van-theme-dark .migration-panel-header h4 {
  color: #f9fafb;
}

.network-count {
  font-size: 0.75rem;
  color: #6b7280;
  background: rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.van-theme-dark .network-count {
  color: #d1d5db;
  background: rgba(255, 255, 255, 0.1);
}

.migration-panel-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.van-theme-dark .migration-panel-actions {
  border-bottom: 1px solid #374151;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.btn-outline:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.van-theme-dark .btn-outline {
  border-color: #4b5563;
  color: #d1d5db;
}

.van-theme-dark .btn-outline:hover {
  background: #374151;
  border-color: #6b7280;
}

.btn-icon-sm {
  width: 0.875rem;
  height: 0.875rem;
  margin-right: 0.375rem;
}

.selected-count {
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 500;
}

.van-theme-dark .selected-count {
  color: #60a5fa;
}

.loading-container-small {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.migration-cards-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.migration-card-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.van-theme-dark .migration-card-item {
  background: #1f2937;
}

.migration-card-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.van-theme-dark .migration-card-item:hover {
  background: #374151;
  border-color: #4b5563;
}

.migration-card-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.van-theme-dark .migration-card-item.selected {
  background: #1e3a8a;
  border-color: #3b82f6;
}

.migration-checkbox {
  flex-shrink: 0;
}

.migration-checkbox input[type='checkbox'] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  accent-color: #3b82f6;
}

.migration-card-image {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  object-fit: cover;
  flex-shrink: 0;
}

.migration-card-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  background: #e5e7eb;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.van-theme-dark .migration-card-placeholder {
  background: #374151;
}

.placeholder-icon-xs {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
}

.migration-card-info {
  flex: 1;
  min-width: 0;
}

.migration-card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.van-theme-dark .migration-card-title {
  color: #f9fafb;
}

.migration-panel-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.van-theme-dark .migration-panel-footer {
  border-top: 1px solid #374151;
  background: #1f2937;
}

.btn-migrate {
  width: 100%;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-migrate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-migrate-to-testnet {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
}

.btn-migrate-to-testnet:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-migrate-to-mainnet {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}

.btn-migrate-to-mainnet:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.migration-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

@media (max-width: 1024px) {
  .migration-arrow {
    transform: rotate(90deg);
  }
}

.migration-arrow .arrow-icon {
  width: 2rem;
  height: 2rem;
  color: #9ca3af;
}

.van-theme-dark .migration-arrow .arrow-icon {
  color: #6b7280;
}
</style>
