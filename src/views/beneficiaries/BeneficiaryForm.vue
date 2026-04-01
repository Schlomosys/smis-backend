<template>
  <section class="beneficiary-form-page">
    <div class="page-shell">
      <header class="page-hero">
        <div>
          <p class="page-hero__eyebrow">Beneficiary form</p>
          <h1 class="page-hero__title">{{ isEditing ? 'Modifier un beneficiaire' : 'Nouveau beneficiaire' }}</h1>
          <p class="page-hero__copy">Organisez les informations personnelles, de contact et de programme dans une fiche claire et responsive.</p>
        </div>

        <router-link to="/admin/beneficiaries" class="ghost-button">Retour a la liste</router-link>
      </header>

      <div v-if="loading" class="loading-card">
        <div class="loading-card__block"></div>
        <div class="loading-card__copy">
          <div class="loading-card__line"></div>
          <div class="loading-card__line loading-card__line--short"></div>
        </div>
      </div>

      <div v-else class="form-shell">
        <div v-if="formError" class="alert alert-danger mb-0" role="alert">{{ formError }}</div>

        <form class="beneficiary-form" @submit.prevent="submitForm">
          <section class="form-section">
            <div class="form-section__header"><h2>Informations personnelles</h2><p>Identite, code unique, photo et elements de base du profil.</p></div>
            <div class="form-grid form-grid--three">
              <div class="field-block"><label class="field-label" for="unique_code">Code unique</label><input id="unique_code" v-model="form.unique_code" type="text" class="field-input" :class="{ 'is-invalid': errors.unique_code }" placeholder="Ex: BNF-2026-001" /><p v-if="errors.unique_code" class="field-error">{{ errors.unique_code }}</p></div>
              <div class="field-block"><label class="field-label" for="first_name">Prenom <span class="required-mark">*</span></label><input id="first_name" v-model="form.first_name" type="text" class="field-input" :class="{ 'is-invalid': errors.first_name }" placeholder="Entrer le prenom" /><p v-if="errors.first_name" class="field-error">{{ errors.first_name }}</p></div>
              <div class="field-block"><label class="field-label" for="last_name">Nom <span class="required-mark">*</span></label><input id="last_name" v-model="form.last_name" type="text" class="field-input" :class="{ 'is-invalid': errors.last_name }" placeholder="Entrer le nom" /><p v-if="errors.last_name" class="field-error">{{ errors.last_name }}</p></div>
              <div class="field-block"><label class="field-label" for="gender">Genre</label><select id="gender" v-model="form.gender" class="field-input" :class="{ 'is-invalid': errors.gender }"><option value="">Selectionner</option><option value="male">Masculin</option><option value="female">Feminin</option></select><p v-if="errors.gender" class="field-error">{{ errors.gender }}</p></div>
              <div class="field-block"><label class="field-label" for="date_of_birth">Date de naissance</label><input id="date_of_birth" v-model="form.date_of_birth" type="date" class="field-input" :class="{ 'is-invalid': errors.date_of_birth }" /><p v-if="computedAge !== null" class="field-help">Age estime: {{ computedAge }} ans</p><p v-if="errors.date_of_birth" class="field-error">{{ errors.date_of_birth }}</p></div>
              <div class="field-block"><label class="checkbox-row"><input v-model="form.is_disabled" type="checkbox" class="checkbox-input" /><span>Beneficiaire en situation de handicap</span></label></div>
            </div>
          </section>

          <section class="form-section">
            <div class="form-section__header"><h2>Contact</h2><p>Coordonnees actuelles et lieu de residence.</p></div>
            <div class="form-grid">
              <div class="field-block"><label class="field-label" for="phone">Telephone</label><input id="phone" v-model="form.phone" type="text" class="field-input" :class="{ 'is-invalid': errors.phone }" placeholder="Numero de telephone" /><p v-if="errors.phone" class="field-error">{{ errors.phone }}</p></div>
              <div class="field-block"><label class="field-label" for="email">Email</label><input id="email" v-model="form.email" type="email" class="field-input" :class="{ 'is-invalid': errors.email }" placeholder="Adresse email" /><p v-if="errors.email" class="field-error">{{ errors.email }}</p></div>
              <div class="field-block"><label class="field-label" for="current_country">Pays actuel</label><input id="current_country" v-model="form.current_country" type="text" class="field-input" :class="{ 'is-invalid': errors.current_country }" placeholder="Pays de residence" /><p v-if="errors.current_country" class="field-error">{{ errors.current_country }}</p></div>
              <div class="field-block"><label class="field-label" for="current_city">Ville actuelle</label><input id="current_city" v-model="form.current_city" type="text" class="field-input" :class="{ 'is-invalid': errors.current_city }" placeholder="Ville de residence" /><p v-if="errors.current_city" class="field-error">{{ errors.current_city }}</p></div>
            </div>
          </section>

          <section class="form-section">
            <div class="form-section__header"><h2>Informations programme</h2><p>Type de beneficiaire, niveau initial, vulnerabilite et suivi.</p></div>
            <div class="form-grid">
              <div class="field-block"><label class="field-label" for="type">Type</label><select id="type" v-model="form.type" class="field-input" :class="{ 'is-invalid': errors.type }"><option value="">Selectionner</option><option value="active">Actif</option><option value="alumni">Alumni</option></select><p v-if="errors.type" class="field-error">{{ errors.type }}</p></div>
              <div class="field-block"><label class="field-label" for="entry_date">Date d'entree</label><input id="entry_date" v-model="form.entry_date" type="date" class="field-input" :class="{ 'is-invalid': errors.entry_date }" /><p v-if="errors.entry_date" class="field-error">{{ errors.entry_date }}</p></div>
              <div class="field-block"><label class="field-label" for="exit_date">Date de sortie</label><input id="exit_date" v-model="form.exit_date" type="date" class="field-input" :class="{ 'is-invalid': errors.exit_date }" :disabled="form.type !== 'alumni'" /><p class="field-help">{{ form.type === 'alumni' ? 'Champ actif pour les alumni.' : 'Disponible uniquement pour les alumni.' }}</p><p v-if="errors.exit_date" class="field-error">{{ errors.exit_date }}</p></div>
              <div class="field-block"><label class="field-label" for="vulnerability_type">Type de vulnerabilite</label><input id="vulnerability_type" v-model="form.vulnerability_type" type="text" class="field-input" :class="{ 'is-invalid': errors.vulnerability_type }" placeholder="Description" /><p v-if="errors.vulnerability_type" class="field-error">{{ errors.vulnerability_type }}</p></div>
              <div class="field-block"><label class="field-label" for="initial_education_level">Niveau initial</label><input id="initial_education_level" v-model="form.initial_education_level" type="text" class="field-input" :class="{ 'is-invalid': errors.initial_education_level }" placeholder="Niveau d'etude" /><p v-if="errors.initial_education_level" class="field-error">{{ errors.initial_education_level }}</p></div>
              <div class="field-block field-block--full"><label class="field-label" for="current_status">Statut actuel</label><input id="current_status" v-model="form.current_status" type="text" class="field-input" :class="{ 'is-invalid': errors.current_status }" placeholder="Statut ou situation actuelle" /><p v-if="errors.current_status" class="field-error">{{ errors.current_status }}</p></div>
            </div>
          </section>

          <section class="form-section">
            <div class="form-section__header"><h2>Photo du beneficiaire</h2><p>Ajoutez une image de profil avec previsualisation immediate.</p></div>
            <div class="media-grid">
              <div class="field-block"><label class="field-label" for="photo">Photo</label><input id="photo" ref="photoInput" type="file" class="field-input" accept="image/*" @change="handlePhotoChange" /><p v-if="errors.photo" class="field-error">{{ errors.photo }}</p></div>
              <div class="preview-card"><div class="preview-card__image"><img v-if="photoPreview" :src="photoPreview" alt="Beneficiary preview" class="photo-preview" /><div v-else class="photo-placeholder">Aucune photo selectionnee</div></div><div><p class="preview-card__title">Previsualisation</p><p class="preview-card__text">L'image sera envoyee avec le formulaire en multipart/form-data.</p></div></div>
            </div>
          </section>

          <div class="form-actions">
            <router-link to="/admin/beneficiaries" class="ghost-button">Annuler</router-link>
            <button type="submit" class="primary-button" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ saving ? 'Enregistrement...' : isEditing ? 'Mettre a jour' : 'Creer le beneficiaire' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import beneficiaryService from '@/services/beneficiaryService'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const loading = ref(false)
