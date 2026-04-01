<template>
  <div class="app-table-shell">
    <div class="table-responsive">
      <table class="app-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :style="col.width ? `width:${col.width}` : ''">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="app-table__state">
              <div class="app-table__loading">
                <AppSpinner />
                <span>Chargement en cours...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length" class="app-table__state">Aucune donnee disponible</td>
          </tr>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="app-table__row"
            @click="$emit('row-click', row)"
          >
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import AppSpinner from '@/components/ui/AppSpinner.vue'

defineProps({
  columns: Array,
  rows: { type: Array, default: () => [] },
  loading: Boolean,
})

defineEmits(['row-click'])
</script>

<style scoped>
.app-table-shell {
  border: 1px solid #d9e7f1;
  border-radius: 1.5rem;
  overflow: hidden;
}

.app-table {
  width: 100%;
  min-width: 760px;
  border-collapse: separate;
  border-spacing: 0;
  background: #ffffff;
}

.app-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #e6f3fb;
  color: #02334d;
  padding: 1rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-table tbody td {
  padding: 1rem;
  border-top: 1px solid #edf3f7;
  color: #333333;
  vertical-align: middle;
}

.app-table__row {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.app-table__row:nth-child(even) {
  background: rgba(230, 243, 251, 0.32);
}

.app-table__row:hover {
  background: rgba(77, 163, 217, 0.12);
}

.app-table__state {
  padding: 2rem;
  color: #5b7184;
  text-align: center;
}

.app-table__loading {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
