<template>
  <div class="commune-form-view">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/communes" class="text-decoration-none">
            Communes
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouvelle' }} commune
        </li>
      </ol>
    </nav>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div v-if="communeStore.error && !communeStore.loading" class="alert alert-danger" role="alert">
          {{ communeStore.error }}
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h4 class="mb-0">
              <i class="bi bi-building"></i>
              {{ isEditing ? 'Modifier' : 'Creer' }} une commune
            </h4>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="card-body">
              <app-spinner v-if="initialLoading" />

              <template v-else>
                <commune-form-fields
                  v-model="form"
                  :regions="communeStore.referenceData.regions"
                  :errors="errors"
                  :loading-regions="communeStore.loadingReferenceData"
                />
              </template>
            </div>

            <div class="card-footer">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="communeStore.saving || initialLoading"
              >
                <span v-if="communeStore.saving" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check-lg"></i>
                Enregistrer
              </button>
              <router-link to="/admin/communes" class="btn btn-secondary ms-2">
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
import CommuneFormFields from '@/components/communes/CommuneFormFields.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { useCommuneStore } from '@/stores/communes.js'

export default defineComponent({
  name: 'CommuneForm',
  components: {
    CommuneFormFields,
    AppSpinner,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const communeStore = useCommuneStore()
    const { showToast } = useToast()

    return {
      route,
      router,
      communeStore,
      showToast,
    }
  },
  data() {
    return {
      form: {
        name: '',
        region_id: '',
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
        await this.communeStore.loadReferenceData()

        if (this.isEditing) {
          const commune = await this.communeStore.fetchOne(this.route.params.id)
          this.form = {
            name: commune.name || '',
            region_id: commune.region_id ? String(commune.region_id) : '',
          }
        }
      } catch {
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement du formulaire',
        })
        this.router.push('/admin/communes')
      } finally {
        this.initialLoading = false
      }
    },

    validateForm() {
      this.errors = {}

      if (!this.form.name.trim()) {
        this.errors.name = 'Le nom de la commune est requis'
      } else if (this.form.name.trim().length < 2) {
        this.errors.name = 'Le nom de la commune doit contenir au moins 2 caracteres'
      }

      if (!this.form.region_id) {
        this.errors.region_id = 'La region est requise'
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
        name: this.form.name.trim(),
        region_id: Number(this.form.region_id),
      }

      try {
        if (this.isEditing) {
          await this.communeStore.update(this.route.params.id, payload)
          this.showToast({
            type: 'success',
            message: 'Commune modifiee avec succes',
          })
        } else {
          await this.communeStore.create(payload)
          this.showToast({
            type: 'success',
            message: 'Commune creee avec succes',
          })
        }

        this.router.push('/admin/communes')
      } catch (error) {
        if (error.response?.status === 422 && error.response.data?.errors) {
          this.errors = this.normalizeApiErrors(error.response.data.errors)
          return
        }

        this.showToast({
          type: 'error',
          message: 'Erreur lors de la sauvegarde de la commune',
        })
      }
    },
  },
})
</script>
