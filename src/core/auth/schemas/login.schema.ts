import { emailString, requiredString } from '~/shared/schemas/base';
import { z } from 'zod';

export const loginSchema = z.object({
  email: emailString,
  password: requiredString,
});

export type LoginForm = z.infer<typeof loginSchema>;
