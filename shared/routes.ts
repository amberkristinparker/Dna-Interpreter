import { z } from 'zod';
import { insertReportSchema, reports } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Define the API contract
export const api = {
  reports: {
    // List recent reports (history)
    list: {
      method: 'GET' as const,
      path: '/api/reports',
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      },
    },
    // Create a new analysis from a file upload
    create: {
      method: 'POST' as const,
      path: '/api/analyze',
      input: z.object({
        content: z.string().min(1, "File content is required"),
        filename: z.string(),
      }),
      responses: {
        201: z.custom<typeof reports.$inferSelect>(), // Returns the created report
        400: errorSchemas.validation,
      },
    },
    // Get a specific report
    get: {
      method: 'GET' as const,
      path: '/api/reports/:id',
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Type exports
export type AnalyzeInput = z.infer<typeof api.reports.create.input>;
export type ReportResponse = z.infer<typeof api.reports.create.responses[201]>;
