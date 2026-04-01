import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const showToast = (options) => {
    const toast = {
      id: Date.now(),
      type: options.type || 'info',
      message: options.message || '',
      title: options.title || '',
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      ...options
    }

    toasts.value.push(toast)

    // Auto remove after duration unless persistent
    if (!toast.persistent && toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    }

    return toast.id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  const success = (message, options = {}) => {
    return showToast({
      type: 'success',
      message,
      ...options
    })
  }

  const error = (message, options = {}) => {
    return showToast({
      type: 'error',
      message,
      ...options
    })
  }

  const warning = (message, options = {}) => {
    return showToast({
      type: 'warning',
      message,
      ...options
    })
  }

  const info = (message, options = {}) => {
    return showToast({
      type: 'info',
      message,
      ...options
    })
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}