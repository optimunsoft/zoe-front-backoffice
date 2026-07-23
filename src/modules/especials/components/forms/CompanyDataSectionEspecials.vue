<template>
  <div class="company-especials-form">
    <section v-show="section === 'general'" class="space-y-4">
      <p class="text-sm text-gray-500 dark:text-gray-400 py-2">
       También puedes agregarlos manualmente.
      </p>

      <div class="company-especials-form__row">
        <div class="company-especials-form__col">
          <InputSelect
            id="especials-company-document-type"
            v-model="form.documentTypeId"
            name="documentTypeId"
            label="Tipo de identificación"
            placeholder="Seleccionar"
            required
            :disabled="disabled"
            :options="documentTypeOptions"
            :error="errors.documentTypeId"
          />
        </div>

        <div class="company-especials-form__col">
          <div class="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-2">
            <InputText
              id="especials-company-document-number"
              :model-value="form.documentNumber"
              name="documentNumber"
              label="NIT de la empresa"
              placeholder="900123456"
              required
              digits-only
              :disabled="disabled"
              :max-length="15"
              :error="errors.documentNumber"
              @update:model-value="onDocumentNumberChange"
            />
            <InputText
              id="especials-company-verification-digit"
              :model-value="form.verificationDigit"
              name="verificationDigit"
              label="DV"
              placeholder="--"
              disabled
              digits-only
              :max-length="1"
              input-class="text-center"
              :error="errors.verificationDigit"
            />
          </div>
        </div>
      </div>

      <div class="company-especials-form__row">
        <div class="company-especials-form__col">
          <InputSelect
            id="especials-company-business-nature"
            v-model="form.businessNatureId"
            name="businessNatureId"
            label="Tipo de persona"
            placeholder="Seleccionar"
            required
            :disabled="disabled"
            :options="businessNatureOptions"
            :error="errors.businessNatureId"
            @update:model-value="onBusinessNatureChange"
          />
        </div>

        <div class="company-especials-form__col">
          <InputText
            id="especials-company-business-name"
            v-model="form.businessName"
            name="businessName"
            label="Razón social de la empresa"
            placeholder="Razón social"
            :required="isJuridicaPerson"
            :disabled="disabled"
            :error="errors.businessName"
          />
        </div>
      </div>

      <template v-if="isNaturalPerson">
        <div class="company-especials-form__row">
          <div class="company-especials-form__col">
            <InputText
              id="especials-company-first-name"
              :model-value="form.firstName"
              name="firstName"
              label="Primer nombre (empresa)"
              placeholder="Primer nombre"
              required
              :disabled="disabled"
              :error="errors.firstName"
              @update:model-value="onFirstNameChange"
            />
          </div>

          <div class="company-especials-form__col">
            <InputText
              id="especials-company-middle-name"
              :model-value="form.middleName"
              name="middleName"
              label="Segundo nombre (empresa)"
              placeholder="Segundo nombre"
              :disabled="disabled"
              :error="errors.middleName"
              @update:model-value="onMiddleNameChange"
            />
          </div>
        </div>

        <div class="company-especials-form__row">
          <div class="company-especials-form__col">
            <InputText
              id="especials-company-last-name"
              :model-value="form.lastName"
              name="lastName"
              label="Primer apellido (empresa)"
              placeholder="Primer apellido"
              required
              :disabled="disabled"
              :error="errors.lastName"
              @update:model-value="onLastNameChange"
            />
          </div>

          <div class="company-especials-form__col">
            <InputText
              id="especials-company-second-last-name"
              :model-value="form.secondLastName"
              name="secondLastName"
              label="Segundo apellido (empresa)"
              placeholder="Segundo apellido"
              :disabled="disabled"
              :error="errors.secondLastName"
              @update:model-value="onSecondLastNameChange"
            />
          </div>
        </div>
      </template>

      <div class="company-especials-form__row">
        <div class="company-especials-form__col">
          <InputText
            id="especials-company-address"
            v-model="form.address"
            name="address"
            label="Dirección de la empresa"
            placeholder="Calle 123 #45-67"
            required
            :disabled="disabled"
            :error="errors.address"
          />
        </div>

        <div class="company-especials-form__col">
          <InputText
            id="especials-company-email"
            v-model="form.email"
            name="email"
            type="email"
            label="Correo electrónico de la empresa"
            placeholder="contacto@empresa.com"
            required
            :disabled="disabled"
            :error="errors.email"
          />
        </div>
      </div>

      <div class="company-especials-form__row">
        <div class="company-especials-form__col">
          <InputMunicipalitySearch
            id="especials-company-municipality-search"
            ref="municipalityFieldRef"
            v-model="form.municipalityId"
            label="Municipio de la empresa"
            required
            :disabled="disabled"
            :error="errors.municipalityId"
            @update:model-value="errors.municipalityId = ''"
          />
        </div>
      </div>
    </section>

    <section v-show="section === 'additional'" class="space-y-4">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Completa estos campos para finalizar el registro de la empresa.
      </p>

      <div class="company-especials-form__row">
        <div class="company-especials-form__col">
          <InputSelect
            id="especials-company-tax-responsibility"
            v-model="form.taxResponsibilityId"
            name="taxResponsibilityId"
            label="Responsabilidad tributaria"
            placeholder="Seleccionar"
            required
            :disabled="disabled"
            :options="taxResponsibilityOptions"
            :error="errors.taxResponsibilityId"
          />
        </div>

        <div class="company-especials-form__col">
          <InputSelect
            id="especials-company-vat-regime"
            v-model="form.vatRegimeId"
            name="vatRegimeId"
            label="Régimen de IVA"
            placeholder="Seleccionar"
            required
            :disabled="disabled"
            :options="vatRegimeOptions"
            :error="errors.vatRegimeId"
          />
        </div>
      </div>

      <div class="company-especials-form__row">
        <div class="company-especials-form__col">
          <InputText
            id="especials-company-accountant-name"
            :model-value="form.accountantName"
            name="accountantName"
            label="Nombre del contador"
            placeholder="Nombre del contador"
            :disabled="disabled"
            :error="errors.accountantName"
            @update:model-value="onAccountantNameChange"
          />
        </div>

        <div class="company-especials-form__col">
          <InputText
            id="especials-company-professional-card"
            :model-value="form.professionalCardNumber"
            name="professionalCardNumber"
            label="N° Tarjeta profesional"
            placeholder="N° Tarjeta profesional"
            digits-only
            :disabled="disabled"
            :max-length="30"
            :error="errors.professionalCardNumber"
            @update:model-value="onProfessionalCardNumberChange"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import InputSelect from '~/core/ui/inputs/InputSelect.vue'