const saving = ref(false)
const formError = ref('')
const photoInput = ref(null)
const photoPreview = ref('')
const currentPreviewUrl = ref('')

const form = reactive({ unique_code:'', first_name:'', last_name:'', phone:'', email:'', current_country:'', current_city:'', vulnerability_type:'', initial_education_level:'', current_status:'', gender:'', type:'active', date_of_birth:'', entry_date:'', exit_date:'', is_disabled:false, photo:null })
const errors = reactive({ unique_code:'', first_name:'', last_name:'', gender:'', type:'', date_of_birth:'', entry_date:'', exit_date:'', phone:'', email:'', current_country:'', current_city:'', vulnerability_type:'', initial_education_level:'', current_status:'', photo:'' })
const isEditing = computed(() => Boolean(route.params.id))
const computedAge = computed(() => calculateAge(form.date_of_birth))

onMounted(async () => {
  if (!isEditing.value) return
  loading.value = true
  try {
    const response = await beneficiaryService.getById(route.params.id)
    const beneficiary = response?.beneficiary || response?.data || response
    populateForm(beneficiary)
  } catch (error) {
    formError.value = error.response?.data?.message || error.message || 'Unable to load beneficiary.'
    showToast({ type: 'error', message: 'Unable to load beneficiary details.' })
  } finally {
    loading.value = false
  }
})

