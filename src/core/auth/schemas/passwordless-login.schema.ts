import { z } from 'zod'

import { emailString } from '~/shared/schemas/base'

export const AUTHORIZED_EMAIL_DOMAIN = 'optimunsoft.co'

const authorizedEmailString = emailString.refine(
  (value) => value.toLowerCase().endsWith(`@${AUTHORIZED_EMAIL_DOMAIN}`),
  { message: 'Correo no autorizado' },
)

export const passwordlessLoginEmailSchema = z.object({
  email: authorizedEmailString,
})

export const passwordlessLoginVerifySchema = z.object({
  email: authorizedEmailString,
  code: z.string().trim().min(4, 'El código es obligatorio'),
})

export type PasswordlessLoginEmailForm = z.infer<typeof passwordlessLoginEmailSchema>

export const parsePasswordlessLoginEmail = (values: { email: string }) => {
  const result = passwordlessLoginEmailSchema.safeParse(values)

  if (!result.success) {
    return {
      success: false as const,
      emailError: result.error.flatten().fieldErrors.email?.[0] ?? 'Correo no autorizado',
    }
  }

  return {
    success: true as const,
    data: result.data,
  }
}
