<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div class="modal" v-if="network">
        <header class="modal-header">
          <div class="headerTitle">{{ network.title }}</div>
          <button type="button" class="btn-close" @click="close">
            <img src="../assets/x_icon.svg" />
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
                    <img src="../assets/arrow_right.svg" alt="->" />
                  </a>
                  <a
                    class="howToStake"
                    :href="network.howToStake"
                    target="_blank"
                    v-if="network.howToStake"
                  >
                    <img src="../assets/document.svg" />
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
        console.log(props.network)
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
  background: #f0f0f0;
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
  color: #000;
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
  color: #1b1d25;
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
}

.explorerLink,
.howToStake {
  font-family: poppins;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  color: #252732;
  margin-top: 27px;
}

.explorerLink span,
.howToStake span {
  text-decoration: underline;
}

.explorerLink img {
  margin-left: 10px;
}

.howToStake img {
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
