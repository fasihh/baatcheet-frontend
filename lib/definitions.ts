import z from 'zod';

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .optional(),
  username: z
    .string()
    .regex(/^(?=.{3,20}$)[a-zA-Z][a-zA-Z0-9_]*$/, {
      message:
        "Username must start with a letter, be 3-20 characters long, and only contain letters, numbers, or underscores.",
    })
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .trim(),
});
export type UserSchema = z.infer<typeof userSchema>;

export type FormState<T> =
  | {
    errors?: Partial<Record<keyof T | "_form", string[]>>,
    message?: string,
    values?: T
  }
  | undefined;
