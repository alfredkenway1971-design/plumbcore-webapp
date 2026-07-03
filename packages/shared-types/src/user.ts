import { z } from 'zod';

export const UserRoleEnum = z.enum(['admin', 'dispatcher', 'lead-tech', 'senior-tech', 'tech']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleEnum,
  avatarUrl: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  lastLogin: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleEnum>;

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, lastLogin: true, isActive: true });
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;