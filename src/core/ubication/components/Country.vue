<template>
  <USelectMenu v-model="modelValue" v-model:search-term="searchTerm" value-key="id" label-key="name" :items="countries"
    :placeholder="placeholders.countryID" trailing :loading="searchLoading" :search-input="selectMenuSearchInput"
    :ui="{ content: 'min-w-fit' }">
    <template #empty>
      <UISelectMenuEmpty type="country" />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import type { Country } from '~/core/ubication/types/country.interface';
import { useCountryService } from '~/core/ubication/services/country.service';
import { placeholders } from '~/shared/constants/placeholders';
import { selectMenuSearchInput } from '~/shared/constants/select-menu';

const props = defineProps<{
  initialSearchId?: string;
}>();

const modelValue = defineModel<string>();
const modelValuePhonePrefix = defineModel<string>('phonePrefix');

watch(modelValue, (id) => {
  const selected = countries.value.find((c) => c.id === id);
  if (selected) modelValuePhonePrefix.value = selected.phonePrefix;
});

const searchTerm = ref('');
const searchLoading = ref(false);
const searchTermDebounced = refDebounced(searchTerm, 300);

const countryService = useCountryService();
const countries = ref<Country[]>([]);

const fetchCountries = async (
  params: Partial<Pick<Country, 'id' | 'name'>>,
) => {
  try {
    searchLoading.value = true;
    const { response } = await countryService.search(params);
    const newItems = response.map((item) => ({
      ...item,
      name: `${item.name}`,
    }));

    const current = countries.value.find((c) => c.id === modelValue.value);
    const foundInNewItems = newItems.some((c) => c.id === modelValue.value);

    if (current && !foundInNewItems) {
      countries.value = [current, ...newItems];
    } else {
      countries.value = newItems;
    }
  } catch (error) {
    console.error('Fetch countries error:', error);
  } finally {
    searchLoading.value = false;
  }
};

watch(searchTermDebounced, async (term) => {
  if (term && term?.trim()) {
    await fetchCountries({ name: term });
  }
});

watch(
  () => props.initialSearchId,
  async (id) => {
    if (id && id?.trim()) {
      await fetchCountries({ id });
      const selected = countries.value.find((c) => c.id === id);
      if (selected) modelValuePhonePrefix.value = selected.phonePrefix;
    }
  },
  { immediate: true },
);
</script>
