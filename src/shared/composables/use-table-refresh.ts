import { computed, ref, watch, type Ref } from 'vue'

type UseTableRefreshOptions = {
  initialLoading?: boolean
}

/**
 * Estado compartido para la cinta de recarga de `UTable` (`TableRefreshRibbon`).
 * - Primera carga: `showInitialLoader` (placeholder completo).
 * - Recargas posteriores: `isTableRefreshing` (cinta superior en la tabla).
 */
export function useTableRefresh(
  loadingRef?: Ref<boolean>,
  options: UseTableRefreshOptions = {},
) {
  const isLoading = loadingRef ?? ref(options.initialLoading ?? false)
  const isInitialLoadDone = ref(false)

  const isTableRefreshing = computed(
    () => isLoading.value && isInitialLoadDone.value,
  )

  const showInitialLoader = computed(
    () => isLoading.value && !isInitialLoadDone.value,
  )

  const finishTableLoad = () => {
    isInitialLoadDone.value = true
  }

  const withTableLoading = async <T>(task: () => Promise<T>): Promise<T> => {
    isLoading.value = true

    try {
      return await task()
    } finally {
      isLoading.value = false
      finishTableLoad()
    }
  }

  if (loadingRef) {
    watch(isLoading, (loading) => {
      if (!loading) finishTableLoad()
    })
  }

  return {
    isLoading,
    isInitialLoadDone,
    isTableRefreshing,
    showInitialLoader,
    finishTableLoad,
    withTableLoading,
  }
}