watch(() => form.type, (value) => { if (value !== 'alumni') { form.exit_date = ''; errors.exit_date = '' } })
onBeforeUnmount(() => { clearPreviewUrl() })

function populateForm(beneficiary = {}) {
  form.unique_code = beneficiary.unique_code || ''
  form.first_name = beneficiary.first_name || ''
  form.last_name = beneficiary.last_name || ''
  form.phone = beneficiary.phone || ''
  form.email = beneficiary.email || ''
  form.current_country = beneficiary.current_country || ''
  form.current_city = beneficiary.current_city || ''
  form.vulnerability_type = beneficiary.vulnerability_type || ''
  form.initial_education_level = beneficiary.initial_education_level || ''
  form.current_status = beneficiary.current_status || ''
  form.gender = beneficiary.gender || ''
  form.type = beneficiary.type || 'active'
  form.date_of_birth = normalizeDateInput(beneficiary.date_of_birth)
  form.entry_date = normalizeDateInput(beneficiary.entry_date)
  form.exit_date = normalizeDateInput(beneficiary.exit_date)
  form.is_disabled = Boolean(beneficiary.is_disabled)
  form.photo = null
  setPhotoPreview(beneficiary.photo_url || beneficiary.photo || beneficiary.avatar_url || '')
}

function normalizeDateInput(value) { if (!value) return ''; return String(value).slice(0, 10) }
function clearPreviewUrl() { if (currentPreviewUrl.value) { URL.revokeObjectURL(currentPreviewUrl.value); currentPreviewUrl.value = '' } }
function setPhotoPreview(value) { clearPreviewUrl(); photoPreview.value = value || '' }

function handlePhotoChange(event) {
  const [file] = event.target.files || []
  form.photo = file || null
  errors.photo = ''
  if (!file) { if (!isEditing.value) setPhotoPreview(''); return }
  if (!file.type.startsWith('image/')) {
    errors.photo = 'Please select a valid image file.'
    form.photo = null
    if (photoInput.value) photoInput.value.value = ''
    setPhotoPreview('')
    return
  }
  clearPreviewUrl()
  currentPreviewUrl.value = URL.createObjectURL(file)
  photoPreview.value = currentPreviewUrl.value
}

function resetErrors() { Object.keys(errors).forEach((key) => { errors[key] = '' }) }
function validateForm() {
  resetErrors()
  if (!form.first_name.trim()) errors.first_name = 'First name is required.'
  if (!form.last_name.trim()) errors.last_name = 'Last name is required.'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.'
  if (form.type === 'alumni' && !form.exit_date) errors.exit_date = 'Exit date is required for alumni.'
  return !Object.values(errors).some(Boolean)
}

function buildPayload() {
  const payload = new FormData()
  const values = {
    unique_code: form.unique_code.trim(), first_name: form.first_name.trim(), last_name: form.last_name.trim(),
    phone: form.phone.trim(), email: form.email.trim(), current_country: form.current_country.trim(),
    current_city: form.current_city.trim(), vulnerability_type: form.vulnerability_type.trim(),
    initial_education_level: form.initial_education_level.trim(), current_status: form.current_status.trim(),
    gender: form.gender, type: form.type, date_of_birth: form.date_of_birth, entry_date: form.entry_date,
    exit_date: form.type === 'alumni' ? form.exit_date : '', is_disabled: form.is_disabled ? '1' : '0',
  }
  Object.entries(values).forEach(([key, value]) => { if (value !== '' && value !== null && value !== undefined) payload.append(key, value) })
  if (form.photo) payload.append('photo', form.photo)
  return payload
}

function normalizeApiErrors(validationErrors = {}) { Object.entries(validationErrors).forEach(([key, messages]) => { errors[key] = Array.isArray(messages) ? messages[0] : messages }) }

