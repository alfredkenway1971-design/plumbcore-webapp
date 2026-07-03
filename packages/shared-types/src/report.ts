import { z } from 'zod';

export const ReportTypeEnum = z.enum(['revenue', 'jobs', 'inventory', 'labor', 'customer']);

export const ReportSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: ReportTypeEnum,
  dateRange: z.object({ start: z.string(), end: z.string() }),
  generatedAt: z.string(),
  data: z.record(z.string(), z.any()),
  summary: z.string().optional(),
});

export type Report = z.infer<typeof ReportSchema>;
export type ReportType = z.infer<typeof ReportTypeEnum>;

export const RevenueReportSchema = z.object({
  totalRevenue: z.number(),
  invoicedAmount: z.number(),
  collectedAmount: z.number(),
  outstandingAmount: z.number(),
  revenueByClient: z.array(z.object({ clientId: z.string(), clientName: z.string(), amount: z.number() })),
  revenueByMonth: z.array(z.object({ month: z.string(), amount: z.number() })),
});

export type RevenueReport = z.infer<typeof RevenueReportSchema>;

export const JobReportSchema = z.object({
  totalJobs: z.number(),
  completedJobs: z.number(),
  inProgressJobs: z.number(),
  scheduledJobs: z.number(),
  cancelledJobs: z.number(),
  avgCompletionTime: z.number().optional(),
  jobsByTech: z.array(z.object({ techId: z.string(), techName: z.string(), count: z.number() })),
});

export type JobReport = z.infer<typeof JobReportSchema>;