import { disableAutofillIn, disableAutofillOnElement } from '~/shared/utils/disable-autofill.utils'

/**
 * Desactiva el autocompletado de Chrome/Google (y gestores de contraseñas)
 * en todos los formularios e inputs de la aplicación.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const apply = () => disableAutofillIn(document)

  apply()

  let scheduled = false
  const schedule = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      apply()
    })
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue

        if (node instanceof HTMLFormElement) {
          node.setAttribute('autocomplete', 'off')
        }

        if (
          node instanceof HTMLInputElement
          || node instanceof HTMLTextAreaElement
          || node instanceof HTMLSelectElement
        ) {
          disableAutofillOnElement(node)
        }

        if (node.querySelectorAll) {
          schedule()
          return
        }
      }
    }
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
})
