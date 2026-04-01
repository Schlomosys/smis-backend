<template>
  <div class="support-type-detail-view">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/support-types" class="text-decoration-none">
            Types d'appui
          </router-link>
        </li>
        <li class="breadcrumb-item active">Details du type d'appui</li>
      </ol>
    </nav>

    <div v-if="supportTypeStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted small mt-3 mb-0">Chargement du type d'appui...</p>
    </div>

    <div v-else-if="supportType" class="card border-0 shadow-sm">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h4 class="mb-0">
          <i class="bi bi-hand-heart me-2"></i>
          {{ supportType.name }}
        </h4>
        <div class="d-flex gap-2">
          <router-link :to="`/admin/support-types/${supportType.id}/edit`" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-pencil me-1"></i>
            Modifier
          </router-link>
          <router-link to="/admin/support-types" class="btn btn-secondary btn-sm">
            Retour
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <dl class="row mb-0">
          <dt class="col-sm-3">Nom</dt>
          <dd class="col-sm-9">{{ supportType.name }}</dd>

          <dt class="col-sm-3">Description</dt>
          <dd class="col-sm-9">{{ supportType.description || '-' }}</dd>
        </dl>
      </div>
    </div>

    <div v-else class="alert alert-warning" role="alert">
      Type d'appui introuvable.
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useSupportTypeStore } from '@/stores/supportTypes.js'

const route = useRoute()
const supportTypeStore = useSupportTypeStore()
const { showToast } = useToast()

const supportType = ref(null)

onMounted(async () => {
  try {
    supportType.value = await supportTypeStore.fetchOne(route.params.id)
  } catch {
    showToast({
      type: 'error',
      message: "Erreur lors du chargement du type d'appui",
    })
  }
})
</script>
