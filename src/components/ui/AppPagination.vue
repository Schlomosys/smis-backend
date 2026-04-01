<template>
  <nav v-if="totalPages > 1" aria-label="Pagination">
    <ul class="pagination justify-content-center">
      <!-- Previous Button -->
      <li :class="['page-item', { disabled: currentPage === 1 }]">
        <button
          class="page-link"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          aria-label="Previous"
        >
          <span aria-hidden="true">&laquo;</span>
        </button>
      </li>

      <!-- Page Numbers -->
      <li
        v-for="page in visiblePages"
        :key="page"
        :class="['page-item', { active: page === currentPage }]"
      >
        <button
          class="page-link"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- Next Button -->
      <li :class="['page-item', { disabled: currentPage === totalPages }]">
        <button
          class="page-link"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          aria-label="Next"
        >
          <span aria-hidden="true">&raquo;</span>
        </button>
      </li>
    </ul>

    <!-- Page Info -->
    <p v-if="showInfo" class="text-center text-muted small mt-2">
      Affichage {{ startItem }}-{{ endItem }} sur {{ totalItems }} résultats
    </p>
  </nav>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppPagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
      default: 1
    },
    totalPages: {
      type: Number,
      required: true,
      default: 1
    },
    totalItems: {
      type: Number,
      default: 0
    },
    perPage: {
      type: Number,
      default: 10
    },
    showInfo: {
      type: Boolean,
      default: true
    },
    maxVisiblePages: {
      type: Number,
      default: 5
    }
  },
  emits: ['page-changed'],
  computed: {
    startItem() {
      return (this.currentPage - 1) * this.perPage + 1
    },
    endItem() {
      const end = this.currentPage * this.perPage
      return Math.min(end, this.totalItems)
    },
    visiblePages() {
      const pages = []
      const half = Math.floor(this.maxVisiblePages / 2)
      let start = Math.max(1, this.currentPage - half)
      let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1)

      // Adjust start if we're near the end
      if (end - start + 1 < this.maxVisiblePages) {
        start = Math.max(1, end - this.maxVisiblePages + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    }
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit('page-changed', page)
      }
    }
  }
})
</script>

<style scoped>
.pagination {
  gap: 0.35rem;
  margin-bottom: 0;
}

.page-link {
  border: 1px solid #d9e7f1;
  border-radius: 999px;
  color: #045480;
  cursor: pointer;
  min-width: 2.6rem;
  text-align: center;
}

.page-item.active .page-link {
  border-color: #ff6900;
  background: #ff6900;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
