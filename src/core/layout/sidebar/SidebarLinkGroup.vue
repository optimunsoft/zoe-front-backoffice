<template>
  <li
    class="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r"
    :class="activeCondition && 'from-brand-500/12 dark:from-brand-500/24 to-brand-500/4'"
  >
    <slot :handleClick="handleClick" :expanded="expanded" />
  </li>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'SidebarLinkGroup',
  props: ['activeCondition'],
  setup(props) {
    const expanded = ref(props.activeCondition)

    watch(
      () => props.activeCondition,
      (isActive) => {
        if (isActive) expanded.value = true
      },
    )

    const handleClick = () => {
      expanded.value = !expanded.value
    }

    return {
      expanded,
      handleClick,
    }
  },
}
</script>
