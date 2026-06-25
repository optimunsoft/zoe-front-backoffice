import { z } from 'zod'

export const requiredString = z.string().trim().min(1, 'Campo obligatorio')

export const emailString = z
  .string()
  .trim()
  .min(1, 'Campo obligatorio')
  .email('Email no válido')
