import { useDark } from '@vueuse/core'

export default defineNuxtPlugin(() => {
  useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: '',
  })
})
