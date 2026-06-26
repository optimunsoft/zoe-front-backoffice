<template>
  <div class="flex gap-2">
    <UFormField :name="namePrefix" label="Prefijo">
      <USelect v-model="modelPrefix" :items="countries" value-key="phonePrefix" label-key="phonePrefix"
        :placeholder="placeholders.phonePrefix" variant="outline" :ui="{ base: 'bg-white dark:bg-gray-900' }"
        class="max-w-[80px] min-w-[80px]" />
    </UFormField>

    <UFormField :name="nameNumber" label="Teléfono" class="w-full">
      <UInput v-model="modelNumber" :placeholder="placeholders.phoneNumber" variant="outline"
        :ui="{ root: 'w-full', base: 'bg-white dark:bg-gray-900' }" type="tel" />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import type { PhonePrefixCountry } from '~/core/ubication/types/phone.interface';
import { placeholders } from '~/shared/constants/placeholders';

const props = defineProps<{
  prefix: string;
  number: string;
  countries?: PhonePrefixCountry[];
  namePrefix: string;
  nameNumber: string;
}>();

const emit = defineEmits<{
  'update:prefix': [value: string];
  'update:number': [value: string];
}>();

const modelPrefix = computed({
  get: () => props.prefix,
  set: (val) => emit('update:prefix', val),
});

const modelNumber = computed({
  get: () => props.number,
  set: (val) => emit('update:number', val),
});

const countries = computed(() => props.countries ?? []);
</script>