async function submitForm() {
  formError.value = ''
  if (!validateForm()) return
  saving.value = true
  try {
    const payload = buildPayload()
    if (isEditing.value) {
      await beneficiaryService.update(route.params.id, payload)
      showToast({ type: 'success', message: 'Beneficiary updated successfully.' })
      router.push(`/admin/beneficiaries/${route.params.id}`)
    } else {
      const response = await beneficiaryService.create(payload)
      const created = response?.beneficiary || response?.data || response
      showToast({ type: 'success', message: 'Beneficiary created successfully.' })
      router.push(created?.id ? `/admin/beneficiaries/${created.id}` : '/admin/beneficiaries')
    }
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) { normalizeApiErrors(error.response.data.errors); formError.value = 'Please correct the highlighted fields and try again.' }
    else formError.value = error.response?.data?.message || error.message || 'Unable to save beneficiary.'
    showToast({ type: 'error', message: formError.value || 'Unable to save beneficiary.' })
  } finally { saving.value = false }
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
.beneficiary-form-page{padding-bottom:2rem}.page-shell,.beneficiary-form{display:flex;flex-direction:column;gap:1.5rem}.page-hero,.form-shell,.form-section,.loading-card{border:1px solid #d9e7f1;border-radius:1.75rem;background:#fff;box-shadow:0 18px 44px rgba(4,84,128,.08)}.page-hero{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;background:linear-gradient(135deg,#02334d 0%,#045480 55%,#006fb8 100%);color:#fff;padding:1.6rem}.page-hero__eyebrow{margin:0 0 .35rem;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.page-hero__title{margin:0;font-size:clamp(1.8rem,2.7vw,2.6rem);font-weight:800}.page-hero__copy{margin:.55rem 0 0;max-width:42rem;color:rgba(255,255,255,.84)}.ghost-button,.primary-button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.85rem 1.25rem;font-weight:700;text-decoration:none;transition:all .2s ease}.ghost-button{border:1px solid #cfd8e0;background:#fff;color:#02334d}.primary-button{border:0;background:#ff6900;color:#fff}.ghost-button:hover,.primary-button:hover:not(:disabled){transform:translateY(-1px)}.primary-button:disabled{opacity:.75}.form-shell{display:flex;flex-direction:column;gap:1.5rem;padding:1.5rem}.form-section{padding:1.4rem}.form-section__header{margin-bottom:1.1rem}.form-section__header h2{margin:0;color:#02334d;font-size:1.15rem;font-weight:800}.form-section__header p{margin:.45rem 0 0;color:#698093}.form-grid,.media-grid{display:grid;gap:1rem}.field-block{display:flex;flex-direction:column;gap:.45rem}.field-block--full{grid-column:1/-1}.field-label{color:#02334d;font-size:.95rem;font-weight:700}.required-mark{color:#ff6900}.field-input{width:100%;min-height:3.2rem;border:1px solid #cfd8e0;border-radius:1rem;background:#fff;color:#333;padding:.9rem 1rem;transition:border-color .2s ease,box-shadow .2s ease}.field-input:focus{outline:none;border-color:#045480;box-shadow:0 0 0 4px rgba(4,84,128,.12)}.field-input:disabled{background:#f7fafc;color:#92a1af}.field-input.is-invalid{border-color:#ff6900}.field-error,.field-help,.preview-card__text{margin:0;font-size:.85rem}.field-error{color:#c25100}.field-help,.preview-card__text{color:#698093}.checkbox-row{display:inline-flex;align-items:center;gap:.75rem;min-height:3.2rem;color:#02334d;font-weight:600}.checkbox-input{width:1rem;height:1rem}.preview-card{display:grid;gap:1rem;border-radius:1.25rem;background:linear-gradient(180deg,#fbfdff 0%,#f1f8fc 100%);padding:1rem}.preview-card__image{display:flex;align-items:center;justify-content:center;min-height:220px;border-radius:1.25rem;overflow:hidden;background:#e6f3fb}.photo-preview{width:100%;height:100%;object-fit:cover}.photo-placeholder{color:#698093;font-weight:700}.preview-card__title{margin:0 0 .3rem;color:#02334d;font-weight:800}.form-actions{display:flex;justify-content:flex-end;gap:.75rem;flex-wrap:wrap}.loading-card{display:flex;align-items:center;gap:1rem;padding:1.5rem}.loading-card__block,.loading-card__line{background:linear-gradient(90deg,#e6f3fb,#f4f9fb,#e6f3fb);background-size:200% 100%;animation:shimmer 1.2s infinite}.loading-card__block{width:5rem;height:5rem;border-radius:1.25rem}.loading-card__copy{flex:1}.loading-card__line{height:.95rem;border-radius:999px}.loading-card__line+.loading-card__line{margin-top:.65rem}.loading-card__line--short{width:60%}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@media (min-width:768px){.form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.media-grid{grid-template-columns:minmax(0,1fr) minmax(300px,420px);align-items:start}}@media (min-width:1200px){.form-grid--three{grid-template-columns:repeat(3,minmax(0,1fr))}}
</style>
