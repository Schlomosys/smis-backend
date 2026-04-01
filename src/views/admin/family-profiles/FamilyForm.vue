<template>
  <div class="family-form-view">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/family-profiles" class="text-decoration-none">
            Profils familiaux
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouveau' }} profil familial
        </li>
      </ol>
    </nav>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div v-if="familyStore.error && !familyStore.loading" class="alert alert-danger" role="alert">
          {{ familyStore.error }}
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h4 class="mb-0">
              <i class="bi bi-people"></i>
              {{ isEditing ? 'Modifier' : 'Creer' }} un profil familial
            </h4>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="card-body">
              <app-spinner v-if="initialLoading" />

              <template v-else>
                <family-form-fields
                  v-model="form"
                  :errors="errors"
                />
              </template>
            </div>

            <div class="card-footer">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="familyStore.saving || initialLoading"
              >
                <span v-if="familyStore.saving" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check-lg"></i>
                Enregistrer
              </button>
              <router-link to="/admin/family-profiles" class="btn btn-secondary ms-2">
                Annuler
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import FamilyFormFields from '@/components/family-profiles/FamilyFormFields.vue'
import { useFamilyProfileStore } from '@/stores/familyProfiles.js'

export default defineComponent({
  name: 'FamilyForm',
  components: {
    AppSpinner,
    FamilyFormFields,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const familyStore = useFamilyProfileStore()
    const { showToast } = useToast()

    return {
      route,
      router,
      familyStore,
      showToast,
    }
  },
  data() {
    return {
      form: {
        family_name: '',
        guardian_name: '',
        phone: '',
        address: '',
        children_count: '0',
        monthly_income: '0.00',
      },
      errors: {},
      initialLoading: false,
    }
  },
  computed: {
    isEditing() {
      return Boolean(this.route.params.id)
    },
  },
  async mounted() {
    await this.initialize()
  },
  methods: {
    async initialize() {
      this.initialLoading = true

      try {
        if (this.isEditing) {
          const family = await this.familyStore.fetchOne(this.route.params.id)
          this.form = {
            family_name: family.family_name || '',
            guardian_name: family.guardian_name || '',
            phone: family.phone || '',
            address: family.address || '',
            children_count:
              family.children_count !== null && family.children_count !== undefined
                ? String(family.children_count)
                : '0',
            monthly_income:
              family.monthly_income !== null && family.monthly_income !== undefined
                ? String(family.monthly_income)
                : '0.00',
          }
        }
      } catch {
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement du profil familial',
        })
        this.router.push('/admin/family-profiles')
      } finally {
        this.initialLoading = false
      }
    },

    validateForm() {
      this.errors = {}

      if (!this.form.family_name.trim()) {
        this.errors.family_name = 'Le nom de famille est requis'
      }

      if (!this.form.guardian_name.trim()) {
        this.errors.guardian_name = 'Le nom du tuteur est requis'
      }

      if (!this.form.phone.trim()) {
        this.errors.phone = 'Le telephone est requis'
      }

      if (!this.form.address.trim()) {
        this.errors.address = 'L adresse est requise'
      }

      if (this.form.children_count === '' || Number(this.form.children_count) < 0) {
        this.errors.children_count = 'Le nombre d enfants doit etre superieur ou egal a 0'
      }

      if (this.form.monthly_income === '' || Number(this.form.monthly_income) < 0) {
        this.errors.monthly_income = 'Le revenu mensuel doit etre superieur ou egal a 0'
      }

      return Object.keys(this.errors).length === 0
    },

    normalizeApiErrors(apiErrors = {}) {
      return Object.keys(apiErrors).reduce((accumulator, key) => {
        const value = apiErrors[key]
        accumulator[key] = Array.isArray(value) ? value[0] : value
        return accumulator
      }, {})
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      const payload = {
        family_name: this.form.family_name.trim(),
        guardian_name: this.form.guardian_name.trim(),
        phone: this.form.phone.trim(),
        address: this.form.address.trim(),
        children_count: Number(this.form.children_count),
        monthly_income: Number(this.form.monthly_income),
      }

      try {
        if (this.isEditing) {
          await this.familyStore.update(this.route.params.id, payload)
          this.showToast({
            type: 'success',
            message: 'Profil familial modifie avec succes',
          })
        } else {
          await this.familyStore.create(payload)
          this.showToast({
            type: 'success',
            message: 'Profil familial cree avec succes',
          })
        }

        this.router.push('/admin/family-profiles')
      } catch (error) {
        if (error.response?.status === 422 && error.response.data?.errors) {
          this.errors = this.normalizeApiErrors(error.response.data.errors)
          return
        }

        this.showToast({
          type: 'error',
          message: 'Erreur lors de la sauvegarde du profil familial',
        })
      }
    },
  },
})
</script>
