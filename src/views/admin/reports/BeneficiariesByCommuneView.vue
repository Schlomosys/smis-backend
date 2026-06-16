<template>
  <div class="report-view">
    <!-- Header -->
    <header class="page-hero mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
      <div>
        <p class="page-hero__eyebrow">Rapports</p>
        <h1 class="page-hero__title">Bénéficiaires par commune</h1>
        <p class="page-hero__copy">
          Visualisez la répartition géographique des bénéficiaires par commune. Comparez les
          effectifs et exportez les rapports.
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-light rounded-pill px-4 fw-bold"
          :disabled="loading || communes.length === 0"
          @click="exportExcel"
        >
          Exporter Excel
        </button>
        <button
          type="button"
          class="btn btn-warning rounded-pill px-4 fw-bold"
          :disabled="loading || communes.length === 0"
          @click="exportPdf"
        >
          Exporter PDF
        </button>
      </div>
    </header>

    <!-- KPI Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="stats-card">
          <span class="stats-card__label">Total Communes</span>
          <div v-if="loading" class="skel-wrap">
            <div class="skel skel-val"></div>
            <div class="skel skel-label"></div>
          </div>
          <template v-else>
            <strong class="stats-card__value">{{ totalCommunesCount }}</strong>
            <small class="stats-card__sub text-muted">communes actives enregistrées</small>
          </template>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stats-card">
          <span class="stats-card__label">Bénéficiaires Recensés</span>
          <div v-if="loading" class="skel-wrap">
            <div class="skel skel-val"></div>
            <div class="skel skel-label"></div>
          </div>
          <template v-else>
            <strong class="stats-card__value">{{ totalBeneficiariesCount }}</strong>
            <small class="stats-card__sub text-muted">effectif total cumulé</small>
          </template>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stats-card">
          <span class="stats-card__label">Plus Forte Concentration</span>
          <div v-if="loading" class="skel-wrap">
            <div class="skel skel-val"></div>
            <div class="skel skel-label"></div>
          </div>
          <template v-else>
            <div class="d-flex align-items-center">
              <strong class="stats-card__value text-primary">{{ highestCommuneName }}</strong>
              <span class="badge bg-primary count-badge ms-2" v-if="highestCommuneCount > 0">{{
                highestCommuneCount
              }}</span>
            </div>
            <small class="stats-card__sub text-muted">commune avec le plus grand effectif</small>
          </template>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="row g-4">
      <!-- Left side: Table -->
      <div class="col-lg-7">
        <div class="panel-card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <h2 class="panel-title">Répartition géodémographique</h2>
              <p class="panel-copy mb-0">Recherchez et triez les données par commune.</p>
            </div>
            <div class="d-flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control field-input"
                placeholder="Rechercher..."
                style="max-width: 200px"
              />
              <select v-model="sortBy" class="form-select field-input" style="max-width: 180px">
                <option value="name_asc">Commune (A-Z)</option>
                <option value="name_desc">Commune (Z-A)</option>
                <option value="count_desc">Bénéficiaires (Max-Min)</option>
                <option value="count_asc">Bénéficiaires (Min-Max)</option>
              </select>
            </div>
          </div>

          <div v-if="loading" class="table-skeleton">
            <div v-for="i in 5" :key="i" class="skel-row py-3 d-flex justify-content-between">
              <div class="skel skel-name" style="width: 50%"></div>
              <div class="skel skel-badge" style="width: 20%"></div>
            </div>
          </div>

          <div v-else-if="filteredCommunes.length === 0" class="empty-state p-5 text-center">
            <span class="empty-icon">📍</span>
            <p class="mb-0 text-muted">Aucune donnée trouvée avec ces critères.</p>
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Commune</th>
                    <th>Nombre de bénéficiaires</th>
                    <th>Pourcentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="commune in paginatedCommunes" :key="commune.id" class="table-row">
                    <td>
                      <div class="d-flex align-items-center">
                        <span class="geo-icon me-2">📍</span>
                        <strong>{{ commune.name || 'Inconnu' }}</strong>
                      </div>
                    </td>
                    <td>
                      <span class="badge count-badge bg-primary">
                        {{ commune.beneficiaries_count || 0 }}
                      </span>
                    </td>
                    <td>
                      <strong>{{ calculatePercentage(commune.beneficiaries_count) }}%</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <span class="small text-muted">
                Affichage de {{ startIndex + 1 }} à
                {{ Math.min(startIndex + itemsPerPage, filteredCommunes.length) }} sur
                {{ filteredCommunes.length }} communes
              </span>
              <app-pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredCommunes.length"
                :per-page="itemsPerPage"
                @page-changed="handlePageChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Chart -->
      <div class="col-lg-5">
        <div class="panel-card p-4 h-100 d-flex flex-column">
          <div class="mb-3">
            <h2 class="panel-title">Visualisation graphique</h2>
            <p class="panel-copy">Représentation visuelle des communes (Top 10)</p>
          </div>
          <div class="flex-grow-1 position-relative chart-container" style="min-height: 250px">
            <div v-if="loading" class="skel skel-chart-wide h-100"></div>
            <div
              v-else-if="filteredCommunes.length === 0"
              class="empty-state p-5 text-center h-100 d-flex align-items-center justify-content-center"
            >
              <p class="mb-0 text-muted">Pas de graphique disponible</p>
            </div>
            <canvas v-else ref="chartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'
