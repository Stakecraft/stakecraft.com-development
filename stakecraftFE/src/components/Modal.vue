<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div class="modal" v-if="network">
        <header class="modal-header">
          <div class="headerTitle">{{ network.title }}</div>
          <button type="button" class="btn-close" @click="close">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8574 1.74023L1.85742 13.7402M1.85742 1.74023L13.8574 13.7402" stroke="var(--van-modal-btn-close)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </header>

        <div class="modal-body">
          {{ network.description }}
        </div>

        <footer class="modal-footer">
          <div v-if="network.validator.length > 0">
            <ul>
              <li v-for="(validator, index) in network.validator" v-bind:key="validator">
                <div class="validatorArea">
                  <input type="text" :value="validator" class="validatorInput" readonly />
                  <button @click="copyText(validator)">Copy</button>
                </div>
                <div class="externalLinks">
                  <a
                    v-if="network.explorer && network.explorer[index]"
                    class="explorerLink"
                    :href="network.explorer[index]"
                    target="_blank"
                  >
                    <span>Check validator info in Explorer</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.845215 6.99996H12.5119M12.5119 6.99996L6.67855 1.16663M12.5119 6.99996L6.67855 12.8333" stroke="var(--modal-right-arrow)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                  </a>
                  <a
                    class="howToStake"
                    :href="network.howToStake"
                    target="_blank"
                    v-if="network.howToStake"
                  >
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.51221 1.66663H2.67887C2.23685 1.66663 1.81292 1.84222 1.50036 2.15478C1.1878 2.46734 1.01221 2.89127 1.01221 3.33329V16.6666C1.01221 17.1087 1.1878 17.5326 1.50036 17.8451C1.81292 18.1577 2.23685 18.3333 2.67887 18.3333H12.6789C13.1209 18.3333 13.5448 18.1577 13.8574 17.8451C14.1699 17.5326 14.3455 17.1087 14.3455 16.6666V7.49996M8.51221 1.66663L14.3455 7.49996M8.51221 1.66663V7.49996H14.3455" stroke="var(--modal-right-arrow)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>How to stake Solana</span></a
                  >
                </div>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  props: ['network'],
  setup(props, context) {
    const network = ref(null)

    const copyText = async (validator) => {
      await navigator.clipboard.writeText(validator)
    }

    watch(
      () => props.network,
      (newValue) => {
        network.value = newValue.selectedNetwork
      }
    )
    const close = () => {
      context.emit('close')
    }
    return { close, network, copyText }
  }
}
</script>


<style>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: var(--van-modal-background);
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 20%);
  display: flex;
  flex-direction: column;
  width: 951.36px;
  height: 507.92px;
  border-radius: 20px;
  position: relative;
  align-items: center;
  padding-bottom: 30px;
  padding-top: 20px;
  justify-content: space-around;
}

.modal-header {
  color: var(--modal-header-title);;
}

.headerTitle {
  font-family: generalSans;
  font-size: 52px;
  font-weight: 600;
  line-height: 40px;
  text-align: center;
}

.btn-close {
  position: absolute;
  font-size: 24px;
  top: 24.74px;
  right: 28px;
  border: none;
  background: transparent;
  font-family: monospace;
  cursor: pointer;
}

.modal-body {
  width: 576px;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}

.validatorArea {
  width: 576px;
  background: #fff;
  height: 48px;
  border-radius: 4px;
  display: flex;
  padding: 0 16px;
  justify-content: space-between;
  font-family: poppins;
  font-size: 16px;
  margin-top: 20px;
}

.validatorInput {
  border: none;
  height: 48px;
  color: #282a36;
  width: 80%;
}

.validatorArea button {
  color: #00beb5;
  font-weight: 900;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: 0.2s all;
}

.validatorArea button:active {
  transform: scale(1.2);
}

.explorerLink,
.howToStake {
  font-family: poppins;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  color: var(--modal-header-title);
  margin-top: 27px;
}

.explorerLink span,
.howToStake span {
  text-decoration: underline;
}

.explorerLink svg {
  margin-left: 10px;
}

.howToStake svg {
  margin-right: 10px;
}

.externalLinks {
  display: flex;
  justify-content: space-between;
}

.modal-footer ul {
  padding: 0;
}
</style>
