<template>
  <div class="mainAreas" id="aboutUs">
    <div class="about">
      <div class="titleHeader">
        <div>About</div>
        <div>StakeCraft</div>
      </div>
      <div class="shortDescription">
        Our team has earned recognition in the crypto community as the reliable team that approaches
        with the highest degree of responsibility to all tasks and monitors security of all data.
      </div>
      <div class="ourCapabilities">
        <div class="title">Our Capabilities</div>
        <div v-if="loading.about" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading capabilities...</p>
        </div>
        <div v-else-if="error.about" class="error-container">
          <p>Error loading capabilities: {{ error.about }}</p>
        </div>
        <div v-else>
          <button
            v-for="(capability, index) in aboutContent"
            :key="capability._id"
            class="wrapper"
            @click="openDescription(index)"
            :class="{ withHeight: showDescription[index] }"
          >
            <div class="presentation">
              <div class="capabilityTitle">{{ capability.title }}</div>
              <button class="add" :class="{ around: showDescription[index] }">+</button>
            </div>
            <div class="capabilityDescription">
              {{ capability.content }}
            </div>
          </button>
        </div>
      </div>
    </div>
    <div class="team">
      <div v-if="loading.team" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading team members...</p>
      </div>
      <div v-else-if="error.team" class="error-container">
        <p>Error loading team members: {{ error.team }}</p>
      </div>
      <div v-else class="team-grid">
        <div
          v-for="(member, index) in teamMembers"
          :key="member._id"
          class="team-member"
          :class="getMemberClass(index)"
        >
          <div class="member-photo">
            <img
              v-if="member.image"
              :src="member.image"
              :alt="member.name"
              @error="handleImageError"
            />
            <div v-else class="photo-placeholder">
              <div class="placeholder-icon">👤</div>
            </div>
          </div>
          <div class="member-overlay"></div>
          <div class="member-content">
            <div class="memberTitle">{{ member.name }}</div>
            <div class="memberTextArea">
              <div class="memberDescription">
                {{ member.position }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useContent } from '../composables/useContent.js'

export default {
  name: 'AboutSection',
  setup() {
    const { fetchTeam, getTeamMembers, fetchAbout, getAboutContent, loading, error } = useContent()
    const showDescription = ref([])

    onMounted(async () => {
      await Promise.all([fetchAbout(), fetchTeam()])
    })

    const openDescription = (index) => {
      if (!showDescription.value[index]) {
        showDescription.value[index] = true
      } else {
        showDescription.value[index] = !showDescription.value[index]
      }
    }

    const getMemberClass = (index) => {
      const classes = ['firstRow', 'secondRow', 'thirdRow', 'fourthRow']
      return classes[index % classes.length]
    }

    const handleImageError = (event) => {
      console.error('Image failed to load:', event.target.src)
      // Hide the broken image and show placeholder
      event.target.style.display = 'none'
      const placeholder = event.target.parentElement.querySelector('.photo-placeholder')
      if (placeholder) {
        placeholder.style.display = 'flex'
      }
    }

    console.log('About content:', getAboutContent.value)
    console.log('Team members:', getTeamMembers.value)

    return {
      showDescription,
      openDescription,
      aboutContent: getAboutContent,
      teamMembers: getTeamMembers,
      loading,
      error,
      getMemberClass,
      handleImageError
    }
  }
}
</script>

<style scoped>
#aboutUs {
  background: var(--van-about-us-background);
  padding-top: 100px;
}

.titleHeader > * {
  font-weight: 600;
}

.titleHeader > *:last-child {
  margin: 30px 0 31px 0;
}

button {
  background-color: #fff;
  border: none;
}

.mainAreas {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 100px;
  gap: 10%;
}

.about {
  width: 100%;
}

.shortDescription {
  line-height: 24px;
  font-family: poppins;
  font-size: 16px;
  font-weight: 400;
}

.team {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.team-member {
  width: 270px;
  aspect-ratio: 1/1.1;
  transition: 0.3s linear background-image;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f3f4f6;
}

.member-photo {
  width: 100%;
  height: 100%;
  position: relative;
}

.member-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
  color: #9ca3af;
  font-size: 3rem;
}

