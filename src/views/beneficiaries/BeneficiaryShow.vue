<template>
  <section class="beneficiary-show-page">
    <div class="page-shell">
      <header class="hero-banner">
        <div class="hero-banner__copy">
          <p class="hero-banner__eyebrow">Beneficiary detail</p>
          <h1 class="hero-banner__title">{{ fullName }}</h1>
          <p class="hero-banner__text">
            Consultez le profil, les parrainages, les appuis, les informations academiques et l'historique familial.
          </p>
        </div>

        <div class="hero-banner__actions">
          <router-link to="/admin/beneficiaries" class="ghost-button">Retour a la liste</router-link>
          <router-link
            v-if="beneficiary?.id"
            :to="`/admin/beneficiaries/${beneficiary.id}/edit`"
            class="primary-button"
          >
            Modifier le profil
          </router-link>
        </div>
      </header>

      <div v-if="loading" class="state-card">
        <div class="state-card__skeleton"></div>
        <div class="state-card__content">
          <div class="state-card__line"></div>
          <div class="state-card__line state-card__line--short"></div>
        </div>
      </div>

      <template v-else-if="beneficiary">
        <section class="profile-card">
          <div class="profile-card__identity">
            <UserAvatar
              :first-name="beneficiary.first_name || 'N'"
              :last-name="beneficiary.last_name || 'A'"
              :photo-url="photoUrl"
              size="xl"
              block
            />

            <div class="profile-card__summary">
              <div class="badge-row">
                <span :class="['status-badge', beneficiary.type === 'alumni' ? 'status-badge--alumni' : 'status-badge--active']">
                  {{ beneficiary.type || 'non defini' }}
                </span>
                <span v-if="beneficiary.is_disabled" class="status-badge status-badge--highlight">Handicap</span>
              </div>

              <h2 class="profile-card__name">{{ fullName }}</h2>

              <div class="profile-card__meta">
                <span>{{ beneficiary.unique_code || 'Code indisponible' }}</span>
                <span>|</span>
                <span>{{ beneficiary.gender || 'Genre non renseigne' }}</span>
                <span>|</span>
                <span>{{ ageLabel }}</span>
              </div>
            </div>
          </div>

          <div class="metric-grid">
            <article class="metric-card">
              <span class="metric-card__label">Telephone</span>
              <strong>{{ beneficiary.phone || '-' }}</strong>
            </article>
            <article class="metric-card">
              <span class="metric-card__label">Email</span>
              <strong>{{ beneficiary.email || '-' }}</strong>
            </article>
            <article class="metric-card">
              <span class="metric-card__label">Statut</span>
              <strong>{{ beneficiary.current_status || beneficiary.type || '-' }}</strong>
            </article>
            <article class="metric-card">
              <span class="metric-card__label">Vulnerabilite</span>
              <strong>{{ beneficiary.vulnerability_type || '-' }}</strong>
            </article>
          </div>
        </section>

        <section class="overview-grid">
          <article class="detail-card">
            <div class="detail-card__header">
              <h3>Vue d'ensemble</h3>
              <span class="detail-card__accent">Overview</span>
            </div>

            <dl class="detail-list">
              <div><dt>Pays actuel</dt><dd>{{ beneficiary.current_country || '-' }}</dd></div>
              <div><dt>Ville actuelle</dt><dd>{{ beneficiary.current_city || '-' }}</dd></div>
              <div><dt>Niveau initial</dt><dd>{{ beneficiary.initial_education_level || '-' }}</dd></div>
              <div><dt>Date d'entree</dt><dd>{{ formatDate(beneficiary.entry_date) }}</dd></div>
              <div><dt>Date de sortie</dt><dd>{{ formatDate(beneficiary.exit_date) }}</dd></div>
              <div><dt>Date de naissance</dt><dd>{{ formatDate(beneficiary.date_of_birth) }}</dd></div>
            </dl>
          </article>

          <article class="detail-card detail-card--summary">
            <div class="detail-card__header">
              <h3>Resume rapide</h3>
              <span class="detail-card__accent detail-card__accent--orange">Snapshot</span>
            </div>

            <p>
              {{ fullName }} est actuellement marque comme <strong>{{ beneficiary.type || 'profil non defini' }}</strong>
              avec un statut <strong>{{ beneficiary.current_status || 'non renseigne' }}</strong>.
            </p>
            <p>Cette zone met en avant les informations d'identification et de contact avant les actions detaillees.</p>
          </article>
        </section>

        <section class="tabs-card">
          <div class="tabs-card__header">
            <div>
              <h3>Actions du beneficiaire</h3>
              <p>Choisissez un onglet pour gerer les donnees detaillees sans quitter la page.</p>
            </div>

            <div class="quick-actions">
              <button type="button" class="ghost-button" @click="activeTab = 'academic-records'">Academique</button>
              <button type="button" class="ghost-button" @click="activeTab = 'supports'">Appuis</button>
              <button type="button" class="ghost-button" @click="activeTab = 'sponsorships'">Parrainages</button>
              <button type="button" class="ghost-button" @click="activeTab = 'family-history'">Famille</button>
            </div>
          </div>

          <Tabs v-model="activeTab" :tabs="tabs" />

          <div class="tab-content">
            <div v-if="activeTab === 'overview'" class="overview-placeholder">
              Les informations de synthese sont affichees dans les cartes au-dessus.
            </div>
            <AcademicTab
              v-else-if="activeTab === 'academic-records'"
              :beneficiary-id="route.params.id"
              :schools="schools"
              @updated="reloadBeneficiary"
            />
            <SponsorshipTab
              v-else-if="activeTab === 'sponsorships'"
              :beneficiary-id="route.params.id"
              :sponsors="sponsors"
              @updated="reloadBeneficiary"
            />
            <SupportTab
              v-else-if="activeTab === 'supports'"
              :beneficiary-id="route.params.id"
              :support-types="supportTypes"
              :sponsorships="beneficiarySponsorships"
              @updated="reloadBeneficiary"
            />
            <FamilyTab
              v-else
              :beneficiary-id="route.params.id"
              :families="families"
              @updated="reloadBeneficiary"
            />
          </div>
        </section>
      </template>

      <div v-else class="empty-card">Aucune donnee disponible pour ce beneficiaire.</div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AcademicTab from '@/components/beneficiaries/AcademicTab.vue'
