<template>
  <section class="supports-report-page">
    <div class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Support Report</p>
          <h1 class="page-title">{{ beneficiaryName }}</h1>
          <p class="page-copy">
            Review every support record linked to this beneficiary and export the dataset as PDF or Excel.
          </p>
        </div>

        <div class="header-actions">
          <router-link :to="`/admin/beneficiaries/${route.params.id}`" class="ghost-button">
            Back to beneficiary
          </router-link>
          <button type="button" class="ghost-button" :disabled="loading || supports.length === 0" @click="exportExcel">
            Export Excel
          </button>
          <button type="button" class="primary-button" :disabled="loading || supports.length === 0" @click="exportPdf">
            Export PDF
          </button>
        </div>
      </div>

      <div v-if="loading" class="state-card">
        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        <span>Loading beneficiary support details...</span>
      </div>

      <div v-else-if="loadError" class="error-card">
        {{ loadError }}
      </div>

      <div v-else-if="supports.length === 0" class="empty-card">
        No support records found for this beneficiary.
      </div>

      <div v-else class="report-card">
        <div class="report-summary">
          <div class="summary-item">
            <span class="summary-label">Support records</span>
            <strong>{{ supports.length }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total amount</span>
            <strong>{{ formatAmount(totalAmount) }}</strong>
          </div>
        </div>

        <div class="table-scroll">
          <table class="supports-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Amount</th>
                <th>Support type</th>
                <th>Frequency</th>
                <th>Sponsor</th>
                <th>Sponsorship</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in supports" :key="item.id || `${item.year}-${item.support_type_id}`">
                <td>{{ item.year || '-' }}</td>
                <td>{{ formatAmount(item.amount) }}</td>
                <td>{{ getSupportTypeName(item) }}</td>
                <td>{{ item.frequency || '-' }}</td>
                <td>{{ getSponsorName(item) }}</td>
                <td>{{ getSponsorshipLabel(item) }}</td>
                <td>{{ item.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import beneficiaryService from '@/services/beneficiaryService'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { showToast } = useToast()

const loading = ref(false)
const loadError = ref('')
const beneficiary = ref(null)
const supports = ref([])
const referenceData = ref({})

const beneficiaryName = computed(() => {
  const parts = [beneficiary.value?.first_name, beneficiary.value?.last_name].filter(Boolean)
  return parts.length ? `${parts.join(' ')} Support Details` : 'Beneficiary Support Details'
})

const supportTypes = computed(() =>
  normalizeCollection(referenceData.value.supportTypes || referenceData.value.support_types),
)

const sponsorships = computed(() =>
  normalizeCollection(beneficiary.value?.sponsorships || beneficiary.value?.sponsorship),
)

const totalAmount = computed(() =>
  supports.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
)

onMounted(loadPage)

function normalizeCollection(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.supports)) return value.supports
  if (Array.isArray(value?.supports?.data)) return value.supports.data
  return []
}

async function loadPage() {
  loading.value = true
  loadError.value = ''

  try {
    const [beneficiaryResponse, supportsResponse, referenceResponse] = await Promise.all([
      beneficiaryService.getById(route.params.id),
      beneficiaryService.getSupports(route.params.id),
      beneficiaryService.getReferenceData(),
    ])

    beneficiary.value = beneficiaryResponse?.beneficiary || beneficiaryResponse?.data || beneficiaryResponse
    supports.value = normalizeCollection(supportsResponse)
    referenceData.value = referenceResponse || {}
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Unable to load beneficiary support details.'
    showToast({ type: 'error', message: loadError.value })
  } finally {
    loading.value = false
  }
}

function getSupportTypeName(item) {
  return item.supportType?.name
    || item.support_type?.name
    || supportTypes.value.find((option) => String(option.id) === String(item.support_type_id))?.name
    || `Support type #${item.support_type_id || 'N/A'}`
}

function getRelatedSponsorship(item) {
  return item.sponsorship
    || sponsorships.value.find((option) => String(option.id) === String(item.sponsorship_id))
    || null
}

function getSponsorName(item) {
  const sponsorship = getRelatedSponsorship(item)
  return sponsorship?.sponsor?.name || sponsorship?.sponsor_name || sponsorship?.name || '-'
}

function getSponsorshipLabel(item) {
  const sponsorship = getRelatedSponsorship(item)
  if (!sponsorship) return '-'

  const sponsorName = sponsorship?.sponsor?.name || sponsorship?.sponsor_name || sponsorship?.name || `#${sponsorship.id}`
  const startDate = sponsorship.start_date ? ` (${String(sponsorship.start_date).slice(0, 10)})` : ''
  return `${sponsorName}${startDate}`
}

function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '-'
  const amount = Number(value)
  return Number.isNaN(amount)
    ? String(value)
    : amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function buildExportRows() {
  return supports.value.map((item) => ({
    Year: item.year || '-',
    Amount: formatAmount(item.amount),
    SupportType: getSupportTypeName(item),
    Frequency: item.frequency || '-',
    Sponsor: getSponsorName(item),
    Sponsorship: getSponsorshipLabel(item),
    Notes: item.notes || '-',
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

  const filename = `beneficiary-supports-${route.params.id}.xls`
  downloadBlob(excelHtml, filename, 'application/vnd.ms-excel;charset=utf-8;')
  showToast({ type: 'success', message: 'Excel export generated successfully.' })
}

function exportPdf() {
  const rows = buildExportRows()
  const printableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${row.Year}</td>
          <td>${row.Amount}</td>
          <td>${row.SupportType}</td>
          <td>${row.Frequency}</td>
          <td>${row.Sponsor}</td>
          <td>${row.Sponsorship}</td>
          <td>${row.Notes}</td>
        </tr>`,
    )
    .join('')

  const popup = window.open('', '_blank', 'width=1200,height=800')
  if (!popup) {
    showToast({ type: 'error', message: 'Please allow popups to export PDF.' })
    return
  }

  popup.document.write(`
    <html>
      <head>
        <title>${beneficiaryName.value}</title>
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
        <h1>${beneficiaryName.value}</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Amount</th>
              <th>Support type</th>
              <th>Frequency</th>
              <th>Sponsor</th>
              <th>Sponsorship</th>
              <th>Notes</th>
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
  showToast({ type: 'success', message: 'PDF export window opened successfully.' })
}
</script>

<style scoped>
.supports-report-page {
  padding: 1.5rem 0 3rem;
}

.page-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #0f766e;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  font-weight: 700;
}

.page-copy {
  margin: 0.5rem 0 0;
  max-width: 44rem;
  color: #475569;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.state-card,
.error-card,
.empty-card,
.report-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
}

.state-card,
.error-card,
.empty-card {
  padding: 1.25rem 1.5rem;
}

.state-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-card {
  color: #b91c1c;
  background: #fff1f2;
  border-color: #fecdd3;
}

.empty-card {
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

.report-card {
  overflow: hidden;
}

.report-summary {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #ffffff 45%, #ecfeff);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary-label {
  color: #64748b;
  font-size: 0.85rem;
}

.table-scroll {
  overflow-x: auto;
}

.supports-table {
  width: 100%;
  border-collapse: collapse;
}

.supports-table th,
.supports-table td {
  padding: 1rem 1.1rem;
  text-align: left;
  vertical-align: top;
}

.supports-table thead th {
  background: #f8fafc;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.supports-table tbody tr + tr td {
  border-top: 1px solid #e2e8f0;
}

.ghost-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.8rem 1.25rem;
  font-weight: 600;
  text-decoration: none;
}

.ghost-button {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.primary-button {
  border: 1px solid #0f766e;
  background: linear-gradient(135deg, #0f766e, #0ea5a4);
  color: #fff;
}

@media (min-width: 992px) {
  .report-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
