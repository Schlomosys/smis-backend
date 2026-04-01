<template>
  <div>
    <app-form-field
      :model-value="modelValue.name"
      label="Nom de la commune"
      placeholder="Saisir le nom de la commune"
      :error="errors.name"
      :required="true"
      @update:model-value="updateField('name', $event)"
    />

    <app-form-field
      :model-value="modelValue.region_id"
      type="select"
      label="Region"
      :error="errors.region_id"
      :required="true"
      :disabled="loadingRegions"
      input-class="form-select"
      help="La liste des regions est chargee dynamiquement."
      @update:model-value="updateField('region_id', $event)"
    >
      <template #options>
        <option value="">
          {{ loadingRegions ? 'Chargement des regions...' : 'Selectionner une region' }}
        </option>
        <option
          v-for="region in regions"
          :key="region.id"
          :value="String(region.id)"
        >
          {{ region.name }}
        </option>
      </template>
    </app-form-field>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import AppFormField from '@/components/ui/AppFormField.vue'

export default defineComponent({
  name: 'CommuneFormFields',
  components: {
    AppFormField,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    regions: {
      type: Array,
      default: () => [],
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
    loadingRegions: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
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
