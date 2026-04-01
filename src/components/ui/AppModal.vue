<template>
  <teleport to="body">
    <div
      v-if="show"
      class="modal-backdrop"
      @click.self="handleBackdropClick"
    >
      <div
        :class="[
          'modal',
          { 'fade': animate },
          { 'show': show }
        ]"
        :style="{ display: show ? 'block' : 'none' }"
        tabindex="-1"
        role="dialog"
      >
        <div
          :class="[
            'modal-dialog',
            { 'modal-lg': size === 'lg' },
            { 'modal-xl': size === 'xl' },
            { 'modal-sm': size === 'sm' },
            { 'modal-dialog-centered': centered },
            { 'modal-dialog-scrollable': scrollable }
          ]"
          role="document"
        >
          <div class="modal-content">
            <!-- Modal Header -->
            <div v-if="title || $slots.header" class="modal-header">
              <slot name="header">
                <h5 class="modal-title">{{ title }}</h5>
              </slot>
              <button
                v-if="closable"
                type="button"
                class="btn-close"
                @click="close"
                aria-label="Close"
              ></button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
              <slot></slot>
            </div>

            <!-- Modal Footer -->
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppModal',
  props: {
    title: {
      type: String,
      default: ''
    },
    closable: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    centered: {
      type: Boolean,
      default: false
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    animate: {
      type: Boolean,
      default: true
    },
    backdrop: {
      type: [Boolean, String],
      default: true,
      validator: (value) => [true, false, 'static'].includes(value)
    }
  },
  emits: ['close', 'show', 'shown', 'hide', 'hidden'],
  data() {
    return {
      show: false
    }
  },
  mounted() {
    this.show = true
    this.$emit('show')
    if (this.animate) {
      setTimeout(() => {
        this.$emit('shown')
      }, 300)
    } else {
      this.$emit('shown')
    }
  },
  beforeUnmount() {
    this.$emit('hide')
    if (this.animate) {
      setTimeout(() => {
        this.$emit('hidden')
      }, 300)
    } else {
      this.$emit('hidden')
    }
  },
  methods: {
    close() {
      this.show = false
      this.$emit('close')
    },
    handleBackdropClick() {
      if (this.backdrop === true) {
        this.close()
      }
    }
  }
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1055;
}

.modal {
  z-index: 1056;
}

.modal.fade .modal-dialog {
  transform: translate(0, -50px);
  transition: transform 0.3s ease-out;
}

.modal.show .modal-dialog {
  transform: translate(0, 0);
}
</style>