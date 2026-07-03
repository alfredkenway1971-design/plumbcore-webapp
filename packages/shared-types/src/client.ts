import { z } from 'zod';

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string(),
  company: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  totalJobs: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
});

export type Client = z.infer<typeof ClientSchema>;

export const CreateClientSchema = ClientSchema.omit({ id: true, createdAt: true, totalJobs: true, totalRevenue: true });
export type CreateClientInput = z.infer<typeof CreateClientSchema>;