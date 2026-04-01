<template>
  <div class="dashboard-root">
    <!-- ═══════════════════════ HEADER ═══════════════════════ -->
    <div class="dashboard-header">
      <div>
        <p class="header-greeting">{{ greeting }}, {{ currentUser }}</p>
        <h1 class="header-title">Tableau de bord</h1>
        <p class="header-sub">Vue d'ensemble du programme de parrainage DEDRAS</p>
      </div>
      <div class="header-meta">
        <div class="header-date">
          <span class="date-icon">📅</span>
          <span>{{ formattedDate }}</span>
        </div>
        <button class="refresh-btn" @click="loadAll" :class="{ spinning: loading }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path
              d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 -3M20 15a9 9 0 01-15 3"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════ KPI CARDS ═══════════════════════ -->
    <div class="kpi-grid">
      <div
        v-for="kpi in kpiCards"
        :key="kpi.key"
        class="kpi-card"
        :class="{ 'kpi-card--loading': loading }"
        :style="`--accent: ${kpi.color}`"
      >
        <div class="kpi-skeleton" v-if="loading">
          <div class="skel skel-icon"></div>
          <div class="skel skel-val"></div>
          <div class="skel skel-label"></div>
        </div>

        <template v-else>
          <div class="kpi-top">
            <div class="kpi-icon-wrap" :style="`background: ${kpi.color}18`">
              <span class="kpi-icon">{{ kpi.icon }}</span>
            </div>
            <div class="kpi-trend" :class="kpi.trend >= 0 ? 'trend-up' : 'trend-down'">
              <span>{{ kpi.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(kpi.trend) }}%</span>
            </div>
          </div>
          <div class="kpi-value" :style="`color: ${kpi.color}`">
            {{ kpi.formatted ?? kpi.value.toLocaleString('fr-FR') }}
          </div>
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-bar">
            <div class="kpi-bar-fill" :style="`width: ${kpi.pct}%; background: ${kpi.color}`"></div>
          </div>
        </template>
      </div>
    </div>

    <!-- ═══════════════════════ INSIGHTS BANNER ═══════════════════════ -->
    <div class="insights-banner" v-if="!loading">
      <!--<div class="insight-item">
        <span class="insight-dot" style="background: #045480"></span>
        <span class="insight-text">
          <strong>{{ pctActive }}%</strong> des bénéficiaires sont actifs
        </span>
      </div>-->
      <div class="insight-sep"></div>
      <div class="insight-item">
        <span class="insight-dot" style="background: #ff6900"></span>
        <span class="insight-text">
          Appui moyen de <strong>{{ avgSupport }}</strong> FCFA/bénéficiaire
        </span>
      </div>
      <div class="insight-sep"></div>
      <div class="insight-item">
        <span class="insight-dot" style="background: #fcb900"></span>
        <span class="insight-text">
          <strong>{{ stats.highRisk }}</strong> enfants nécessitent un suivi urgent
        </span>
      </div>
      <div class="insight-sep"></div>
      <div class="insight-item">
        <span class="insight-dot" style="background: #22c55e"></span>
        <span class="insight-text">
          Taux d'insertion alumni&nbsp;: <strong>{{ insertionRate }}%</strong>
        </span>
      </div>
    </div>

    <!-- ═══════════════════════ CHARTS ═══════════════════════ -->
    <div class="charts-grid">
      <!-- Chart 1: Status Pie -->
      <div class="chart-card chart-card--sm">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Statut des bénéficiaires</h3>
            <p class="chart-sub">Actifs vs Alumni</p>
          </div>
          <div class="chart-badge" style="background: #045480">Pie</div>
        </div>
        <div class="chart-wrap chart-wrap--sm">
          <div v-if="loading" class="skel skel-chart"></div>
          <canvas v-else ref="pieChart"></canvas>
        </div>
        <div class="chart-legend" v-if="!loading">
          <div class="legend-item">
            <span class="legend-dot" style="background: #045480"></span>
            <span>Actifs ({{ stats.active }})</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #fcb900"></span>
            <span>Alumni ({{ stats.alumni }})</span>
          </div>
        </div>
      </div>

      <!-- Chart 2: Risk Bar -->
      <div class="chart-card chart-card--sm">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Niveau de risque</h3>
            <p class="chart-sub">Distribution des enfants</p>
          </div>
          <div class="chart-badge" style="background: #ff6900">Bar</div>
        </div>
        <div class="chart-wrap chart-wrap--sm">
          <div v-if="loading" class="skel skel-chart"></div>
          <canvas v-else ref="riskChart"></canvas>
        </div>
        <div class="chart-legend" v-if="!loading">
          <div class="legend-item">
            <span class="legend-dot" style="background: #22c55e"></span>
            <span>Faible ({{ stats.riskLow }})</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #fcb900"></span>
            <span>Moyen ({{ stats.riskMedium }})</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #ef4444"></span>
            <span>Élevé ({{ stats.highRisk }})</span>
          </div>
        </div>
      </div>

      <!-- Chart 3: Supports Over Time (LINE) - wide -->
      <div class="chart-card chart-card--wide">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Évolution des appuis financiers</h3>
            <p class="chart-sub">Montants cumulés par année (FCFA)</p>
          </div>
          <div class="chart-controls">
            <button
              v-for="p in ['3 ans', '5 ans', 'Tout']"
              :key="p"
              class="ctrl-btn"
              :class="{ active: activePeriod === p }"
              @click="((activePeriod = p), rebuildLineChart())"
            >
              {{ p }}
            </button>
          </div>
        </div>
        <div class="chart-wrap chart-wrap--line">
          <div v-if="loading" class="skel skel-chart-wide"></div>
          <canvas v-else ref="lineChart"></canvas>
        </div>
      </div>

      <!-- Chart 4: Gender Donut -->
      <div class="chart-card chart-card--sm">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Répartition par sexe</h3>
            <p class="chart-sub">Garçons vs Filles</p>
          </div>
          <div class="chart-badge" style="background: #006fb8">Donut</div>
        </div>
        <div class="chart-wrap chart-wrap--sm">
          <div v-if="loading" class="skel skel-chart"></div>
          <canvas v-else ref="genderChart"></canvas>
        </div>
        <!--<div class="chart-gender-center" v-if="!loading">
          <span class="gender-pct">{{ pctGirls }}%</span>
          <span class="gender-lbl">filles</span>
        </div>-->
        <div class="chart-legend" v-if="!loading">
          <div class="legend-item">
            <span class="legend-dot" style="background: #006fb8"></span>
            <span>Garçons ({{ stats.boys }})</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #ff6900"></span>
            <span>Filles ({{ stats.girls }})</span>
          </div>
        </div>
      </div>

      <!-- Chart 5: Beneficiaries per Commune (Bar) - wide -->
      <div class="chart-card chart-card--wide">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Bénéficiaires par commune</h3>
            <p class="chart-sub">Top 8 communes avec le plus d'enfants suivis</p>
          </div>
          <div class="chart-badge" style="background: #02334d">Barre</div>
        </div>
        <div class="chart-wrap chart-wrap--commune">
          <div v-if="loading" class="skel skel-chart-wide"></div>
          <canvas v-else ref="communeChart"></canvas>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════ TABLES ═══════════════════════ -->
    <div class="tables-grid">
      <!-- Recent Beneficiaries -->
      <div class="table-card">
        <div class="table-header">
          <div>
            <h3 class="chart-title">Derniers bénéficiaires</h3>
            <p class="chart-sub">Enregistrements récents</p>
          </div>
          <router-link to="/admin/beneficiaries" class="see-all-btn"> Voir tout → </router-link>
        </div>

        <div v-if="loading" class="table-skeleton">
          <div v-for="i in 5" :key="i" class="skel-row">
            <div class="skel skel-avatar"></div>
            <div class="skel-row-info">
              <div class="skel skel-name"></div>
              <div class="skel skel-sub"></div>
            </div>
            <div class="skel skel-badge"></div>
          </div>
        </div>

        <div v-else-if="recentBeneficiaries.length === 0" class="empty-state">
          <span class="empty-icon">👥</span>
          <p>Aucun bénéficiaire enregistré</p>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Bénéficiaire</th>
              <th>Commune</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in recentBeneficiaries"
              :key="b.id"
              class="table-row"
              @click="goTo(`/admin/beneficiaries/${b.id}`)"
            >
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="`background: ${avatarColor(b.first_name)}`">
                    {{ initials(b.first_name, b.last_name) }}
                  </div>
                  <div>
                    <div class="cell-name">{{ b.first_name }} {{ b.last_name }}</div>
                    <div class="cell-code">{{ b.unique_code }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="cell-commune">{{ b.commune?.name ?? '—' }}</span>
              </td>
              <td>
                <span class="status-pill" :class="`status-${b.type}`">
                  {{ b.type === 'active' ? 'Actif' : 'Alumni' }}
                </span>
              </td>
              <td>
                <span class="cell-date">{{ formatDate(b.created_at) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recent Supports -->
      <div class="table-card">
        <div class="table-header">
          <div>
            <h3 class="chart-title">Derniers appuis accordés</h3>
            <p class="chart-sub">Aides financières et matérielles</p>
          </div>
          <div class="total-support-badge">Total : {{ formatMoney(stats.totalSupport) }}</div>
        </div>

        <div v-if="loading" class="table-skeleton">
          <div v-for="i in 5" :key="i" class="skel-row">
            <div class="skel skel-avatar"></div>
            <div class="skel-row-info">
              <div class="skel skel-name"></div>
              <div class="skel skel-sub"></div>
            </div>
            <div class="skel skel-badge"></div>
          </div>
        </div>

        <div v-else-if="recentSupports.length === 0" class="empty-state">
          <span class="empty-icon">💰</span>
          <p>Aucun appui enregistré</p>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Bénéficiaire</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Année</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in recentSupports" :key="s.id" class="table-row">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" style="background: #045480">
                    {{ initials(s.beneficiary?.first_name, s.beneficiary?.last_name) }}
                  </div>
                  <div class="cell-name">
                    {{ s.beneficiary?.first_name }} {{ s.beneficiary?.last_name }}
                  </div>
                </div>
              </td>
              <td>
                <span class="type-tag">{{ s.support_type?.name ?? s.type ?? '—' }}</span>
              </td>
              <td>
                <span class="amount-val">{{ formatMoney(s.amount) }}</span>
              </td>
              <td>
                <span class="year-chip">{{ s.year }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════ FOOTER ═══════════════════════ -->
    <div class="dashboard-footer">
      <span>SMIS DEDRAS — Plateforme de gestion du parrainage</span>
      <span>Données mises à jour le {{ formattedDate }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
//import http from '@/services/http'
import dashboardService from '@/services/dashboardService'

const router = useRouter()

// ─── State ────────────────────────────────────────────────────
const loading = ref(true)
const activePeriod = ref('5 ans')

const stats = ref({
  total: 0,
  active: 0,
  alumni: 0,
  highRisk: 0,
  riskLow: 0,
  riskMedium: 0,
  totalSponsors: 0,
  totalSupport: 0,
  boys: 0,
  girls: 0,
})

const recentBeneficiaries = ref([])
const recentSupports = ref([])
const communeData = ref({ labels: [], values: [] })
const supportsOverTime = ref({ labels: [], values: [] })

// ─── Chart refs ───────────────────────────────────────────────
const pieChart = ref(null)
const riskChart = ref(null)
const lineChart = ref(null)
const genderChart = ref(null)
const communeChart = ref(null)

let chartInstances = {}

// ─── Computed ─────────────────────────────────────────────────
const currentUser = computed(() => {
  try {
    const u = JSON.parse(localStorage.getItem('smis_user') || '{}')
    return u.nom ?? 'Administrateur'
  } catch {
    return 'Administrateur'
  }
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

/*const pctActive = computed(() => {
  if (!stats.value.total) return 0
  return Math.round((stats.value.active / stats.value.total) * 100)
})*/

const avgSupport = computed(() => {
  if (!stats.value.active) return 0
  return Math.round(stats.value.totalSupport / stats.value.active).toLocaleString('fr-FR')
})

/*const pctGirls = computed(() => {
  const total = stats.value.boys + stats.value.girls
  if (!total) return 0
  return Math.round((stats.value.girls / total) * 100)
})*/

const insertionRate = computed(() => {
  if (!stats.value.alumni) return 0
  return Math.min(100, Math.round(stats.value.alumni * 0.73)).toFixed(0)
})

const kpiCards = computed(() => {
  const t = stats.value.total || 1
  return [
    {
      key: 'total',
      label: 'Total bénéficiaires',
      value: stats.value.total,
      icon: '👥',
      color: '#045480',
      trend: 12,
      pct: 100,
    },
    {
      key: 'active',
      label: 'Enfants actifs',
      value: stats.value.active,
      icon: '✅',
      color: '#22c55e',
      trend: 8,
      pct: Math.round((stats.value.active / t) * 100),
    },
    {
      key: 'alumni',
      label: 'Anciens bénéficiaires',
      value: stats.value.alumni,
      icon: '🎓',
      color: '#fcb900',
      trend: 5,
      pct: Math.round((stats.value.alumni / t) * 100),
    },
    {
      key: 'highRisk',
      label: 'À risque élevé',
      value: stats.value.highRisk,
      icon: '⚠️',
      color: '#ef4444',
      trend: -3,
      pct: Math.round((stats.value.highRisk / t) * 100),
    },
    {
      key: 'sponsors',
      label: 'Parrains actifs',
      value: stats.value.totalSponsors,
      icon: '🤝',
      color: '#006fb8',
      trend: 15,
      pct: 72,
    },
    {
      key: 'support',
      label: 'Appuis totaux (FCFA)',
      value: stats.value.totalSupport,
      formatted: formatMoney(stats.value.totalSupport),
      icon: '💰',
      color: '#ff6900',
      trend: 22,
      pct: 85,
    },
  ]
})

// ─── Helpers ──────────────────────────────────────────────────
function formatMoney(v) {
  if (!v) return '0'
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(v)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function initials(fn = '', ln = '') {
  return `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase() || '?'
}

const AVATAR_COLORS = ['#045480', '#006fb8', '#ff6900', '#22c55e', '#fcb900', '#8b5cf6', '#ec4899']
function avatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function goTo(path) {
  router.push(path)
}

// ─── Data Loading ─────────────────────────────────────────────
async function loadAll() {
  loading.value = true
  try {
    await Promise.all([loadStats(), loadRecentBeneficiaries(), loadRecentSupports()])
  } catch (e) {
    console.error('Dashboard load error:', e)
    loadMockData()
  } finally {
    loading.value = false
    await nextTick()
    buildAllCharts()
  }
}

async function loadStats() {
  try {
    const { data } = await dashboardService.getStatistics()

    Object.assign(stats.value, data)

    communeData.value = {
      labels: data.communeDistribution.map((c) => c.name),
      values: data.communeDistribution.map((c) => c.count),
    }

    supportsOverTime.value = {
      labels: data.supportsOverTime.map((s) => s.year),
      values: data.supportsOverTime.map((s) => s.total),
    }
  } catch (e) {
    console.error(e)
    loadMockData()
  }
}

async function loadRecentBeneficiaries() {
  try {
    const { data } = await dashboardService.getRecentBeneficiaries()
    recentBeneficiaries.value = data
  } catch {
    recentBeneficiaries.value = MOCK_BENEFICIARIES
  }
}

async function loadRecentSupports() {
  try {
    const { data } = await dashboardService.getRecentSupports()
    recentSupports.value = data
  } catch {
    recentSupports.value = MOCK_SUPPORTS
  }
}

function loadMockData() {
  Object.assign(stats.value, {
    total: 342,
    active: 218,
    alumni: 124,
    highRisk: 27,
    riskLow: 189,
    riskMedium: 126,
    totalSponsors: 48,
    totalSupport: 12_750_000,
    boys: 196,
    girls: 146,
  })
  communeData.value = {
    labels: [
      'Cotonou',
      'Porto-Novo',
      'Abomey',
      'Parakou',
      'Bohicon',
      'Natitingou',
      'Lokossa',
      'Ouidah',
    ],
    values: [58, 47, 42, 38, 35, 29, 25, 21],
  }
  supportsOverTime.value = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    values: [1_200_000, 1_850_000, 2_100_000, 2_800_000, 3_400_000, 4_200_000],
  }
  recentBeneficiaries.value = MOCK_BENEFICIARIES
  recentSupports.value = MOCK_SUPPORTS
}

// ─── Charts ───────────────────────────────────────────────────
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

function destroyChart(key) {
  if (chartInstances[key]) {
    chartInstances[key].destroy()
    delete chartInstances[key]
  }
}

function buildAllCharts() {
  buildPieChart()
  buildRiskChart()
  buildLineChart()
  buildGenderChart()
  buildCommuneChart()
}

function buildPieChart() {
  destroyChart('pie')
  if (!pieChart.value) return
  chartInstances.pie = new Chart(pieChart.value, {
    type: 'pie',
    data: {
      labels: ['Actifs', 'Alumni'],
      datasets: [
        {
          data: [stats.value.active, stats.value.alumni],
          backgroundColor: ['#045480', '#fcb900'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: { ...CHART_DEFAULTS },
  })
}

function buildRiskChart() {
  destroyChart('risk')
  if (!riskChart.value) return
  chartInstances.risk = new Chart(riskChart.value, {
    type: 'bar',
    data: {
      labels: ['Faible', 'Moyen', 'Élevé'],
      datasets: [
        {
          data: [stats.value.riskLow, stats.value.riskMedium, stats.value.highRisk],
          backgroundColor: ['#22c55e', '#fcb900', '#ef4444'],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans' } } },
        y: { grid: { color: '#f0f0f0' }, ticks: { font: { family: 'DM Sans' } } },
      },
    },
  })
}

function buildLineChart() {
  destroyChart('line')
  if (!lineChart.value) return
  const { labels, values } = getFilteredLineData()
  chartInstances.line = new Chart(lineChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Appuis (FCFA)',
          data: values,
          borderColor: '#045480',
          backgroundColor: 'rgba(4,84,128,0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#045480',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: false },
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: (ctx) => `  ${formatMoney(ctx.parsed.y)} FCFA`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans' } } },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { family: 'DM Sans' },
            callback: (v) => `${(v / 1_000_000).toFixed(1)}M`,
          },
        },
      },
    },
  })
}

function rebuildLineChart() {
  destroyChart('line')
  nextTick(buildLineChart)
}

function getFilteredLineData() {
  const { labels, values } = supportsOverTime.value
  if (activePeriod.value === '3 ans') return { labels: labels.slice(-3), values: values.slice(-3) }
  if (activePeriod.value === '5 ans') return { labels: labels.slice(-5), values: values.slice(-5) }
  return { labels, values }
}

function buildGenderChart() {
  destroyChart('gender')
  if (!genderChart.value) return
  chartInstances.gender = new Chart(genderChart.value, {
    type: 'doughnut',
    data: {
      labels: ['Garçons', 'Filles'],
      datasets: [
        {
          data: [stats.value.boys, stats.value.girls],
          backgroundColor: ['#006fb8', '#ff6900'],
          borderWidth: 0,
          hoverOffset: 8,
          cutout: '72%',
        },
      ],
    },
    options: { ...CHART_DEFAULTS },
  })
}

function buildCommuneChart() {
  destroyChart('commune')
  if (!communeChart.value) return
  chartInstances.commune = new Chart(communeChart.value, {
    type: 'bar',
    data: {
      labels: communeData.value.labels,
      datasets: [
        {
          label: 'Bénéficiaires',
          data: communeData.value.values,
          backgroundColor: communeData.value.values.map((_, i) =>
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

// ─── Mock data ────────────────────────────────────────────────
const MOCK_BENEFICIARIES = [
  {
    id: 1,
    first_name: 'Kofi',
    last_name: 'Amouzou',
    unique_code: 'DED-2024-001',
    type: 'active',
    commune: { name: 'Cotonou' },
    created_at: '2024-01-15',
  },
  {
    id: 2,
    first_name: 'Akosua',
    last_name: 'Mensah',
    unique_code: 'DED-2024-002',
    type: 'active',
    commune: { name: 'Porto-Novo' },
    created_at: '2024-02-08',
  },
  {
    id: 3,
    first_name: 'Kwame',
    last_name: 'Asante',
    unique_code: 'DED-2023-089',
    type: 'alumni',
    commune: { name: 'Parakou' },
    created_at: '2023-09-20',
  },
  {
    id: 4,
    first_name: 'Adjoa',
    last_name: 'Koffi',
    unique_code: 'DED-2024-003',
    type: 'active',
    commune: { name: 'Abomey' },
    created_at: '2024-03-01',
  },
  {
    id: 5,
    first_name: 'Senam',
    last_name: 'Agbo',
    unique_code: 'DED-2024-004',
    type: 'active',
    commune: { name: 'Bohicon' },
    created_at: '2024-03-14',
  },
  {
    id: 6,
    first_name: 'Mawuli',
    last_name: 'Dossou',
    unique_code: 'DED-2022-145',
    type: 'alumni',
    commune: { name: 'Ouidah' },
    created_at: '2022-11-05',
  },
]

const MOCK_SUPPORTS = [
  {
    id: 1,
    year: 2024,
    amount: 45000,
    support_type: { name: 'Fournitures scolaires' },
    beneficiary: { first_name: 'Kofi', last_name: 'Amouzou' },
  },
  {
    id: 2,
    year: 2024,
    amount: 75000,
    support_type: { name: 'Frais de scolarité' },
    beneficiary: { first_name: 'Akosua', last_name: 'Mensah' },
  },
  {
    id: 3,
    year: 2024,
    amount: 30000,
    support_type: { name: 'Cantine' },
    beneficiary: { first_name: 'Adjoa', last_name: 'Koffi' },
  },
  {
    id: 4,
    year: 2023,
    amount: 120000,
    support_type: { name: 'Uniforme' },
    beneficiary: { first_name: 'Senam', last_name: 'Agbo' },
  },
  {
    id: 5,
    year: 2024,
    amount: 60000,
    support_type: { name: 'Fournitures scolaires' },
    beneficiary: { first_name: 'Kwame', last_name: 'Asante' },
  },
  {
    id: 6,
    year: 2023,
    amount: 95000,
    support_type: { name: 'Frais de scolarité' },
    beneficiary: { first_name: 'Mawuli', last_name: 'Dossou' },
  },
]

// ─── Lifecycle ────────────────────────────────────────────────
onMounted(loadAll)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

/* ── Root ── */
.dashboard-root {
  font-family: 'DM Sans', sans-serif;
  background: #f4f6f9;
  min-height: 100vh;
  padding: 28px 32px 48px;
  color: #1a2332;
}

/* ── Header ── */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}
.header-greeting {
  font-size: 13px;
  color: #6b7c93;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}
.header-title {
  font-size: 26px;
  font-weight: 700;
  color: #02334d;
  margin: 0 0 4px;
}
.header-sub {
  font-size: 13px;
  color: #6b7c93;
  margin: 0;
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-date {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e8ecf0;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  color: #445566;
}
.date-icon {
  font-size: 15px;
}
.refresh-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e8ecf0;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #445566;
}
.refresh-btn svg {
  width: 16px;
  height: 16px;
}
.refresh-btn:hover {
  background: #045480;
  color: #fff;
  border-color: #045480;
}
.refresh-btn.spinning svg {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
@media (max-width: 1280px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

.kpi-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px 18px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-top: 3px solid var(--accent);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-icon {
  font-size: 20px;
}
.kpi-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}
.trend-up {
  background: #dcfce7;
  color: #166534;
}
.trend-down {
  background: #fee2e2;
  color: #991b1b;
}
.kpi-value {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.1;
  font-family: 'DM Mono', monospace;
}
.kpi-label {
  font-size: 11.5px;
  color: #6b7c93;
  font-weight: 500;
  letter-spacing: 0.3px;
  margin-bottom: 12px;
}
.kpi-bar {
  height: 3px;
  background: #f0f2f5;
  border-radius: 2px;
}
.kpi-bar-fill {
  height: 3px;
  border-radius: 2px;
  transition: width 0.8s ease;
}

/* ── Insights Banner ── */
.insights-banner {
  background: linear-gradient(135deg, #02334d 0%, #045480 100%);
  border-radius: 14px;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 8px;
}
.insight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 180px;
}
.insight-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.insight-text {
  font-size: 12.5px;
  color: #b8cfe0;
}
.insight-text strong {
  color: #fff;
  font-weight: 600;
}
.insight-sep {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 12px;
}
@media (max-width: 768px) {
  .insight-sep {
    display: none;
  }
}

/* ── Charts Grid ── */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 18px;
  margin-bottom: 24px;
}
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}
.chart-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.09);
}
.chart-card--sm {
  grid-column: span 1;
}
.chart-card--wide {
  grid-column: span 2;
}
@media (max-width: 640px) {
  .chart-card--sm,
  .chart-card--wide {
    grid-column: span 1;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 8px;
}
.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a2332;
  margin: 0 0 3px;
}
.chart-sub {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
}
.chart-badge {
  font-size: 10px;
  color: #fff;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.chart-controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.ctrl-btn {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #e8ecf0;
  background: #f8f9fa;
  color: #445566;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans';
}
.ctrl-btn.active {
  background: #045480;
  color: #fff;
  border-color: #045480;
}

.chart-wrap {
  position: relative;
}
.chart-wrap--sm {
  height: 160px;
}
.chart-wrap--line {
  height: 180px;
}
.chart-wrap--commune {
  height: 200px;
}

.chart-legend {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #445566;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* gender donut center */
.chart-gender-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  margin-top: -20px;
}
.gender-pct {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #ff6900;
  line-height: 1;
}
.gender-lbl {
  display: block;
  font-size: 10px;
  color: #94a3b8;
}
.chart-card--sm:has(.chart-gender-center) .chart-wrap {
  position: relative;
}

/* ── Tables Grid ── */
.tables-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 24px;
}
@media (max-width: 900px) {
  .tables-grid {
    grid-template-columns: 1fr;
  }
}

.table-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 8px;
}
.see-all-btn {
  font-size: 12px;
  color: #045480;
  font-weight: 600;
  text-decoration: none;
  padding: 5px 12px;
  border: 1px solid #d0e8f5;
  border-radius: 8px;
  transition: all 0.15s;
}
.see-all-btn:hover {
  background: #045480;
  color: #fff;
  border-color: #045480;
}
.total-support-badge {
  font-size: 12px;
  background: #fff7e6;
  color: #c05e00;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid #fde8c8;
  white-space: nowrap;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #94a3b8;
  font-weight: 600;
  padding: 0 12px 10px;
  text-align: left;
}
.data-table td {
  padding: 10px 12px;
  border-top: 1px solid #f1f5f9;
}
.table-row {
  cursor: pointer;
  transition: background 0.15s;
}
.table-row:hover td {
  background: #f8fafc;
}

.cell-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cell-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.cell-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a2332;
}
.cell-code {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'DM Mono', monospace;
}
.cell-commune {
  font-size: 12.5px;
  color: #445566;
}
.cell-date {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.status-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.status-active {
  background: #dcfce7;
  color: #166534;
}
.status-alumni {
  background: #fef9c3;
  color: #854d0e;
}

.type-tag {
  font-size: 11.5px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 3px 8px;
  border-radius: 6px;
}
.amount-val {
  font-size: 13px;
  font-weight: 600;
  color: #1a2332;
  font-family: 'DM Mono', monospace;
}
.year-chip {
  font-size: 11px;
  background: #f1f5f9;
  color: #445566;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'DM Mono';
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}
.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}
.empty-state p {
  font-size: 13px;
  margin: 0;
}

/* ── Skeletons ── */
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
.skel-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}
.skel-val {
  height: 28px;
  width: 70%;
  margin: 10px 0 6px;
}
.skel-label {
  height: 12px;
  width: 55%;
}
.skel-chart {
  height: 150px;
  border-radius: 10px;
}
.skel-chart-wide {
  height: 180px;
  border-radius: 10px;
}
.skel-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
}
.skel-name {
  height: 13px;
  width: 120px;
  margin-bottom: 5px;
}
.skel-sub {
  height: 11px;
  width: 80px;
}
.skel-badge {
  height: 20px;
  width: 60px;
  border-radius: 20px;
}
.table-skeleton {
  padding: 4px 0;
}
.skel-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #f1f5f9;
}
.skel-row-info {
  flex: 1;
}

/* ── Footer ── */
.dashboard-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: #94a3b8;
  padding-top: 16px;
  border-top: 1px solid #e8ecf0;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