import reportService from '@/services/reportService'
import AppPagination from '@/components/ui/AppPagination.vue'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const loading = ref(false)
const error = ref('')
const communes = ref([])

const searchQuery = ref('')
const sortBy = ref('count_desc')

const currentPage = ref(1)
const itemsPerPage = ref(10)

const chartCanvas = ref(null)
let chartInstance = null

onMounted(loadData)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const data = await reportService.beneficiariesByCommune()
    communes.value = data || []
  } catch (err) {
    console.error(err)
    error.value = 'Erreur lors du chargement des données de rapport par commune.'
    showToast({ type: 'error', message: error.value })
  } finally {
    loading.value = false
  }
}

// KPI computations
const totalCommunesCount = computed(() => communes.value.length)

const totalBeneficiariesCount = computed(() => {
  return communes.value.reduce((sum, c) => sum + (c.beneficiaries_count || 0), 0)
})

const highestCommune = computed(() => {
  if (communes.value.length === 0) return null
  return [...communes.value].sort(
    (a, b) => (b.beneficiaries_count || 0) - (a.beneficiaries_count || 0),
  )[0]
})

const highestCommuneName = computed(() => highestCommune.value?.name || '—')
const highestCommuneCount = computed(() => highestCommune.value?.beneficiaries_count || 0)

function calculatePercentage(count) {
  if (!totalBeneficiariesCount.value) return '0.0'
  return (((count || 0) / totalBeneficiariesCount.value) * 100).toFixed(1)
}

// Filtering & Sorting
const filteredCommunes = computed(() => {
  let list = [...communes.value]

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    list = list.filter((c) => c.name?.toLowerCase().includes(query))
  }

  // Sort
  list.sort((a, b) => {
    if (sortBy.value === 'name_asc') return (a.name || '').localeCompare(b.name || '')
    if (sortBy.value === 'name_desc') return (b.name || '').localeCompare(a.name || '')
    if (sortBy.value === 'count_desc')
      return (b.beneficiaries_count || 0) - (a.beneficiaries_count || 0)
    if (sortBy.value === 'count_asc')
      return (a.beneficiaries_count || 0) - (b.beneficiaries_count || 0)
    return 0
  })

  return list
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredCommunes.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)

const paginatedCommunes = computed(() => {
  return filteredCommunes.value.slice(startIndex.value, startIndex.value + itemsPerPage.value)
})

function handlePageChange(page) {
  currentPage.value = page
}

// Chart.js implementation
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#02334d',
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'DM Sans, sans-serif', size: 13 },
      bodyFont: { family: 'DM Sans, sans-serif', size: 12 },
    },
  },
}

function buildChart() {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!chartCanvas.value) return

  const sortedData = [...filteredCommunes.value]
    .sort((a, b) => (b.beneficiaries_count || 0) - (a.beneficiaries_count || 0))
    .slice(0, 10)

  if (sortedData.length === 0) return

  const labels = sortedData.map((c) => c.name || 'Inconnu')
  const values = sortedData.map((c) => c.beneficiaries_count || 0)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Bénéficiaires',
          data: values,
          backgroundColor: values.map((_, i) =>
            i === 0 ? '#045480' : `rgba(4,84,128,${0.85 - i * 0.08})`,
          ),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      indexAxis: 'y',
      scales: {
        x: { grid: { color: '#f0f0f0' }, ticks: { font: { family: 'DM Sans' } } },
        y: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 12 } } },
      },
    },
  })
}