import FamilyTab from '@/components/beneficiaries/FamilyTab.vue'
import SponsorshipTab from '@/components/beneficiaries/SponsorshipTab.vue'
import SupportTab from '@/components/beneficiaries/SupportTab.vue'
import Tabs from '@/components/beneficiaries/Tabs.vue'
import UserAvatar from '@/components/shared/UserAvatar.vue'
import { useToast } from '@/composables/useToast'
import beneficiaryService from '@/services/beneficiaryService'

const route = useRoute()
const { showToast } = useToast()
const loading = ref(false)
const beneficiary = ref(null)
const referenceData = ref({})
const activeTab = ref('overview')

const tabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Academic Records', value: 'academic-records' },
  { label: 'Supports', value: 'supports' },
  { label: 'Sponsorships', value: 'sponsorships' },
  { label: 'Family History', value: 'family-history' },
]

const fullName = computed(() => {
  const parts = [beneficiary.value?.first_name, beneficiary.value?.last_name].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Beneficiary'
})

const photoUrl = computed(() =>
  resolvePhotoUrl(
    beneficiary.value?.photo_url || beneficiary.value?.photo || beneficiary.value?.photo_path || beneficiary.value?.image || beneficiary.value?.image_url || beneficiary.value?.avatar_url || '',
  ),
)
const sponsors = computed(() => normalizeCollection(referenceData.value.sponsors))
const schools = computed(() => normalizeCollection(referenceData.value.schools))
const supportTypes = computed(() => normalizeCollection(referenceData.value.supportTypes || referenceData.value.support_types))
const beneficiarySponsorships = computed(() => normalizeCollection(beneficiary.value?.sponsorships || beneficiary.value?.sponsorship))
const families = computed(() => normalizeCollection(referenceData.value.families || referenceData.value.family_profiles || referenceData.value.familyProfiles))
const ageLabel = computed(() => {
  const age = calculateAge(beneficiary.value?.date_of_birth)
  return age === null ? 'Age indisponible' : `${age} ans`
})

onMounted(async () => {
  await Promise.all([loadReferenceData(), loadBeneficiary()])
})

