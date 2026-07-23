const SKIP_INPUT_TYPES = new Set([
  'hidden',
  'checkbox',
  'radio',
  'file',
  'submit',
  'button',
  'reset',
  'image',
  'range',
  'color',
])

const TEXTUAL_SELECTOR = [
  'input:not([type])',
  ...['text', 'email', 'tel', 'password', 'search', 'url', 'number', 'date', 'datetime-local', 'month', 'week', 'time']
    .map((type) => `input[type="${type}"]`),
  'textarea',
  'select',
].join(',')

/** Valor que Chrome suele respetar mejor que "off" en campos de contraseña. */
export const autofillValueForInput = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string => {
  if (el instanceof HTMLInputElement && el.type === 'password') {
    return 'new-password'
  }
  // Token no estándar: Chrome/Google suelen ignorar "off" y sí este valor.
  return 'off'
}

export const disableAutofillOnElement = (
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
) => {
  if (el instanceof HTMLInputElement && SKIP_INPUT_TYPES.has(el.type)) return

  // Permitir autocompletado de código OTP por SMS (no es el autofill de formularios de Google).
  if (el.getAttribute('autocomplete') === 'one-time-code') return

  el.setAttribute('autocomplete', autofillValueForInput(el))
  el.setAttribute('data-lpignore', 'true')
  el.setAttribute('data-1p-ignore', 'true')
  el.setAttribute('data-bwignore', 'true')
  el.setAttribute('data-form-type', 'other')
}

export const disableAutofillIn = (root: ParentNode | Document = document) => {
  root.querySelectorAll<HTMLFormElement>('form').forEach((form) => {
    form.setAttribute('autocomplete', 'off')
    form.setAttribute('data-lpignore', 'true')
    form.setAttribute('data-1p-ignore', 'true')
  })

  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(TEXTUAL_SELECTOR)
    .forEach(disableAutofillOnElement)
}
