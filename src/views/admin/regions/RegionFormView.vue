<template>
  <div class="region-form-view">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/regions" class="text-decoration-none">
            Régions
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouvelle' }} région
        </li>
      </ol>
    </nav>

    <!-- FORM -->
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h4 class="mb-0">
              <i class="bi bi-geo-alt"></i>
              {{ isEditing ? 'Modifier' : 'Créer' }} une région
            </h4>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="card-body">
              <div class="mb-3">
                <label for="name" class="form-label">Nom de la région <span class="text-danger">*</span></label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="Nom de la région"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>
              <div class="mb-3">
                <label for="country_id" class="form-label">Pays <span class="text-danger">*</span></label>
                <select
                  id="country_id"
                  v-model="form.country_id"
                  class="form-select"
                  :class="{ 'is-invalid': errors.country_id }"
                  required
                >
                  <option value="">-- Sélectionner un pays --</option>
                  <option
                    v-for="country in regionStore.referenceData.countries"
                    :key="country.id"
                    :value="country.id"
                  >
                    {{ country.name }}
                  </option>
                </select>
                <div v-if="errors.country_id" class="invalid-feedback">
                  {{ errors.country_id }}
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="regionStore.saving"
              >
                <span
                  v-if="regionStore.saving"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                <i class="bi bi-check-lg"></i>
                Enregistrer
              </button>
              <router-link to="/admin/regions" class="btn btn-secondary ms-2">
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
import { useRouter, useRoute } from 'vue-router'
import { useRegionStore } from '@/stores/regions'
import { useToast } from '@/composables/useToast'

export default defineComponent({
  name: 'RegionFormView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const regionStore = useRegionStore()
    const { showToast } = useToast()

    return {
      router,
      route,
      regionStore,
      showToast,
    }
  },
  data() {
    return {
      form: {
        name: '',
        country_id: '',
      },
      errors: {},
    }
  },
  computed: {
    isEditing() {
      return !!this.route.params.id
    }
  },
  async mounted() {
    await this.initialize()
  },
  methods: {
    async initialize() {
      try {
        // Load reference data first
        await this.regionStore.loadReferenceData()

        if (this.isEditing) {
          await this.loadRegion()
        }
      } catch (error) {
        console.error('Initialization error:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement des données',
        })
        this.router.push('/admin/regions')
      }
    },

    async loadRegion() {
      try {
        const region = await this.regionStore.fetchOne(this.route.params.id)
        this.form.name = region.name
        this.form.country_id = region.country_id
      } catch (error) {
        console.error('Error loading region:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement de la région',
        })
        this.router.push('/admin/regions')
      }
    },

    validateForm() {
      this.errors = {}

      if (!this.form.name.trim()) {
        this.errors.name = 'Le nom de la région est requis'
      } else if (this.form.name.trim().length < 2) {
        this.errors.name = 'Le nom de la région doit contenir au moins 2 caractères'
      }

      if (!this.form.country_id) {
        this.errors.country_id = 'Le pays est requis'
      }

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      try {
        const data = {
          name: this.form.name.trim(),
          country_id: this.form.country_id,
        }

        if (this.isEditing) {
          await this.regionStore.update(this.route.params.id, data)
          this.showToast({
            type: 'success',
            message: 'Région modifiée avec succès',
          })
        } else {
          await this.regionStore.create(data)
          this.showToast({
            type: 'success',
            message: 'Région créée avec succès',
          })
        }

        this.router.push('/admin/regions')
      } catch (error) {
        console.error('Error saving region:', error)

        // Handle validation errors from API
        if (error.response?.status === 422 && error.response.data.errors) {
          this.errors = error.response.data.errors
        } else {
          this.showToast({
            type: 'error',
            message: 'Erreur lors de la sauvegarde de la région',
          })
        }
      }
    },
  },
})
</script>