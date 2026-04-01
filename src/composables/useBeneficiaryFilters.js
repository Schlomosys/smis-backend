import { reactive, computed } from 'vue'

export function useBeneficiaryFilters() {
  // Filter state
  const filters = reactive({
    search: '',
    commune_id: '',
    type: '',
    risk_level: '',
    is_disabled: '',
    sort_by: 'created_at',
    sort_direction: 'desc'
  })

  // Debounced search timer
  let searchTimer = null

  // Filter options
  const filterOptions = computed(() => ({
    type: [
      { value: 'active', label: 'Actif' },
      { value: 'alumni', label: 'Alumni' }
    ],
    risk_level: [
      { value: 'low', label: 'Faible' },
      { value: 'medium', label: 'Moyen' },
      { value: 'high', label: 'Élevé' }
    ],
    is_disabled: [
      { value: 'false', label: 'Non handicapé' },
      { value: 'true', label: 'Handicapé' }
    ],
    sort_by: [
      { value: 'created_at', label: 'Date de création' },
      { value: 'first_name', label: 'Prénom' },
      { value: 'last_name', label: 'Nom' },
      { value: 'unique_code', label: 'Code unique' },
      { value: 'entry_date', label: 'Date d\'entrée' },
      { value: 'global_score', label: 'Score global' }
    ],
    sort_direction: [
      { value: 'asc', label: 'Croissant' },
      { value: 'desc', label: 'Décroissant' }
    ]
  }))

  // Active filters count
  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.search) count++
    if (filters.commune_id) count++
    if (filters.type) count++
    if (filters.risk_level) count++
    if (filters.is_disabled !== '') count++
    return count
  })

  // Check if any filters are active
  const hasActiveFilters = computed(() => activeFiltersCount.value > 0)

  // Get filter query params for API
  const getFilterParams = () => {
    const params = {}

    if (filters.search) params.search = filters.search
    if (filters.commune_id) params.commune_id = filters.commune_id
    if (filters.type) params.type = filters.type
    if (filters.risk_level) params.risk_level = filters.risk_level
    if (filters.is_disabled !== '') params.is_disabled = filters.is_disabled
    if (filters.sort_by) params.sort_by = filters.sort_by
    if (filters.sort_direction) params.sort_direction = filters.sort_direction

    return params
  }

  // Apply filters with debouncing for search
  const applyFilters = (callback, debounceMs = 400) => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    searchTimer = setTimeout(() => {
      if (callback && typeof callback === 'function') {
        callback()
      }
    }, debounceMs)
  }

  // Reset all filters
  const resetFilters = () => {
    filters.search = ''
    filters.commune_id = ''
    filters.type = ''
    filters.risk_level = ''
    filters.is_disabled = ''
    filters.sort_by = 'created_at'
    filters.sort_direction = 'desc'
  }

  // Set specific filter
  const setFilter = (key, value) => {
    if (key in filters) {
      filters[key] = value
    }
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    filters.sort_direction = filters.sort_direction === 'asc' ? 'desc' : 'asc'
  }

  // Set sorting
  const setSorting = (sortBy, sortDirection = null) => {
    filters.sort_by = sortBy
    if (sortDirection) {
      filters.sort_direction = sortDirection
    }
  }

  // Get current sort icon
  const getSortIcon = (field) => {
    if (filters.sort_by !== field) return 'bi bi-chevron-expand'
    return filters.sort_direction === 'asc' ? 'bi bi-chevron-up' : 'bi bi-chevron-down'
  }

  // Check if field is currently sorted
  const isSortedBy = (field) => {
    return filters.sort_by === field
  }

  return {
    // State
    filters,
    filterOptions,

    // Computed
    activeFiltersCount,
    hasActiveFilters,

    // Methods
    getFilterParams,
    applyFilters,
    resetFilters,
    setFilter,
    toggleSortDirection,
    setSorting,
    getSortIcon,
    isSortedBy
  }
}