import { emailString, requiredString } from '~/shared/schemas/base';
import { z } from 'zod';

export const loginSchema = z.object({
  email: emailString,
  password: requiredString,
});

export const forgotPasswordSchema = z.object({
  email: emailString,
});

export type LoginForm = z.infer<typeof loginSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
