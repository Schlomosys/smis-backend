<template>
  <div class="municipality-list-view">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-0">Communes</h1>
        <p class="text-muted small">Gestion des communes</p>
      </div>
      <router-link to="/admin/municipalities/create" class="btn btn-primary">
        <i class="bi bi-plus-lg"></i>
        Nouvelle commune
      </router-link>
    </div>

    <!-- LIST -->
    <div class="card">
      <div class="card-body">
        <p>Liste des communes - À implémenter</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MunicipalityListView'
}
</script>