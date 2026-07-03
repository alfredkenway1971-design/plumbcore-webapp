import { z } from 'zod';

export const InvoiceStatusEnum = z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']);
export const PaymentMethodEnum = z.enum(['credit_card', 'bank_transfer', 'check', 'cash']);

export const LineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const InvoiceSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  status: InvoiceStatusEnum,
  amount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative().optional(),
  dueDate: z.string(),
  issueDate: z.string(),
  paidDate: z.string().optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  lineItems: z.array(LineItemSchema),
  notes: z.string().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const CreateInvoiceSchema = InvoiceSchema.omit({ id: true });
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;