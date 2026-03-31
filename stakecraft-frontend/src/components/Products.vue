<template>
  <section class="products-wrap mainAreas" id="products">
    <div class="products-hero">
      <p class="products-kicker">What we ship</p>
      <h2 class="products-title">
        Our <span class="products-title-accent">products</span> &amp; builds
      </h2>
      <p class="products-sub">
        Highlights from past work — each entry can include rich copy, outbound links, and a gallery
        of images hosted on IPFS.
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

    <div v-else class="products-grid">
      <article v-for="product in visibleProducts" :key="product._id" class="product-card">
        <div class="product-visual">
          <div class="product-frame">
            <img
              v-if="currentImage(product)"
              :src="currentImage(product)"
              :alt="product.title"
              class="product-hero-img"
              loading="lazy"
              @error="onImgError"
            />
            <div v-else class="product-hero-placeholder">Gallery</div>
            <div class="product-frame-edge" aria-hidden="true" />
          </div>
          <div v-if="galleryUrls(product).length > 1" class="product-thumbs" role="tablist">
            <button
              v-for="(url, i) in galleryUrls(product)"
              :key="i"
              type="button"
              class="product-thumb"
              :class="{ 'product-thumb--active': galleryPick(product._id) === i }"
              @click="setPick(product._id, i)"
            >
              <img :src="url" alt="" loading="lazy" />
            </button>
          </div>
        </div>

        <div class="product-body">
          <h3 class="product-name">{{ product.title }}</h3>
          <p v-if="product.explanation" class="product-copy">{{ product.explanation }}</p>
          <a
            v-if="product.link"
            :href="product.link"
            class="product-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit project
            <span class="product-cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useContent } from '../composables/useContent.js'

export default {
  name: 'ProductsSection',
  setup() {
    const { fetchProducts, getProducts, loading, error } = useContent()
    const picks = ref({})

    onMounted(() => {
      fetchProducts()
    })

    const visibleProducts = computed(() => getProducts.value)

    const galleryUrls = (p) => (Array.isArray(p.images) ? p.images.filter(Boolean) : [])

    const galleryPick = (id) => picks.value[id] ?? 0

    const setPick = (id, i) => {
      picks.value = { ...picks.value, [id]: i }
    }

    const currentImage = (p) => {
      const urls = galleryUrls(p)
      const i = galleryPick(p._id)
      return urls[i] || urls[0] || null
    }

    const onImgError = (e) => {
      e.target.style.opacity = '0.2'
    }

    return {
      loading,
      error,
      visibleProducts,
      fetchProducts,
      galleryUrls,
      galleryPick,
      setPick,
      currentImage,
      onImgError
    }
  }
}
</script>

<style scoped>
.products-wrap {
  padding-bottom: 120px;
  position: relative;
  overflow: hidden;
}

.products-wrap::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 55%;
  height: 70%;
  background: radial-gradient(
    ellipse at center,
    rgba(99, 102, 241, 0.12) 0%,
    transparent 65%
  );
  pointer-events: none;
}

.products-hero {
  max-width: 720px;
  margin-bottom: 40px;
}

.products-kicker {
  font-size: 13px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: #6366f1;
  margin: 0 0 12px;
}

.products-title {
  font-family: generalSans, system-ui, sans-serif;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 600;
  line-height: 1.08;
  margin: 0 0 16px;
  color: var(--van-text-color, #111827);
}

.products-title-accent {
  color: #6366f1;
  font-style: italic;
  font-weight: 500;
}

.products-sub {
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--van-text-color-2, #4b5563);
  margin: 0;
  max-width: 540px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px 22px;
  align-items: stretch;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--van-products-card-bg, rgba(255, 255, 255, 0.6));
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 24px -8px rgba(15, 23, 42, 0.12);
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.product-card:hover {
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: 0 12px 32px -12px rgba(79, 70, 229, 0.2);
}

.product-visual {
  position: relative;
  flex-shrink: 0;
  width: 100%;
}

/* Fills the top of the card edge-to-edge; card border-radius + overflow still clip the corners */
.product-frame {
  position: relative;
  width: 100%;
  height: clamp(152px, 20vw, 188px);
  overflow: hidden;
  background: #e8eaef;
  box-shadow: inset 0 -1px 0 rgba(15, 23, 42, 0.06);
}

.product-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.product-hero-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
}

.product-frame-edge {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.product-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px 0;
  margin: 0;
}

.product-thumb {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #f3f4f6;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-thumb--active {
  border-color: #6366f1;
  transform: translateY(-2px);
}

.product-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding: 14px 16px 18px;
}

.product-name {
  font-family: generalSans, system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--van-text-color, #111827);
  line-height: 1.25;
}

.product-copy {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--van-text-color-2, #4b5563);
  margin: 0;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  overflow: hidden;
}

.product-cta {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(120deg, #4f46e5, #6366f1);
  padding: 8px 16px;
  border-radius: 999px;
  text-decoration: none;
  margin-top: auto;
  box-shadow: 0 6px 16px -6px rgba(79, 70, 229, 0.5);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.product-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -8px rgba(79, 70, 229, 0.6);
}

.product-cta-arrow {
  transition: transform 0.2s;
}

.product-cta:hover .product-cta-arrow {
  transform: translateX(4px);
}

.products-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--van-text-color-2, #6b7280);
}

.products-state--error {
  color: #b91c1c;
}

.products-state--empty {
  border: 1px dashed rgba(99, 102, 241, 0.35);
  border-radius: 16px;
  background: rgba(99, 102, 241, 0.04);
}

.products-spinner {
  margin: 0 auto 16px;
}

.products-retry {
  margin-top: 12px;
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

:global(.van-theme-dark) .product-card {
  --van-products-card-bg: rgba(31, 41, 55, 0.5);
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.van-theme-dark) .product-frame {
  background: linear-gradient(180deg, #252f3f 0%, #1a222d 100%);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.06);
}

:global(.van-theme-dark) .product-thumb {
  background: #374151;
}

@media only screen and (max-width: 1100px) {
  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
}

@media only screen and (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .product-frame {
    height: clamp(168px, 48vw, 220px);
  }

  .products-wrap {
    padding-bottom: 80px;
  }
}
</style>