function normalizeCollection(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

async function loadReferenceData() {
  try {
    referenceData.value = await beneficiaryService.getReferenceData()
  } catch {
    referenceData.value = {}
  }
}

async function loadBeneficiary() {
  loading.value = true
  try {
    const response = await beneficiaryService.getById(route.params.id)
    beneficiary.value = response?.beneficiary || response?.data || response
  } catch (error) {
    beneficiary.value = null
    showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load beneficiary.' })
  } finally {
    loading.value = false
  }
}

async function reloadBeneficiary() {
  await loadBeneficiary()
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

function resolvePhotoUrl(value) {
  if (!value) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) return raw
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/i, '').replace(/\/$/, '')
  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`
  if (apiBase) {
    if (normalizedPath.startsWith('/storage/')) return `${apiBase}${normalizedPath}`
    if (normalizedPath.startsWith('/public/')) return `${apiBase}${normalizedPath.replace(/^\/public/i, '/storage')}`
    return `${apiBase}${normalizedPath}`
  }
  return normalizedPath
}

function calculateAge(dateString) {
  if (!dateString) return null
  const birthDate = new Date(dateString)
  if (Number.isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1
  return age >= 0 ? age : null
}
</script>

<style scoped>
.beneficiary-show-page{padding-bottom:2rem}.page-shell{display:flex;flex-direction:column;gap:1.5rem}.hero-banner,.profile-card,.detail-card,.tabs-card,.state-card,.empty-card{border:1px solid #d9e7f1;border-radius:1.75rem;background:#fff;box-shadow:0 18px 44px rgba(4,84,128,.08)}.hero-banner{display:flex;justify-content:space-between;gap:1.25rem;flex-wrap:wrap;background:linear-gradient(135deg,#02334d 0%,#045480 60%,#006fb8 100%);color:#fff;padding:1.6rem}.hero-banner__eyebrow{margin:0 0 .35rem;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero-banner__title{margin:0;font-size:clamp(1.9rem,2.8vw,2.8rem);font-weight:800}.hero-banner__text{margin:.55rem 0 0;max-width:42rem;color:rgba(255,255,255,.84)}.hero-banner__actions,.badge-row,.quick-actions{display:flex;flex-wrap:wrap;gap:.75rem}.ghost-button,.primary-button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.85rem 1.2rem;font-weight:700;text-decoration:none;transition:all .2s ease}.ghost-button{border:1px solid #cfd8e0;background:#fff;color:#02334d}.ghost-button:hover,.primary-button:hover{transform:translateY(-1px)}.primary-button{border:1px solid #ff6900;background:#ff6900;color:#fff}.profile-card,.tabs-card{padding:1.5rem}.profile-card{display:flex;flex-direction:column;gap:1.25rem;background:linear-gradient(180deg,#fff 0%,#f8fcff 100%)}.profile-card__identity{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}.profile-card__summary{display:flex;flex-direction:column;gap:.55rem}.profile-card__name{margin:0;color:#02334d;font-size:clamp(1.55rem,2vw,2.1rem);font-weight:800}.profile-card__meta{display:flex;flex-wrap:wrap;gap:.55rem;color:#637a8d;font-weight:600}.status-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.45rem .8rem;font-size:.82rem;font-weight:700;text-transform:capitalize}.status-badge--active{background:rgba(77,163,217,.18);color:#045480}.status-badge--alumni{background:rgba(252,185,0,.18);color:#9a6c00}.status-badge--highlight{background:rgba(255,105,0,.16);color:#c25100}.metric-grid,.overview-grid,.detail-list{display:grid;gap:1rem}.metric-card{border-radius:1.25rem;background:#fff;padding:1rem}.metric-card__label,.detail-list dt{color:#698093;font-size:.82rem;font-weight:700;text-transform:uppercase}.metric-card strong,.detail-list dd{color:#02334d;font-size:1rem;font-weight:700}.detail-card{padding:1.4rem}.detail-card__header,.tabs-card__header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap}.detail-card__header h3,.tabs-card__header h3{margin:0;color:#02334d;font-size:1.15rem;font-weight:800}.detail-card__accent{border-radius:999px;background:#e6f3fb;color:#045480;padding:.45rem .8rem;font-size:.82rem;font-weight:700}.detail-card__accent--orange{background:#fff2e8;color:#c25100}.detail-list{margin:1.1rem 0 0}.detail-list dd{margin:.25rem 0 0}.detail-card--summary p,.tabs-card__header p{margin:.8rem 0 0;color:#637a8d;line-height:1.65}.tabs-card{display:flex;flex-direction:column;gap:1rem}.tab-content{min-height:180px}.overview-placeholder,.empty-card{border-radius:1.25rem;background:#f8fcff;color:#698093;padding:1.25rem;text-align:center}.state-card{display:flex;align-items:center;gap:1rem;padding:1.4rem}.state-card__skeleton{width:5rem;height:5rem;border-radius:1.5rem;background:linear-gradient(90deg,#e6f3fb,#f3f8fb,#e6f3fb);background-size:200% 100%;animation:shimmer 1.2s infinite}.state-card__content{flex:1}.state-card__line{height:.95rem;border-radius:999px;background:linear-gradient(90deg,#e6f3fb,#f3f8fb,#e6f3fb);background-size:200% 100%;animation:shimmer 1.2s infinite}.state-card__line+.state-card__line{margin-top:.65rem}.state-card__line--short{width:55%}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@media (min-width:768px){.metric-grid,.overview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.detail-list{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (min-width:1200px){.metric-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
</style>
