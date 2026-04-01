<template>
  <div class="region-detail-view">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/regions" class="text-decoration-none">
            Régions
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          Détails de la région
        </li>
      </ol>
    </nav>

    <!-- DETAILS -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="bi bi-geo-alt"></i>
          Détails de la région
        </h4>
        <div>
          <router-link :to="`/admin/regions/${route.params.id}/edit`" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-pencil"></i>
            Modifier
          </router-link>
        </div>
      </div>
      <div class="card-body">
        <p>Détails de la région - À implémenter</p>
        <p>ID: {{ route.params.id }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'RegionDetailView',
  setup() {
    const router = useRouter()
    const route = useRoute()

    return {
      router,
      route
    }
  },
  async mounted() {
    // Load region details
    console.log('Load region details', this.route.params.id)
  }
})
</script>