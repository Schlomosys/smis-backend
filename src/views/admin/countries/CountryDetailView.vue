<template>
  <div class="country-detail-view">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/countries" class="text-decoration-none">
            Pays
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          Détails du pays
        </li>
      </ol>
    </nav>

    <!-- DETAILS -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="bi bi-flag"></i>
          Détails du pays
        </h4>
        <div>
          <router-link :to="`/admin/countries/${route.params.id}/edit`" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-pencil"></i>
            Modifier
          </router-link>
        </div>
      </div>
      <div class="card-body">
        <p>Détails du pays - À implémenter</p>
        <p>ID: {{ route.params.id }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'CountryDetailView',
  setup() {
    const router = useRouter()
    const route = useRoute()

    return {
      router,
      route
    }
  },
  async mounted() {
    // Load country details
    console.log('Load country details', this.route.params.id)
  }
})
</script>