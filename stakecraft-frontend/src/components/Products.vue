<template>
  <section class="products-wrap mainAreas" id="products">
    <div class="products-hero">
      <div class="titleHeader">Projects</div>
      <p class="products-sub">
        Highlights from past work — each entry includes rich copy, outbound links, and an image gallery hosted on IPFS.
      </p>
    </div>

    <div v-if="loading.products" class="products-state">
      <div class="loading-spinner products-spinner" />
      <p>Loading projects…</p>
    </div>

    <div v-else-if="error.products" class="products-state products-state--error">
      <p>{{ error.products }}</p>
      <button type="button" class="products-retry" @click="fetchProducts">Retry</button>
    </div>

    <div v-else-if="!visibleProducts.length" class="products-state products-state--empty">
      <p>No projects published yet. Check back soon.</p>
    </div>

    <div v-else class="projects-rows">
      <button
        v-for="product in visibleProducts"
        :key="product._id"
        type="button"
        class="project-row"
        :aria-label="`View details: ${product.title}`"
        @click="openModal(product)"
      >
        <div class="project-row-presentation">
          <div class="project-row-img">
            <img
              v-if="thumbUrl(product)"
              :src="thumbUrl(product)"
              :alt="product.title"
              loading="lazy"
              @error="onImgError"
            />
            <span v-else class="project-row-placeholder">—</span>
          </div>
          <div class="project-row-name">{{ product.title }}</div>
          <span class="project-row-chevron" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </div>
      </button>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <div
        v-if="modalProduct"
        class="project-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="project-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalTitleId"
        >
          <button type="button" class="project-modal-close" aria-label="Close" @click="closeModal">
            ×
          </button>
          <h2 :id="modalTitleId" class="project-modal-title">{{ modalProduct.title }}</h2>

          <div class="project-modal-hero">
            <img
              v-if="modalMainImage"
              :src="modalMainImage"
              :alt="modalProduct.title"
              loading="lazy"
              @error="onImgError"
            />
            <div v-else class="project-modal-hero-placeholder">No image</div>
          </div>

          <div
            v-if="modalGallery.length > 1"
            class="project-modal-thumbs"
            role="tablist"
            aria-label="Image gallery"
          >
            <button
              v-for="(url, i) in modalGallery"
              :key="i"
              type="button"
              class="project-modal-thumb"
              :class="{ 'project-modal-thumb--active': modalImageIndex === i }"
              @click.stop="modalImageIndex = i"
            >
              <img :src="url" alt="" loading="lazy" />
            </button>
          </div>

          <p v-if="modalProduct.explanation" class="project-modal-desc">
            {{ modalProduct.explanation }}
          </p>

          <a
            v-if="modalProduct.link"
            :href="modalProduct.link"
            class="project-modal-cta"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >
            Visit project
            <span class="project-modal-cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useContent } from '../composables/useContent.js'

let modalIdCounter = 0

export default {
  name: 'ProductsSection',
  setup() {
    const { fetchProducts, getProducts, loading, error } = useContent()
    const modalProduct = ref(null)
    const modalImageIndex = ref(0)
    const modalTitleId = `project-modal-title-${++modalIdCounter}`

    onMounted(() => {
      fetchProducts()
      document.addEventListener('keydown', onKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    })

    const onKeydown = (e) => {
      if (e.key === 'Escape' && modalProduct.value) closeModal()
    }

    const visibleProducts = computed(() => getProducts.value)

    const galleryUrls = (p) => (Array.isArray(p.images) ? p.images.filter(Boolean) : [])

    const thumbUrl = (p) => {
      const urls = galleryUrls(p)
      return urls[0] || null
    }

    const modalGallery = computed(() =>
      modalProduct.value ? galleryUrls(modalProduct.value) : []
    )

    const modalMainImage = computed(() => {
      const urls = modalGallery.value
      if (!urls.length) return null
      const i = Math.min(modalImageIndex.value, urls.length - 1)
      return urls[i] || urls[0]
    })

    watch(modalProduct, (p) => {
      modalImageIndex.value = 0
      if (p) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    })

    const openModal = (product) => {
      modalProduct.value = product
      modalImageIndex.value = 0
    }

    const closeModal = () => {
      modalProduct.value = null
    }

    const onImgError = (e) => {
      e.target.style.opacity = '0.35'
    }

    return {
      loading,
      error,
      visibleProducts,
      fetchProducts,
      galleryUrls,
      thumbUrl,
      modalProduct,
      modalImageIndex,
      modalGallery,
      modalMainImage,
      modalTitleId,
      openModal,
      closeModal,
      onImgError
    }
  }
}
</script>

<style scoped>
#products.products-wrap {
  padding-top: 120px;
  padding-bottom: 120px;
  position: relative;
  overflow: hidden;
  scroll-margin-top: 96px;
  /* Same canvas as Why Choose Us (body / --van-background), not a separate band */
  background: var(--van-background);
  color: var(--van-text-color);
}

#products.products-wrap .mainAreas {
  padding-top: 0;
  padding-bottom: 0;
}

.products-hero {
  max-width: 720px;
  margin-bottom: 48px;
}

