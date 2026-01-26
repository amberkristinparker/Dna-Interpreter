import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We'll store the analysis reports so users can view them.
// We won't store the full raw DNA file for privacy/storage reasons, 
// just the extracted interesting markers.

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  // Storing the found markers as a JSON blob for simplicity in this MVP.
  // In a larger app, we might normalize this into a separate table.
  results: jsonb("results").$type<AnalysisResult[]>().notNull(), 
  summary: text("summary"), // Optional high-level summary
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  createdAt: true 
});

// === DOMAIN TYPES ===

export type Verdict = "warrior" | "worrier" | "balanced" | "normal" | "unknown";

export interface AnalysisResult {
  rsid: string;
  genotype: string;
  description: string;
  interpretation: string;
  verdict: Verdict;
  category: "personality" | "health" | "other";
}

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type AnalyzeRequest = {
  fileContent: string;
  filename: string;
};

export type AnalyzeResponse = Report;
