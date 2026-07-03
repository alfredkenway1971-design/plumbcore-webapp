import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  legalName: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string(),
  phone: z.string(),
  email: z.string().email(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  taxId: z.string().optional(),
  licenseNumber: z.string().optional(),
  insuranceInfo: z.string().optional(),
  timezone: z.string().default('America/Chicago'),
  currency: z.string().default('USD'),
  createdAt: z.string(),
});

export type Company = z.infer<typeof CompanySchema>;

export const UpdateCompanySchema = CompanySchema.partial().omit({ id: true, createdAt: true });
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;