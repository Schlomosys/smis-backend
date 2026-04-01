<template>
  <div class="sponsor-form-view">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/sponsors" class="text-decoration-none">
            Sponsors
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouveau' }} sponsor
        </li>
      </ol>
    </nav>

    <!-- LOADING SPINNER -->
    <div v-if="isEditing && sponsorStore.loading" class="text-center py-5">
      <app-spinner />
    </div>

    <div v-else class="row justify-content-center">
      <div class="col-lg-6">
        <!-- FORM CARD -->
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h4 class="mb-0">
              <i class="bi bi-person-plus"></i>
              {{ isEditing ? 'Modifier' : 'Créer' }} un sponsor
            </h4>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="card-body">
              <!-- Name Field -->
              <div class="mb-3">
                <app-form-field
                  v-model="form.name"
                  label="Nom"
                  placeholder="Nom du sponsor"
                  :error="errors.name"
                  required
                />
              </div>

              <!-- Email Field -->
              <div class="mb-3">
                <app-form-field
                  v-model="form.email"
                  type="email"
                  label="Email"
                  placeholder="email@example.com"
                  :error="errors.email"
                />
              </div>

              <!-- Phone Field -->
              <div class="mb-3">
                <app-form-field
                  v-model="form.phone"
                  label="Téléphone"
                  placeholder="+1 (555) 000-0000"
                  :error="errors.phone"
                />
              </div>

              <!-- Country Field -->
              <div class="mb-3">
                <app-form-field
                  v-model="form.country"
                  label="Pays"
                  placeholder="Pays du sponsor"
                  :error="errors.country"
                />
              </div>

              <!-- Beneficiaries Section -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Bénéficiaires associés</label>
                <div class="small text-muted mb-2">
                  Sélectionnez les bénéficiaires à associer à ce sponsor
                </div>

                <!-- Loading beneficiaries -->
                <div v-if="loadingBeneficiaries" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Chargement...</span>
                  </div>
                </div>

                <!-- Beneficiaries Grid -->
                <div v-else class="row g-2">
                  <div
                    v-if="availableBeneficiaries.length === 0"
                    class="col-12"
                  >
                    <div class="alert alert-warning mb-0">
                      <i class="bi bi-info-circle"></i>
                      Aucun bénéficiaire disponible
                    </div>
                  </div>

                  <div
                    v-for="beneficiary in availableBeneficiaries"
                    :key="beneficiary.id"
                    class="col-md-6 col-lg-12"
                  >
                    <div class="form-check d-flex align-items-center border rounded p-2">
                      <input
                        :id="`beneficiary-${beneficiary.id}`"
                        v-model="selectedBeneficiaries"
                        type="checkbox"
                        class="form-check-input"
                        :value="beneficiary.id"
                      />
                      <label
                        :for="`beneficiary-${beneficiary.id}`"
                        class="form-check-label ms-2 mb-0 flex-grow-1"
                      >
                        <div class="fw-semibold">
                          {{ beneficiary.first_name }} {{ beneficiary.last_name }}
                        </div>
                        <small class="text-muted">
                          Code: {{ beneficiary.unique_code }}
                          <span v-if="beneficiary.commune"> • {{ beneficiary.commune.name }}</span>
                        </small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Error Alert -->
              <div v-if="sponsorStore.error" class="alert alert-danger mt-3">
                <i class="bi bi-exclamation-circle"></i>
                {{ sponsorStore.error }}
              </div>
            </div>

            <!-- FORM FOOTER -->
            <div class="card-footer bg-light d-flex gap-2 justify-content-end">
              <router-link to="/admin/sponsors" class="btn btn-outline-secondary">
                <i class="bi bi-x-lg"></i>
                Annuler
              </router-link>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="sponsorStore.saving"
              >
                <i
                  :class="sponsorStore.saving ? 'bi-hourglass-split' : 'bi-check-lg'"
                  class="bi"
                ></i>
                {{ sponsorStore.saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSponsorStore } from '@/stores/sponsors.js'
import { useBeneficiaryStore } from '@/stores/beneficiaries.js'
import { useToast } from '@/composables/useToast.js'
import AppFormField from '@/components/ui/AppFormField.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'

const router = useRouter()
const route = useRoute()
const sponsorStore = useSponsorStore()
const beneficiaryStore = useBeneficiaryStore()
const { success, error: showError } = useToast()

const sponsorId = computed(() => route.params.id)

const isEditing = computed(() => !!sponsorId.value)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  country: ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  country: ''
})

const selectedBeneficiaries = ref([])
const loadingBeneficiaries = ref(false)

const availableBeneficiaries = computed(() => {
  return beneficiaryStore.items
})

onMounted(async () => {
  // Load beneficiaries
  try {
    loadingBeneficiaries.value = true
    await beneficiaryStore.fetchAll({
      per_page: 1000, // Load all beneficiaries
      page: 1
    })
  } catch {
    // Beneficiaries loading error - just log, don't break the form
  } finally {
    loadingBeneficiaries.value = false
  }

  // Load sponsor data if editing
  if (isEditing.value) {
    try {
      const sponsor = await sponsorStore.fetchOne(sponsorId.value)
      Object.assign(form, {
        name: sponsor.name || '',
        email: sponsor.email || '',
        phone: sponsor.phone || '',
        country: sponsor.country || ''
      })
      // Load existing beneficiaries
      if (sponsor.beneficiaries) {
        selectedBeneficiaries.value = sponsor.beneficiaries.map(b => b.id)
      }
    } catch {
      showError('Erreur lors du chargement du sponsor')
      router.push('/admin/sponsors')
    }
  }
})

const validateForm = () => {
  // Clear errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Validate name (required)
  if (!form.name.trim()) {
    errors.name = 'Le nom est requis'
    isValid = false
  }

  // Validate email format if provided
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Veuillez entrer une adresse email valide'
    isValid = false
  }

  // Validate phone format if provided (basic validation)
  if (form.phone && !/^[\d+\-\s()]+$/.test(form.phone)) {
    errors.phone = 'Veuillez entrer un numéro de téléphone valide'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    const data = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      country: form.country.trim() || null,
      beneficiary_ids: selectedBeneficiaries.value
    }

    if (isEditing.value) {
      await sponsorStore.update(sponsorId.value, data)
      success('Sponsor modifié avec succès')
    } else {
      await sponsorStore.create(data)
      success('Sponsor créé avec succès')
    }

    router.push('/admin/sponsors')
  } catch {
    showError(sponsorStore.error || 'Erreur lors de l\'enregistrement')
  }
}
</script>

<style scoped>
.sponsor-form-view {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
