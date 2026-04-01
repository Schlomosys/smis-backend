<template>
  <div :class="['form-group', wrapperClass]">
    <label v-if="label" :for="inputId" :class="['form-label', labelClass]">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div v-if="prepend || append" class="input-group">
      <span v-if="prepend" class="input-group-text">{{ prepend }}</span>

      <component
        :is="componentType"
        :id="inputId"
        :class="inputClass"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :rows="rows"
        :multiple="multiple"
        :accept="accept"
        v-bind="additionalProps"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <slot name="options" v-if="componentType === 'select'">
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </slot>
      </component>

      <span v-if="append" class="input-group-text">{{ append }}</span>
    </div>

    <component
      v-else
      :is="componentType"
      :id="inputId"
      :class="inputClass"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :min="min"
      :max="max"
      :step="step"
      :rows="rows"
      :multiple="multiple"
      :accept="accept"
      v-bind="additionalProps"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <slot name="options" v-if="componentType === 'select'">
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </slot>
    </component>

    <div v-if="help" :class="['form-text', helpClass]">
      {{ help }}
    </div>

    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppFormField',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Array],
      default: '',
    },
    type: {
      type: String,
      default: 'text',
      validator: (value) =>
        [
          'text',
          'email',
          'password',
          'number',
          'tel',
          'url',
          'search',
          'date',
          'datetime-local',
          'month',
          'week',
          'time',
          'range',
          'color',
          'file',
          'checkbox',
          'radio',
          'textarea',
          'select',
        ].includes(value),
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    help: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
    prepend: {
      type: String,
      default: '',
    },
    append: {
      type: String,
      default: '',
    },
    min: {
      type: [String, Number],
      default: null,
    },
    max: {
      type: [String, Number],
      default: null,
    },
    step: {
      type: [String, Number],
      default: null,
    },
    rows: {
      type: [String, Number],
      default: 3,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: '',
    },
    wrapperClass: {
      type: String,
      default: 'mb-3',
    },
    labelClass: {
      type: String,
      default: '',
    },
    inputClass: {
      type: String,
      default: 'form-control',
    },
    helpClass: {
      type: String,
      default: 'text-muted',
    },
  },
  emits: ['update:modelValue', 'input', 'change', 'blur', 'focus'],
  computed: {
    inputId() {
      return `input-${Math.random().toString(36).substr(2, 9)}`
    },
    componentType() {
      if (this.type === 'textarea') return 'textarea'
      if (this.type === 'select') return 'select'
      return 'input'
    },
    additionalProps() {
      const props = {}
      if (this.type === 'textarea') {
        props.rows = this.rows
      }
      if (this.type === 'select') {
        props.multiple = this.multiple
      }
      return props
    },
  },
  methods: {
    handleInput(event) {
      const value = event.target.value
      this.$emit('update:modelValue', value)
      this.$emit('input', event)
    },
    handleChange(event) {
      this.$emit('change', event)
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
  },
})
</script>
