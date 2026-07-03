import { z } from 'zod';

export const JobStatusEnum = z.enum(['scheduled', 'in-progress', 'completed', 'urgent', 'cancelled']);
export const PriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

export const JobSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  title: z.string().min(1),
  description: z.string(),
  status: JobStatusEnum,
  priority: PriorityEnum,
  assignedTo: z.array(z.string()),
  address: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string(),
  scheduledDate: z.string(),
  scheduledTime: z.string().optional(),
  completedDate: z.string().optional(),
  estimatedCost: z.number().nonnegative(),
  actualCost: z.number().nonnegative().optional(),
  materialsCost: z.number().nonnegative().optional(),
  laborHours: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export type Job = z.infer<typeof JobSchema>;
export type JobStatus = z.infer<typeof JobStatusEnum>;
export type Priority = z.infer<typeof PriorityEnum>;

export const CreateJobSchema = JobSchema.omit({ id: true, createdAt: true });
export type CreateJobInput = z.infer<typeof CreateJobSchema>;