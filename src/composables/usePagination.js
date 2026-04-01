import { ref, computed } from 'vue'

export function usePagination(fetchFn) {
  const page = ref(1)
  const perPage = ref(20)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / perPage.value))

  async function loadPage(p) {
    page.value = p
    const data = await fetchFn({ page: p, per_page: perPage.value })
    if (data?.pagination) {
      total.value = data.pagination.total
      perPage.value = data.pagination.perPage
    }
  }

  return { page, perPage, total, totalPages, loadPage }
}
