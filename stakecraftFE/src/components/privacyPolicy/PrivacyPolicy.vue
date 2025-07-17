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
      <h1>Privacy Policy</h1>
      <div class="termsContent">
        <div v-for="(term, index) in POLICY" :key="index">
          <h3>{{ term.title || '' }}</h3>
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
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Policy',
  setup() {
    const myRouter = useRouter()
    const goToMainPage = () => {
      myRouter.push({ name: 'home' })
    }

    const POLICY = [
      {
        title: 'PRINCIPLES REGARDING DATA PROCESSING',
        text:
          '- STAKECRAFT COMMITS TO COMPLYING WITH THE PRINCIPLES OF PERSONAL DATA PROTECTION AS SET OUT IN THE GDPR.\n' +
          '- THE PRINCIPLES INCLUDE PROCESSING DATA CORRECTLY, LEGALLY, AND TRANSPARENTLY; COLLECTING DATA FOR SPECIFIED, EXPLICIT, AND LEGITIMATE PURPOSES; ENSURING DATA ADEQUACY, RELEVANCE, AND LIMITATION; MAINTAINING DATA ACCURACY AND UPDATES; STORING DATA IN AN ANONYMOUS FORM FOR A LIMITED TIME; PROCESSING DATA IN ACCORDANCE WITH DATA SUBJECT RIGHTS AND ENSURING SECURITY.'
      },
      {
        title: 'PURPOSE AND LEGAL BASIS OF DATA PROCESSING',
        text:
          '- PERSONAL DATA PROVIDED WITH CONSENT WILL BE COLLECTED AND PROCESSED EXCLUSIVELY FOR SPECIFIC PURPOSES.\n' +
          "- DATA PROCESSING IS BASED ON THE INDIVIDUAL'S CONSENT, AS STATED IN ARTICLE 6(1)(A) OF THE GDPR.\n" +
          '- STAKECRAFT COMMITS THAT YOUR INFORMATION WILL NOT BE USED FOR OTHER MEANS, SHARED WITH OR SOLD TO OTHER PARTIES.'
      },
      {
        title: 'DATA STORAGE DURATION',
        text: '- STAKECRAFT MAY RETAIN PROCESSED DATA FOR REASONABLE PERIODS OF TIME ACCORDING TO THE MENTIONED PURPOSES.'
      },
      {
        title: 'DATA PROTECTION MEASURES',
        text:
          '- STAKECRAFT HAS IMPLEMENTED TECHNICAL AND ORGANIZATIONAL MEASURES TO PROTECT PERSONAL DATA FROM UNAUTHORIZED ACCESS, MISUSE, DISCLOSURE, MODIFICATION, DESTRUCTION, OR ACCIDENTAL LOSS.\n' +
          '- ALL EMPLOYEES AND THIRD PARTIES ACTING ON BEHALF OF STAKECRAFT ARE REQUIRED TO RESPECT DATA CONFIDENTIALITY.'
      },
      {
        title: 'INTELLECTUAL PROPERTY LAW',
        text:
          '- STAKECRAFT IS THE SOLE OWNER OF INTELLECTUAL PROPERTY RIGHTS RELATED TO THE CONTENT ON ITS WEBSITE.\n' +
          '- REPRODUCTION, DISTRIBUTION, OR PUBLICATION OF SITE CONTENT IN ANY FORM WITHOUT PRIOR WRITTEN CONSENT FROM STAKECRAFT IS PROHIBITED.'
      },
      {
        title: 'UPDATING THE PROTECTION POLICY AND PROCESSING OF PERSONAL DATA',
        text:
          '- STAKECRAFT’S POLICY MAY BE PERIODICALLY UPDATED, AND USERS ARE ADVISED TO CHECK FOR ANY CHANGES.\n' +
          '- VISITORS WHO DISAGREE WITH THE CHANGES SHOULD DISCONTINUE USING THE STAKECRAFT SITE.\n' +
          "- BY ACCEPTING THE AGREEMENT, AN INDIVIDUAL'S PERSONAL DATA WILL BE PROCESSED ACCORDING TO THE STAKECRAFT’S PERSONAL DATA PROCESSING POLICY."
      },
      {
        title: 'HOW CAN YOU CONTACT US ABOUT THIS POLICY?',
        text: '- YOU CAN REACH US AT SUPPORT@STAKECRAFT.COM AND WE WILL REPLY SHORTLY.'
      }
    ]

    return { POLICY, goToMainPage }
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
  width: 80%;
}
</style>
