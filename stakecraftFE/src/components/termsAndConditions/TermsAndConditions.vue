<template>
  <div class="termsPage">
    <n-button
      @click="showModalRef = true"
      type="primary"
      ghost
      class="backBtn main_btn"
      :onClick="goToMainPage"
    >
      <span class="arrrow">&larr;</span> Back to main Page
    </n-button>
    <div className="terms">
      <h1>TERMS AND CONDITIONS</h1>
      <div class="termsContent">
        <div v-for="(term, index) in TERMS" :key="index">
          <h3>{{ term.title || '' }}</h3>
          <h4>{{ term.highlightedText || '' }}</h4>
          <p>{{ term.text || '' }}</p>
        </div>
      </div>
    </div>
    <n-button
      @click="showModalRef = true"
      type="primary"
      class="backBtn main_btn"
      :onClick="goToMainPage"
    >
      <span class="arrrow">&larr;</span> Back to main Page
    </n-button>
  </div>
</template>

<script>
import TERMS from './termsConditions.js'
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Terms',
  setup() {
    const myRouter = useRouter()
    const goToMainPage = () => {
      myRouter.push({ name: 'home' })
    }
    return { TERMS, goToMainPage }
  }
})
</script>

<style scoped>
.termsPage {
  padding-top: 100px;
}

.main_btn {
  margin: 10px 0 0 24px;
}

.backBtn {
  margin-bottom: 24px;
  cursor: pointer;
}

.terms {
  display: flex;
  flex-direction: column;
}

.terms h1 {
  text-align: center;
}

.arrow {
  font-size: 30px;
}

.termsContent {
  min-width: 560px;
  padding: 10px 32px;
  border: 1px dashed rgba(0, 0, 0, 0.3) !important;
  margin: 50px auto 26px;
  background: transparent !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}
</style>