import InputText from '~/core/ui/inputs/InputText.vue'
import InputMunicipalitySearch from '~/core/ui/inputs/InputMunicipalitySearch.vue'
import type { InputSelectOption } from '~/core/ui/inputs/input.types'
import {
  sanitizeCompanyDocumentNumber,
  sanitizeCompanyName,
  sanitizeCompanyProfessionalCardNumber,
  type CompanyFormErrors,
  type CompanyFormValues,
} from '~/core/company/schema/company.schema'

defineOptions({
  name: 'CompanyDataSectionEspecials',
})

const form = defineModel<CompanyFormValues>('form', { required: true })
const errors = defineModel<CompanyFormErrors>('errors', { required: true })

const props = withDefaults(defineProps<{
  section?: 'general' | 'additional'
  disabled?: boolean
  isNaturalPerson: boolean
  isJuridicaPerson: boolean
  isSyncingForm: boolean
  documentTypeOptions: InputSelectOption[]
  vatRegimeOptions: InputSelectOption[]
  taxResponsibilityOptions: InputSelectOption[]
  businessNatureOptions: InputSelectOption[]
}>(), {
  section: 'general',
  disabled: false,
})

const municipalityFieldRef = ref<InstanceType<typeof InputMunicipalitySearch> | null>(null)

const clearPersonFields = () => {
  form.value.businessName = ''
  form.value.firstName = ''
  form.value.middleName = ''
  form.value.lastName = ''
  form.value.secondLastName = ''
  errors.value.businessName = ''
  errors.value.firstName = ''
  errors.value.middleName = ''
  errors.value.lastName = ''
  errors.value.secondLastName = ''
}

const onBusinessNatureChange = (value: string | number) => {
  if (props.disabled || props.isSyncingForm) return
  form.value.businessNatureId = String(value)
  errors.value.businessNatureId = ''
  clearPersonFields()
}

const onDocumentNumberChange = (value: string) => {
  if (props.disabled) return
  form.value.documentNumber = sanitizeCompanyDocumentNumber(value)
  errors.value.documentNumber = ''
}

const onFirstNameChange = (value: string) => {
  if (props.disabled) return
  form.value.firstName = sanitizeCompanyName(value)
  errors.value.firstName = ''
}

const onMiddleNameChange = (value: string) => {
  if (props.disabled) return
  form.value.middleName = sanitizeCompanyName(value)
  errors.value.middleName = ''
}

const onLastNameChange = (value: string) => {
  if (props.disabled) return
  form.value.lastName = sanitizeCompanyName(value)
  errors.value.lastName = ''
}

const onSecondLastNameChange = (value: string) => {
  if (props.disabled) return
  form.value.secondLastName = sanitizeCompanyName(value)
  errors.value.secondLastName = ''
}

const onAccountantNameChange = (value: string) => {
  if (props.disabled) return
  form.value.accountantName = sanitizeCompanyName(value)
  errors.value.accountantName = ''
}

const onProfessionalCardNumberChange = (value: string) => {
  if (props.disabled) return
  form.value.professionalCardNumber = sanitizeCompanyProfessionalCardNumber(value)
  errors.value.professionalCardNumber = ''
}

const reset = () => {
  municipalityFieldRef.value?.reset()
}

defineExpose({
  reset,
  municipalityFieldRef,
})
</script>

<style scoped>
.company-especials-form__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.company-especials-form__col {
  min-width: 0;
}

@media (width >= 640px) {
  .company-especials-form__row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
