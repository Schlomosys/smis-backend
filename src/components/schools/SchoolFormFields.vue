<template>
  <div>
    <app-form-field
      :model-value="modelValue.name"
      label="Nom de l'ecole"
      placeholder="Saisir le nom de l'ecole"
      :error="errors.name"
      :required="true"
      @update:model-value="updateField('name', $event)"
    />

    <app-form-field
      :model-value="modelValue.type"
      type="select"
      label="Type"
      :error="errors.type"
      :required="true"
      input-class="form-select"
      @update:model-value="updateField('type', $event)"
    >
      <template #options>
        <option value="">Selectionner un type</option>
        <option
          v-for="option in typeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </template>
    </app-form-field>

    <app-form-field
      :model-value="modelValue.commune_id"
      type="select"
      label="Commune"
      :error="errors.commune_id"
      :required="true"
      :disabled="loadingCommunes"
      input-class="form-select"
      help="La liste des communes est chargee dynamiquement."
      @update:model-value="updateField('commune_id', $event)"
    >
      <template #options>
        <option value="">
          {{ loadingCommunes ? 'Chargement des communes...' : 'Selectionner une commune' }}
        </option>
        <option
          v-for="commune in communes"
          :key="commune.id"
          :value="String(commune.id)"
        >
          {{ commune.name }}
        </option>
      </template>
    </app-form-field>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import AppFormField from '@/components/ui/AppFormField.vue'

export const schoolTypeOptions = [
  { value: 'primary', label: 'Primaire' },
  { value: 'secondary', label: 'Secondaire' },
  { value: 'university', label: 'Universite' },
  { value: 'vocational', label: 'Professionnelle' },
]

export default defineComponent({
  name: 'SchoolFormFields',
  components: {
    AppFormField,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    communes: {
      type: Array,
      default: () => [],
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
    loadingCommunes: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      typeOptions: schoolTypeOptions,
    }
  },
  methods: {
    updateField(field, value) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [field]: value,
      })
    },
  },
})
</script>
