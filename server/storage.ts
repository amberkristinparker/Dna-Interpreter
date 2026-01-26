import { db } from "./db";
import {
  reports,
  type Report,
  type InsertReport
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getRecentReports(limit?: number): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getRecentReports(limit: number = 10): Promise<Report[]> {
    return await db.select()
      .from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
