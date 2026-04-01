<template>
  <div class="support-type-form-view">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/support-types" class="text-decoration-none">
            Types d'appui
          </router-link>
        </li>
        <li class="breadcrumb-item active">
          {{ isEditing ? 'Modifier' : 'Nouveau' }} type d'appui
        </li>
      </ol>
    </nav>

    <div class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <h1 class="h4 mb-2">{{ isEditing ? 'Modification' : 'Creation' }} d'un type d'appui</h1>
        <p class="text-muted mb-0">
          Le formulaire s'ouvre dans une fenetre modale reutilisable.
        </p>
      </div>
    </div>

    <support-type-modal-form
      :show="showModal"
      :support-type="supportType"
      :saving="supportTypeStore.saving"
      :form-error="formError"
      @close="handleClose"
      @submit="handleSave"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupportTypeModalForm from '@/components/support-types/SupportTypeModalForm.vue'
import { useToast } from '@/composables/useToast'
import { useSupportTypeStore } from '@/stores/supportTypes.js'

const route = useRoute()
const router = useRouter()
const supportTypeStore = useSupportTypeStore()
const { showToast } = useToast()

const showModal = ref(true)
const supportType = ref(null)
const formError = ref('')

const isEditing = computed(() => Boolean(route.params.id))

onMounted(async () => {
  if (!isEditing.value) return

  try {
    supportType.value = await supportTypeStore.fetchOne(route.params.id)
  } catch (error) {
    formError.value =
      error.response?.data?.message || error.message || "Impossible de charger le type d'appui"
    showToast({
      type: 'error',
      message: "Erreur lors du chargement du type d'appui",
    })
  }
})

function handleClose() {
  showModal.value = false
  router.push('/admin/support-types')
}

async function handleSave({ id, payload }) {
  formError.value = ''

  try {
    if (id) {
      await supportTypeStore.update(id, payload)
      showToast({
        type: 'success',
        message: "Type d'appui mis a jour avec succes",
      })
    } else {
      await supportTypeStore.create(payload)
      showToast({
        type: 'success',
        message: "Type d'appui cree avec succes",
      })
    }

    await supportTypeStore.fetchDropdownList().catch(() => {})
    router.push('/admin/support-types')
  } catch (error) {
    if (error.response?.status === 422 && error.response.data?.errors) {
      formError.value = Object.values(error.response.data.errors).flat().join(' ')
      return
    }

    formError.value =
      error.response?.data?.message || error.message || "Erreur lors de la sauvegarde du type d'appui"
  }
}
</script>
