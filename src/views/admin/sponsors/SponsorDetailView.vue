<template>
  <div class="sponsor-detail-view">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/sponsors" class="text-decoration-none">
            Sponsors
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          Détails du sponsor
        </li>
      </ol>
    </nav>

    <!-- LOADING SPINNER -->
    <div v-if="sponsorStore.loading" class="text-center py-5">
      <app-spinner />
    </div>

    <!-- CONTENT -->
    <div v-else-if="sponsorStore.current">
      <div class="row">
        <!-- MAIN INFO CARD -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <i class="bi bi-person-circle"></i>
                Informations du sponsor
              </h4>
              <div class="btn-group btn-group-sm">
                <router-link
                  :to="{ name: 'admin-sponsors-edit', params: { id: sponsorStore.current.id } }"
                  class="btn btn-outline-primary"
                  title="Modifier"
                >
                  <i class="bi bi-pencil"></i>
                  Modifier
                </router-link>
                <button
                  @click="handleDelete"
                  class="btn btn-outline-danger"
                  title="Supprimer"
                  :disabled="sponsorStore.deleting"
                >
                  <i v-if="sponsorStore.deleting" class="bi bi-hourglass-split"></i>
                  <i v-else class="bi bi-trash"></i>
                  Supprimer
                </button>
              </div>
            </div>

            <div class="card-body">
              <div class="row g-4">
                <!-- Name -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Nom</label>
                  <p class="fs-5 fw-semibold mb-0">
                    {{ sponsorStore.current.name }}
                  </p>
                </div>

                <!-- Email -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Email</label>
                  <p class="mb-0">
                    <a
                      v-if="sponsorStore.current.email"
                      :href="`mailto:${sponsorStore.current.email}`"
                      class="text-decoration-none"
                    >
                      {{ sponsorStore.current.email }}
                    </a>
                    <span v-else class="text-muted">-</span>
                  </p>
                </div>

                <!-- Phone -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Téléphone</label>
                  <p class="mb-0">
                    <a
                      v-if="sponsorStore.current.phone"
                      :href="`tel:${sponsorStore.current.phone}`"
                      class="text-decoration-none"
                    >
                      {{ sponsorStore.current.phone }}
                    </a>
                    <span v-else class="text-muted">-</span>
                  </p>
                </div>

                <!-- Country -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Pays</label>
                  <p class="mb-0">
                    {{ sponsorStore.current.country || '-' }}
                  </p>
                </div>

                <!-- Created At -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Créé</label>
                  <p class="mb-0">
                    {{ formatDate(sponsorStore.current.created_at) }}
                  </p>
                </div>

                <!-- Updated At -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-semibold">Dernière modification</label>
                  <p class="mb-0">
                    {{ formatDate(sponsorStore.current.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- BENEFICIARIES SECTION -->
          <div class="card border-0 shadow-sm" v-if="sponsorStore.current.beneficiaries">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-people"></i>
                Bénéficiaires associés
              </h5>
            </div>
            <div class="card-body">
              <div v-if="sponsorStore.current.beneficiaries.length === 0" class="text-muted text-center py-3">
                <p class="mb-0">Aucun bénéficiaire associé</p>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Nom</th>
                      <th>Code unique</th>
                      <th>Commune</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="beneficiary in sponsorStore.current.beneficiaries" :key="beneficiary.id">
                      <td class="fw-semibold">
                        {{ beneficiary.first_name }} {{ beneficiary.last_name }}
                      </td>
                      <td>
                        <span class="badge bg-info">{{ beneficiary.unique_code }}</span>
                      </td>
                      <td>{{ beneficiary.commune?.name || '-' }}</td>
                      <td>
                        <router-link
                          :to="{ name: 'admin-beneficiaries-detail', params: { id: beneficiary.id } }"
                          class="btn btn-sm btn-outline-primary"
                          title="Voir détails"
                        >
                          <i class="bi bi-eye"></i>
                        </router-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR INFO -->
        <div class="col-lg-4">
          <!-- STATS CARD -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-bar-chart"></i>
                Informations
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <small class="text-muted d-block">ID</small>
                <code class="fs-6">{{ sponsorStore.current.id }}</code>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block">Statut</small>
                <span class="badge bg-success">
                  <i class="bi bi-check-circle"></i>
                  Actif
                </span>
              </div>
              <div class="mb-3" v-if="sponsorStore.current.beneficiaries">
                <small class="text-muted d-block">Nombre de bénéficiaires</small>
                <span class="badge bg-primary fs-6">
                  {{ sponsorStore.current.beneficiaries.length }}
                </span>
              </div>
            </div>
          </div>

          <!-- ACTIONS CARD -->
          <div class="card border-0 shadow-sm mt-3">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-lightning"></i>
                Actions
              </h5>
            </div>
            <div class="card-body d-flex flex-column gap-2">
              <router-link
                to="/admin/sponsors"
                class="btn btn-outline-secondary btn-sm"
              >
                <i class="bi bi-arrow-left"></i>
                Retour à la liste
              </router-link>
              <router-link
                :to="{ name: 'admin-sponsors-edit', params: { id: sponsorStore.current.id } }"
                class="btn btn-primary btn-sm"
              >
                <i class="bi bi-pencil"></i>
                Modifier le sponsor
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 404 -->
    <div v-else class="alert alert-warning text-center py-5">
      <i class="bi bi-exclamation-triangle"></i>
      <p class="mb-0 mt-2">Sponsor non trouvé</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSponsorStore } from '@/stores/sponsors.js'
import { useToast } from '@/composables/useToast.js'
import AppSpinner from '@/components/ui/AppSpinner.vue'

const router = useRouter()
const route = useRoute()
const sponsorStore = useSponsorStore()
const { success, error: showError } = useToast()

const sponsorId = computed(() => route.params.id)

onMounted(async () => {
  try {
    await sponsorStore.fetchOne(sponsorId.value)
  } catch {
    showError('Erreur lors du chargement du sponsor')
    router.push('/admin/sponsors')
  }
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = async () => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le sponsor "${sponsorStore.current.name}" ?`)) {
    try {
      await sponsorStore.delete(sponsorId.value)
      success('Sponsor supprimé avec succès')
      router.push('/admin/sponsors')
    } catch {
      showError(sponsorStore.error || 'Erreur lors de la suppression')
    }
  }
}
</script>

<style scoped>
.sponsor-detail-view {
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

code {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
}
</style>
