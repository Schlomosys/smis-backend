<template>
  <div class="municipality-form-view">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/municipalities" class="text-decoration-none">
            Communes
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouvelle' }} commune
        </li>
      </ol>
    </nav>

    <!-- FORM -->
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-light">
            <h4 class="mb-0">
              <i class="bi bi-building"></i>
              {{ isEditing ? 'Modifier' : 'Créer' }} une commune
            </h4>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Nom de la commune</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Nom de la commune"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Région</label>
                <select v-model="form.region_id" class="form-select" required>
                  <option value="">-- Sélectionner une région --</option>
                  <!-- Options will be populated from store -->
                </select>
              </div>
            </div>
            <div class="card-footer">
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg"></i>
                Enregistrer
              </button>
              <router-link to="/admin/municipalities" class="btn btn-secondary ms-2">
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

export default defineComponent({
  name: 'MunicipalityFormView',
  setup() {
    const router = useRouter()
    const route = useRoute()

    return {
      router,
      route
    }
  },
  data() {
    return {
      form: {
        name: '',
        region_id: ''
      }
    }
  },
  computed: {
    isEditing() {
      return !!this.route.params.id
    }
  },
  async mounted() {
    if (this.isEditing) {
      // Load municipality data
      console.log('Load municipality', this.route.params.id)
    }
  },
  methods: {
    async handleSubmit() {
      try {
        if (this.isEditing) {
          console.log('Update municipality', this.form)
        } else {
          console.log('Create municipality', this.form)
        }
        this.router.push('/admin/municipalities')
      } catch (error) {
        console.error('Error saving municipality:', error)
      }
    }
  }
})
</script>