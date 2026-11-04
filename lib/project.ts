import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().trim().max(160).default(''),
  subject: z.string().trim().max(120).default(''),
  level: z.enum(['', 'undergraduate', 'postgraduate', 'other']).default(''),
}).strict();
export type Project = z.infer<typeof projectSchema>;
export const emptyProject: Project = { title: '', subject: '', level: '' };
