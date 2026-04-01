<template>
  <div class="country-form-view">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/countries" class="text-decoration-none">
            Pays
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouveau' }} pays
        </li>
      </ol>
    </nav>

    <!-- FORM -->
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h4 class="mb-0">
              <i class="bi bi-flag"></i>
              {{ isEditing ? 'Modifier' : 'Créer' }} un pays
            </h4>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="card-body">
              <div class="mb-3">
                <label for="name" class="form-label">Nom du pays <span class="text-danger">*</span></label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="Nom du pays"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="countryStore.saving"
              >
                <span
                  v-if="countryStore.saving"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                <i class="bi bi-check-lg"></i>
                Enregistrer
              </button>
              <router-link to="/admin/countries" class="btn btn-secondary ms-2">
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
import { useCountryStore } from '@/stores/countries'
import { useToast } from '@/composables/useToast'

export default defineComponent({
  name: 'CountryFormView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const countryStore = useCountryStore()
    const { showToast } = useToast()

    return {
      router,
      route,
      countryStore,
      showToast,
    }
  },
  data() {
    return {
      form: {
        name: '',
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
    if (this.isEditing) {
      await this.loadCountry()
    }
  },
  methods: {
    async loadCountry() {
      try {
        const country = await this.countryStore.fetchOne(this.route.params.id)
        this.form.name = country.name
      } catch (error) {
        console.error('Error loading country:', error)
        this.showToast({
          type: 'error',
          message: 'Erreur lors du chargement du pays',
        })
        this.router.push('/admin/countries')
      }
    },

    validateForm() {
      this.errors = {}

      if (!this.form.name.trim()) {
        this.errors.name = 'Le nom du pays est requis'
      } else if (this.form.name.trim().length < 2) {
        this.errors.name = 'Le nom du pays doit contenir au moins 2 caractères'
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
        }

        if (this.isEditing) {
          await this.countryStore.update(this.route.params.id, data)
          this.showToast({
            type: 'success',
            message: 'Pays modifié avec succès',
          })
        } else {
          await this.countryStore.create(data)
          this.showToast({
            type: 'success',
            message: 'Pays créé avec succès',
          })
        }

        this.router.push('/admin/countries')
      } catch (error) {
        console.error('Error saving country:', error)

        // Handle validation errors from API
        if (error.response?.status === 422 && error.response.data.errors) {
          this.errors = error.response.data.errors
        } else {
          this.showToast({
            type: 'error',
            message: 'Erreur lors de la sauvegarde du pays',
          })
        }
      }
    },
  },
})
</script>