.products-sub {
  font-size: 1.05rem;
  line-height: 1.65;
  margin: 0;
  max-width: 640px;
  font-family: poppins, sans-serif;
  color: var(--van-text-color);
}

/* Testnet-style row cards, larger gutters and taller rows */
.projects-rows {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 28px 32px;
  align-items: start;
}

.project-row {
  background: var(--van-mainnet-network-background);
  box-sizing: border-box;
  border: 1px solid var(--van-border-color);
  cursor: pointer;
  border-radius: 20px;
  width: 100%;
  padding: 0;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.project-row:hover {
  background-image:
    linear-gradient(var(--van-mainnet-network-background), var(--van-mainnet-network-background)),
    linear-gradient(to right, #09bac5, #9747ff);
  background-origin: border-box;
  background-clip: content-box, border-box;
  border: 1px solid transparent;
  border-radius: 20px;
  box-shadow: 0 8px 28px -8px rgba(0, 0, 0, 0.25);
}

.project-row:focus-visible {
  outline: 2px solid #09bac5;
  outline-offset: 3px;
}

.project-row-presentation {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: 128px;
  padding: 0;
}

.project-row-img {
  width: 80px;
  height: 80px;
  margin: 24px 0 24px 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--van-background);
}

.project-row-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.project-row-placeholder {
  color: var(--van-text-color-2);
  font-size: 1.5rem;
}

.project-row-name {
  color: var(--van-text-color);
  flex: 1;
  min-width: 0;
  font-family: poppins, sans-serif;
  font-size: 22px;
  font-weight: 700;
  text-align: left;
  margin-left: 18px;
  margin-right: 12px;
  line-height: 1.25;
}

.project-row-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
  color: var(--van-text-color-2);
  transition:
    color 0.2s,
    transform 0.2s ease;
}

.project-row:hover .project-row-chevron {
  color: #09bac5;
  transform: translateX(3px);
}

.project-row-chevron svg {
  display: block;
}

/* Modal */
.project-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
}

.project-modal {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: min(92vh, 900px);
  overflow-y: auto;
  background: var(--van-mainnet-network-background);
  border-radius: 20px;
  border: 1px solid var(--van-border-color);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.14);
  padding: 28px 28px 32px;
  color: var(--van-text-color);
}

.project-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--van-text-color);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.project-modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.project-modal-title {
  font-family: generalSans, poppins, sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 48px 20px 0;
  color: var(--van-text-color);
  line-height: 1.2;
}

.project-modal-hero {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: var(--van-background);
  aspect-ratio: 16 / 10;
  max-height: 320px;
  margin-bottom: 14px;
}

.project-modal-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.project-modal-hero-placeholder {
  width: 100%;
  height: 100%;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--van-text-color-2);
  font-size: 0.9rem;
}

.project-modal-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.project-modal-thumb {
  width: 56px;
  height: 56px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: var(--van-background);
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.project-modal-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.project-modal-thumb--active {
  border-color: #09bac5;
  transform: translateY(-2px);
}

.project-modal-desc {
  font-family: poppins, sans-serif;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--van-text-color);
  margin: 0 0 24px;
  white-space: pre-wrap;
}

.project-modal-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(120deg, #09bac5, #6366f1);
  padding: 12px 22px;
  border-radius: 999px;
  text-decoration: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 8px 24px -8px rgba(9, 186, 197, 0.45);
}

.project-modal-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -8px rgba(99, 102, 241, 0.4);
}

.project-modal-cta-arrow {
  transition: transform 0.2s;
}

.project-modal-cta:hover .project-modal-cta-arrow {
  transform: translateX(4px);
}

.products-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--van-text-color-2);
}

.products-state--error {
  color: var(--van-danger-color);
}

.products-state--empty {
  border: 1px dashed var(--van-border-color);
  border-radius: 16px;
  background: var(--van-background-2);
  color: var(--van-text-color-2);
}

.products-spinner {
  margin: 0 auto 16px;
}

.products-retry {
  margin-top: 12px;
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, #09bac5, #6366f1);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

@media only screen and (max-width: 900px) {
  #products.products-wrap {
    padding-top: 60px;
  }

  .projects-rows {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .project-row-presentation {
    min-height: 112px;
  }

  .project-row-img {
    width: 72px;
    height: 72px;
    margin: 20px 0 20px 18px;
  }

  .project-row-name {
    font-size: 18px;
  }
}

@media only screen and (max-width: 768px) {
  #products.products-wrap {
    padding-bottom: 80px;
  }

  .project-modal {
    padding: 22px 18px 26px;
    border-radius: 16px;
  }

  .project-modal-title {
    font-size: 1.4rem;
    margin-right: 40px;
  }
}
</style>

<style>
/* Scoped vars don't reach body; lift card edge slightly in dark mode */
body.van-theme-dark #products .project-row {
  border-color: rgba(255, 255, 255, 0.1);
}

/* Project detail modal (Teleport → body): dark theme refinements */
body.van-theme-dark .project-modal {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}

body.van-theme-dark .project-modal-thumb {
  background: #252832;
}

body.van-theme-dark .project-modal-close {
  background: rgba(255, 255, 255, 0.08);
  color: var(--van-white);
}

body.van-theme-dark .project-modal-close:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