watch([filteredCommunes, chartCanvas], () => {
  nextTick(buildChart)
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// CSV/Excel & PDF Export
function buildExportRows() {
  return filteredCommunes.value.map((item) => ({
    Commune: item.name || 'Inconnu',
    'Nombre de bénéficiaires': item.beneficiaries_count || 0,
    Pourcentage: `${calculatePercentage(item.beneficiaries_count)}%`,
  }))
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function exportExcel() {
  const rows = buildExportRows()
  const headers = Object.keys(rows[0] || {})
  const headerCells = headers.map((header) => `<th>${header}</th>`).join('')
  const bodyRows = rows
    .map(
      (row) => `
        <tr>
          ${headers.map((key) => `<td>${String(row[key] ?? '')}</td>`).join('')}
        </tr>`,
    )
    .join('')

  const excelHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `

  downloadBlob(
    excelHtml,
    'beneficiaires-par-commune.xls',
    'application/vnd.ms-excel;charset=utf-8;',
  )
  showToast({ type: 'success', message: 'Export Excel généré avec succès.' })
}

function exportPdf() {
  const rows = buildExportRows()
  const printableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${row['Commune']}</td>
          <td>${row['Nombre de bénéficiaires']}</td>
          <td>${row['Pourcentage']}</td>
        </tr>`,
    )
    .join('')

  const popup = window.open('', '_blank', 'width=800,height=600')
  if (!popup) {
    showToast({ type: 'error', message: 'Veuillez autoriser les popups pour exporter en PDF.' })
    return
  }

  popup.document.write(`
    <html>
      <head>
        <title>Bénéficiaires par commune</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 0 0 24px; color: #475569; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: top; }
          th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
        </style>
      </head>
      <body>
        <h1>Répartition des bénéficiaires par commune</h1>
        <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        <table>
          <thead>
            <tr>
              <th>Commune</th>
              <th>Nombre de bénéficiaires</th>
              <th>Pourcentage</th>
            </tr>
          </thead>
          <tbody>${printableRows}</tbody>
        </table>
      </body>
    </html>
  `)
  popup.document.close()
  popup.focus()
  popup.print()
  showToast({ type: 'success', message: "Fenêtre d'exportation PDF ouverte avec succès." })
}
</script>

<style scoped>
.report-view {
  font-family: 'DM Sans', sans-serif;
  color: #02334d;
}

.page-hero {
  border-radius: 1.75rem;
  background: linear-gradient(135deg, #02334d 0%, #045480 55%, #006fb8 100%);
  color: #ffffff;
  padding: 1.6rem;
  box-shadow: 0 18px 44px rgba(4, 84, 128, 0.12);
}

.page-hero__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-hero__title {
  margin: 0;
  font-size: clamp(1.8rem, 2.7vw, 2.6rem);
  font-weight: 800;
}

.page-hero__copy {
  margin: 0.55rem 0 0;
  max-width: 44rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
}

.stats-card {
  border: 1px solid #d9e7f1;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(4, 84, 128, 0.06);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 120px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(4, 84, 128, 0.1);
}

.stats-card__label {
  color: #698093;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.stats-card__value {
  color: #02334d;
  font-size: 1.8rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

.stats-card__sub {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.panel-card {
  border: 1px solid #d9e7f1;
  border-radius: 1.5rem;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(4, 84, 128, 0.08);
}

.panel-title {
  margin: 0;
  color: #02334d;
  font-size: 1.15rem;
  font-weight: 800;
}

.panel-copy {
  margin: 0.25rem 0 0;
  color: #61788b;
  font-size: 0.88rem;
}

.field-input {
  border: 1px solid #cfd8e0;
  border-radius: 0.75rem;
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
}

.field-input:focus {
  border-color: #045480;
  box-shadow: 0 0 0 3px rgba(4, 84, 128, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.data-table th,
.data-table td {
  padding: 1rem 1.25rem;
  text-align: left;
}

.data-table thead th {
  background: #f4f6f9;
  color: #698093;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
}

.data-table tbody td {
  border-top: 1px solid #f1f5f9;
  font-size: 0.95rem;
  color: #02334d;
}

.table-row {
  transition: background 0.15s;
}

.table-row:hover td {
  background: #f8fafc;
}

.geo-icon {
  font-size: 1.1rem;
}

.count-badge {
  padding: 0.45rem 0.85rem;
  font-weight: 700;
  border-radius: 999px;
  font-size: 0.8rem;
}

.empty-state {
  border: 1px dashed #cfd8e0;
  border-radius: 1.5rem;
  background: #fbfdff;
  color: #698093;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* Skeletons */
.skel-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.skel {
  background: linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

.skel-val {
  height: 28px;
  width: 60%;
}

.skel-label {
  height: 12px;
  width: 45%;
}

.skel-name {
  height: 20px;
  border-radius: 4px;
}

.skel-badge {
  height: 20px;
  border-radius: 10px;
}

.skel-chart-wide {
  height: 220px;
  border-radius: 10px;
}
</style>
