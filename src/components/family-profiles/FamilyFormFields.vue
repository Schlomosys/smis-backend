<template>
  <div>
    <app-form-field
      :model-value="modelValue.family_name"
      label="Nom de famille"
      placeholder="Saisir le nom de famille"
      :error="errors.family_name"
      :required="true"
      @update:model-value="updateField('family_name', $event)"
    />

    <app-form-field
      :model-value="modelValue.guardian_name"
      label="Nom du tuteur"
      placeholder="Saisir le nom du tuteur"
      :error="errors.guardian_name"
      :required="true"
      @update:model-value="updateField('guardian_name', $event)"
    />

    <app-form-field
      :model-value="modelValue.phone"
      label="Telephone"
      placeholder="Ex: 08012345678"
      :error="errors.phone"
      :required="true"
      @update:model-value="updateField('phone', $event)"
    />

    <app-form-field
      :model-value="modelValue.address"
      type="textarea"
      label="Adresse"
      placeholder="Adresse complete"
      :error="errors.address"
      :required="true"
      @update:model-value="updateField('address', $event)"
    />

    <div class="row">
      <div class="col-md-6">
        <app-form-field
          :model-value="modelValue.children_count"
          type="number"
          label="Nombre d'enfants"
          placeholder="0"
          :error="errors.children_count"
          :required="true"
          min="0"
          @update:model-value="updateField('children_count', $event)"
        />
      </div>

      <div class="col-md-6">
        <app-form-field
          :model-value="modelValue.monthly_income"
          type="number"
          label="Revenu mensuel"
          placeholder="0.00"
          :error="errors.monthly_income"
          :required="true"
          min="0"
          step="0.00"
          prepend="FCFA"
          @update:model-value="updateField('monthly_income', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import AppFormField from '@/components/ui/AppFormField.vue'

export default defineComponent({
  name: 'FamilyFormFields',
  components: {
    AppFormField,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      default: () => ({}),
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
