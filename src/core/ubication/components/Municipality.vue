<template>
  <USelectMenu v-model="modelValue" v-model:search-term="searchTerm" value-key="id" label-key="name"
    :items="municipalities" :placeholder="placeholders.municipalityId" trailing :loading="searchLoading"
    :search-input="selectMenuSearchInput" :ui="{ content: 'min-w-fit' }">
    <template #empty>
      <UISelectMenuEmpty type="municipality" />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import type { Municipality } from '~/core/ubication/types/municipality.interface';
import { useMunicipalityService } from '~/core/ubication/services/municipality.service';
import { placeholders } from '~/shared/constants/placeholders';
import { selectMenuSearchInput } from '~/shared/constants/select-menu';

const props = defineProps<{
  countryId?: string;
  initialSearchId?: string;
}>();

const modelValue = defineModel<string | undefined>({ required: true });

const searchTerm = ref('');
const searchLoading = ref(false);
const searchTermDebounced = refDebounced(searchTerm, 300);

const municipalityService = useMunicipalityService();
const municipalities = ref<Municipality[]>([]);

const fetchMunicipalities = async (params: {
  name?: string;
  id?: string;
}) => {
  try {
    searchLoading.value = true;

    const { response } = await municipalityService.search({
      countryId: props.countryId,
      ...params,
    });

    const newItems = response.map((item) => ({
      ...item,
      name: `${item.name} - ${item.state.name}`,
    }));

    const current = municipalities.value.find(
      (m) => m.id === modelValue.value,
    );
    const foundInNewItems = newItems.some((m) => m.id === modelValue.value);

    if (current && !foundInNewItems) {
      municipalities.value = [current, ...newItems];
    } else {
      municipalities.value = newItems;
    }
  } catch (error) {
    console.error('Municipality fetch error:', error);
  } finally {
    searchLoading.value = false;
  }
};

watch(searchTermDebounced, async (term) => {
  if (term && term?.trim()) {
    await fetchMunicipalities({ name: term });
  }
});

watch(
  () => props.initialSearchId,
  async (id) => {
    if (id && id?.trim()) {
      await fetchMunicipalities({ id });
    }
  },
  { immediate: true },
);
</script>
