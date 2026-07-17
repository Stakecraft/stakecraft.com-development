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
          <div
            v-for="(capability, index) in aboutContent"
            :key="capability._id"
            class="wrapper"
            role="button"
            tabindex="0"
            @click="openDescription(index)"
            @keydown.enter.prevent="openDescription(index)"
            @keydown.space.prevent="openDescription(index)"
            :class="{ withHeight: showDescription[index] }"
          >
            <div class="presentation">
              <div class="capabilityTitle">{{ capability.title }}</div>
              <span class="add" :class="{ around: showDescription[index] }">+</span>
            </div>
            <div class="capabilityDescription">
              {{ capability.content }}
            </div>
          </div>
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
        <div v-for="member in teamMembers" :key="member._id" class="team-member">
          <div class="member-content">
            <div class="memberTitle">{{ member.name }}</div>
            <div class="memberDescription">{{ member.position }}</div>
          </div>
          <div v-if="memberTags(member).length" class="member-tags">
            <span v-for="tag in memberTags(member)" :key="tag" class="member-tag">{{ tag }}</span>
          </div>
          <a
            v-if="member.linkedin"
            :href="member.linkedin"
            class="linkedin-link"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${member.name} on LinkedIn`"
          >
            <svg class="linkedin-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
              />
            </svg>
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useContent } from '../composables/useContent.js'
import { parseTagsInput } from '../utils/parseTags.js'

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

    const memberTags = (member) => parseTagsInput(member?.tags)

    return {
      showDescription,
      openDescription,
      memberTags,
      aboutContent: getAboutContent,
      teamMembers: getTeamMembers,
      loading,
      error
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
  flex: 0 0 auto;
  width: min(568px, 100%);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, 274px);
  gap: 20px;
  width: fit-content;
  max-width: 100%;
  align-items: stretch;
}

.team-member {
  width: 274px;
  height: 274px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  border-radius: 8px;
  background: var(--van-ourCapabilities-wrapper);
  color: var(--van-ourCapabilities-text);
  box-sizing: border-box;
  overflow: hidden;
}

.member-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  cursor: pointer;
  border-radius: 8px;
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
  color: var(--van-ourCapabilities-title);
  margin: 0;
}

.memberDescription {
  font-family: poppins;
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;
  color: var(--van-ourCapabilities-text);
  margin: 0;
  opacity: 0.9;
}

.member-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.member-tag {
  font-family: poppins;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--van-ourCapabilities-text) 12%, transparent);
  color: var(--van-ourCapabilities-title);
}

.linkedin-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  font-family: poppins;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #0a66c2;
  text-decoration: none;
  transition: 0.2s ease opacity;
}

.linkedin-link:hover {
  opacity: 0.8;
}

.linkedin-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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
    grid-template-columns: repeat(2, 274px);
    justify-content: center;
  }

  .team {
    width: 100%;
  }

  .team-member {
    width: 274px;
    height: 274px;
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
    grid-template-columns: 274px;
    justify-content: center;
  }
}
</style>
