<template>
  <div class="school-form-view">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/schools" class="text-decoration-none">
            Ecoles
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouvelle' }} ecole
        </li>
      </ol>
    </nav>

    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div v-if="schoolStore.error && !schoolStore.loading" class="alert alert-danger" role="alert">
          {{ schoolStore.error }}
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h4 class="mb-0">
              <i class="bi bi-mortarboard"></i>
              {{ isEditing ? 'Modifier' : 'Creer' }} une ecole
            </h4>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="card-body">
              <app-spinner v-if="initialLoading" />

              <template v-else>
                <school-form-fields
                  v-model="form"
                  :communes="schoolStore.referenceData.communes"
                  :errors="errors"
                  :loading-communes="schoolStore.loadingReferenceData"
                />
              </template>
            </div>

            <div class="card-footer">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="schoolStore.saving || initialLoading"
              >
                <span v-if="schoolStore.saving" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check-lg"></i>
                Enregistrer
              </button>
              <router-link to="/admin/schools" class="btn btn-secondary ms-2">
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
import SchoolFormFields, { schoolTypeOptions } from '@/components/schools/SchoolFormFields.vue'
import { useSchoolStore } from '@/stores/schools.js'

export default defineComponent({
  name: 'SchoolForm',
  components: {
    AppSpinner,
    SchoolFormFields,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const schoolStore = useSchoolStore()
    const { showToast } = useToast()

    return {
      route,
      router,
      schoolStore,
      showToast,
    }
  },
  data() {
    return {
      form: {
        name: '',
        type: '',
        commune_id: '',
      },
      errors: {},
      initialLoading: false,
      allowedTypes: schoolTypeOptions.map((option) => option.value),
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
        await this.schoolStore.loadReferenceData()

        if (this.isEditing) {
          const school = await this.schoolStore.fetchOne(this.route.params.id)
          this.form = {
            name: school.name || '',
            type: school.type || '',
            commune_id: school.commune_id ? String(school.commune_id) : '',
          }
        }
      } catch {
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement du formulaire',
        })
        this.router.push('/admin/schools')
      } finally {
        this.initialLoading = false
      }
    },

    validateForm() {
      this.errors = {}

      if (!this.form.name.trim()) {
        this.errors.name = 'Le nom de l ecole est requis'
      } else if (this.form.name.trim().length < 2) {
        this.errors.name = 'Le nom de l ecole doit contenir au moins 2 caracteres'
      }

      if (!this.form.type) {
        this.errors.type = 'Le type d ecole est requis'
      } else if (!this.allowedTypes.includes(this.form.type)) {
        this.errors.type = 'Le type d ecole est invalide'
      }

      if (!this.form.commune_id) {
        this.errors.commune_id = 'La commune est requise'
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
        type: this.form.type,
        commune_id: Number(this.form.commune_id),
      }

      try {
        if (this.isEditing) {
          await this.schoolStore.update(this.route.params.id, payload)
          this.showToast({
            type: 'success',
            message: 'Ecole modifiee avec succes',
          })
        } else {
          await this.schoolStore.create(payload)
          this.showToast({
            type: 'success',
            message: 'Ecole creee avec succes',
          })
        }

        this.router.push('/admin/schools')
      } catch (error) {
        if (error.response?.status === 422 && error.response.data?.errors) {
          this.errors = this.normalizeApiErrors(error.response.data.errors)
          return
        }

        this.showToast({
          type: 'error',
          message: 'Erreur lors de la sauvegarde de l ecole',
        })
      }
    },
  },
})
</script>
