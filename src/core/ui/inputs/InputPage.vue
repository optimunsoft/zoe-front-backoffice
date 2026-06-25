<template>
  <div class="space-y-8">

    <!-- Input Types -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Input Types</h2>
      <div class="grid gap-5 md:grid-cols-3">
        <InputText id="default" label="Default" />
        <InputText id="tooltip" label="W/ Tooltip">
          <template #tooltip>
            <Tooltip class="ml-2" bg="dark" size="md">
              <div class="text-sm text-gray-200">Excepteur sint occaecat cupidata non proident, sunt.</div>
            </Tooltip>
          </template>
        </InputText>
        <InputText id="mandatory" label="Mandatory" required />
        <InputText id="prefix" label="W/ Prefix" prefix="USD" />
        <InputText id="suffix" label="W/ Suffix" suffix="%" />
        <InputText id="placeholder" label="W/ Placeholder" placeholder="Something cool..." />
        <InputText id="icon" label="W/ Icon">
          <template #leading>
            <svg class="fill-current text-gray-400 dark:text-gray-500 shrink-0 ml-3 mr-2" width="16" height="16" viewBox="0 0 16 16">
              <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
            </svg>
          </template>
        </InputText>
        <InputText id="supporting-text" label="W/ Supporting Text" hint="Supporting text goes here!" />
        <InputSearch id="input-search" label="Search" v-model="searchQuery" @submit="onSearch" />
      </div>
    </section>

    <!-- Input Sizes -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Input Sizes</h2>
      <div class="grid gap-5 md:grid-cols-3">
        <InputText id="small" label="Small" size="sm" />
        <InputText id="normal" label="Default" />
        <InputText id="large" label="Large" size="lg" />
      </div>
    </section>

    <!-- Input States -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Input States</h2>
      <div class="grid gap-5 md:grid-cols-3">
        <InputText
          id="disabled"
          label="Disabled"
          placeholder="Something cool..."
          disabled
        />
        <InputText
          id="error"
          label="Error"
          required
          state="error"
          error="This field is required!"
        />
        <InputText
          id="success"
          label="Success"
          required
          state="success"
          hint="Sounds good!"
        />
      </div>
    </section>

    <!-- Select -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Select</h2>
      <InputSelect
        id="country"
        v-model="country"
        label="Country"
        :options="countryOptions"
      />
    </section>

    <!-- Checkbox -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Checkbox</h2>
      <div class="flex flex-wrap items-center -m-3">
        <div class="m-3">
          <InputCheckbox v-model="checkboxActive" label="Active" />
        </div>
        <div class="m-3">
          <InputCheckbox v-model="checkboxSelected" label="Selected" />
        </div>
        <div class="m-3">
          <InputCheckbox label="Disabled" disabled />
        </div>
      </div>
    </section>

    <!-- Radio -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Radio</h2>
      <div class="flex flex-wrap items-center -m-3">
        <div class="m-3">
          <InputRadio v-model="radioValue" name="radio-buttons" value="active" label="Active" />
        </div>
        <div class="m-3">
          <InputRadio v-model="radioValue" name="radio-buttons" value="selected" label="Selected" />
        </div>
        <div class="m-3">
          <InputRadio name="radio-buttons" value="disabled" label="Disabled" disabled />
        </div>
      </div>
    </section>

    <!-- Toggle Switch -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Toggle Switch</h2>
      <div class="flex flex-wrap items-center -m-3">
        <div class="m-3 w-24">
          <InputSwitch id="toggle1" v-model="toggle1" />
        </div>
        <div class="m-3 w-24">
          <InputSwitch id="toggle2" v-model="toggle2" />
        </div>
        <div class="m-3 w-32">
          <InputSwitch id="toggle3" v-model="toggle3" disabled />
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Tooltip } from '~/core/ui/utooltip'

import InputCheckbox from './InputCheckbox.vue'
import InputRadio from './InputRadio.vue'
import InputSearch from './InputSearch.vue'
import InputSelect from './InputSelect.vue'
import InputSwitch from './InputSwitch.vue'
import InputText from './InputText.vue'
import type { InputSelectOption } from './input.types'

const searchQuery = ref('')
const country = ref('Italy')
const checkboxActive = ref(false)
const checkboxSelected = ref(true)
const radioValue = ref('selected')
const toggle1 = ref(true)
const toggle2 = ref(false)
const toggle3 = ref(false)

const countryOptions: InputSelectOption[] = [
  { label: 'Italy', value: 'Italy' },
  { label: 'USA', value: 'USA' },
  { label: 'United Kingdom', value: 'United Kingdom' },
]

const onSearch = (query: string) => {
  console.log('search', query)
}
</script>
