<template>
  <USelectMenu v-model="modelValue" v-model:search-term="searchTerm" :items="itemsWithLabel" value-key="phonePrefix"
    label-key="label" :placeholder="placeholders.phonePrefix" searchable :reset-search-term-on-select="false"
    :reset-search-term-on-blur="false" :filter-fields="['phonePrefix', 'name']" :search-input="selectMenuSearchInput"
    :ui="{ content: 'min-w-fit' }">
    <template #empty>
      <UISelectMenuEmpty type="phonePrefix" />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import type { PhonePrefixCountry } from '~/core/ubication/types/phone.interface';
import { placeholders } from '~/shared/constants/placeholders';
import { selectMenuSearchInput } from '~/shared/constants/select-menu';

const props = defineProps<{
  items: PhonePrefixCountry[];
}>();

const modelValue = defineModel<string | undefined>({ required: true });

const searchTerm = ref(modelValue.value || '');

const itemsWithLabel = computed(() => {
  return props.items.map((item) => ({
    ...item,
    label: `${item.iso3} ${item.phonePrefix}`,
  }));
});
</script>