.placeholder-icon {
  font-size: 4rem;
}

.member-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  transition: 0.4s ease-in-out background-color;
  pointer-events: none;
}

.member-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  padding: 20px;
  transform: translateY(0);
  opacity: 1;
  transition:
    0.4s ease-in-out transform,
    0.4s ease-in-out opacity;
}

.ourCapabilities .title {
  color: var(--van-ourCapabilities-title);
  line-height: 34px;
  font-size: 26px;
  font-family: generalSans;
  font-weight: 600;
  margin: 45px 0 30px 0;
}

.ourCapabilities .wrapper {
  height: 62px;
  width: 100%;
  overflow: hidden;
  margin-bottom: 18px;
  transition: 0.3s linear height;
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
}

.ourCapabilities .wrapper.withHeight {
  height: 145px;
}

.capabilityDescription {
  text-align: left;
  padding: 0px 20px 15px 20px;
  font-size: 16px;
  line-height: 24px;
  font-family: poppins;
}

.ourCapabilities .presentation {
  display: flex;
  padding: 16px 20px 11px 20px;
  font-family: poppins;
  font-size: 20px;
  line-height: 30px;
  justify-content: space-between;
}

.add {
  font-size: 24px;
  align-self: flex-end;
  transition: 0.3s linear transform;
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
}

.add.around {
  transform: rotate(45deg);
}

.memberTitle {
  font-family: poppins;
  font-weight: 700;
  font-size: 18px;
  line-height: 26px;
  color: #fff;
  margin-bottom: 8px;
  transform: translateY(0);
  opacity: 1;
  transition:
    0.4s ease-in-out transform,
    0.4s ease-in-out opacity;
}

.memberTextArea {
  height: 0;
  overflow: hidden;
  transition: 0.4s ease-in-out height;
}

.memberDescription {
  font-family: poppins;
  font-weight: 400;
  font-size: 12px;
  line-height: 24px;
  color: #fff;
  margin: 0;
  transform: translateY(20px);
  opacity: 0;
  transition:
    0.4s ease-in-out transform,
    0.4s ease-in-out opacity;
  transition-delay: 0.1s;
}

/* Hover Effects */
.team-member:hover .member-overlay {
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 0.8;
}

.team-member:hover .memberTextArea {
  height: auto;
  min-height: 80px;
}

.team-member:hover .memberDescription {
  transform: translateY(0);
  opacity: 1;
}

/* Loading and Error Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
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

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
}

/* Responsive Design */
@media only screen and (max-width: 1208px) {
  #aboutUs {
    padding-top: 0px;
  }

  .titleHeader > *:last-child {
    margin: 0;
  }

  .titleHeader {
    line-height: 52px;
  }

  .about {
    max-width: unset;
  }

  .mainAreas {
    flex-direction: column;
  }

  /* .team {
    display: grid;
  } */

  .team-grid {
    grid-template-columns: repeat(2, 2fr);
  }

  .team {
    display: grid;
    grid-template-columns: repeat(1, 2fr);
  }
  .team-member {
    width: 100%;
  }

  /* On mobile, show text by default since hover doesn't work well */
  .memberTextArea {
    height: auto !important;
    opacity: 1 !important;
  }

  .memberDescription {
    transform: translateY(0) !important;
    opacity: 1 !important;
  }

  .member-overlay {
    background-color: rgba(0, 0, 0, 0.3) !important;
  }

  .ourCapabilities .presentation {
    font-size: 16px;
    line-height: 24px;
    padding: 16px 15px;
    align-items: center;
  }

  .ourCapabilities .wrapper {
    padding: 0;
    margin: 0 0 15px 0;
    box-sizing: border-box;
  }

  .ourCapabilities .wrapper.withHeight {
    height: 164px;
  }

  .ourCapabilities .title {
    margin-bottom: 18px;
  }
}

@media screen and (max-width: 425px) {
  .team-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .team {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
