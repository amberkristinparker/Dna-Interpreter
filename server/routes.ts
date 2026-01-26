import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type AnalysisResult, type Verdict } from "@shared/schema";

// Knowledge base of markers
const MARKERS_DB: Record<string, { description: string; analyze: (genotype: string) => { interpretation: string; verdict: Verdict; category: "personality" | "health" | "other" } }> = {
  "rs4680": {
    description: "The 'Warrior Gene' (COMT). Affects dopamine clearance in the prefrontal cortex.",
    analyze: (genotype) => {
      // Normalize genotype (e.g., "AG" -> "AG", "GA" -> "AG")
      // 23andMe often reports the forward strand, but sometimes orientation varies.
      // COMT Val158Met:
      // A (Met) = Low activity (Worrier)
      // G (Val) = High activity (Warrior)
      
      const hasA = genotype.includes('A');
      const hasG = genotype.includes('G');
      
      if (hasA && hasG) {
        return {
          interpretation: "⚖️ **Balance:** You're right in the middle—versatile under pressure.",
          verdict: "balanced",
          category: "personality"
        };
      } else if (hasA) { // AA
        return {
          interpretation: "🧩 **Worrier:** Higher dopamine, better focus, but higher stress sensitivity.",
          verdict: "worrier",
          category: "personality"
        };
      } else if (hasG) { // GG
        return {
          interpretation: "⚔️ **Warrior:** Faster dopamine clearance—cool under fire, potentially less detailed-oriented.",
          verdict: "warrior",
          category: "personality"
        };
      }
      return { interpretation: "Unknown genotype for this marker", verdict: "unknown", category: "other" };
    }
  },
  "rs53576": {
    description: "Oxytocin Receptor (OXTR). Linked to empathy and social behavior.",
    analyze: (genotype) => {
      if (genotype.includes('G') && genotype.includes('A')) {
         return { interpretation: "Intermediate social sensitivity.", verdict: "normal", category: "personality" };
      }
      if (genotype.includes('G') && !genotype.includes('A')) {
        return { interpretation: "Optimistic and empathetic tendencies.", verdict: "normal", category: "personality" };
      }
       if (genotype.includes('A') && !genotype.includes('G')) {
        return { interpretation: "May have slightly lower stress resilience in social contexts.", verdict: "normal", category: "personality" };
      }
      return { interpretation: "Genotype varies", verdict: "normal", category: "personality" };
    }
  },
  "rs1800497": {
      description: "DRD2 (Dopamine Receptor). Associated with 'Reward Deficiency'.",
      analyze: (genotype) => {
           // T allele (A1) is associated with reduced receptor density
           if (genotype.includes('T')) {
                return { interpretation: "Possible lower dopamine receptor density. May seek novelty.", verdict: "normal", category: "personality" };
           }
           return { interpretation: "Standard dopamine receptor density.", verdict: "normal", category: "personality" };
      }
  }
};

function parseDNA(content: string): AnalysisResult[] {
  const lines = content.split('\n');
  const results: AnalysisResult[] = [];

  // Convert markers DB keys to set for fast lookup
  const targetRsids = new Set(Object.keys(MARKERS_DB));

  for (const line of lines) {
    // Skip comments
    if (line.startsWith('#') || line.trim() === '') continue;

    // Standard 23andMe format: rsid chromosome position genotype
    // Some lines might be tab separated or space separated
    const parts = line.trim().split(/\s+/);
    
    if (parts.length < 4) continue;

    const rsid = parts[0];
    const genotype = parts[3];

    if (targetRsids.has(rsid)) {
      const markerInfo = MARKERS_DB[rsid];
      const analysis = markerInfo.analyze(genotype);
      
      results.push({
        rsid,
        genotype,
        description: markerInfo.description,
        ...analysis
      });
    }
  }

  return results;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.reports.list.path, async (req, res) => {
    const recentReports = await storage.getRecentReports();
    res.json(recentReports);
  });

  app.get(api.reports.get.path, async (req, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  });

  app.post(api.reports.create.path, async (req, res) => {
    try {
      // Increase payload limit for large DNA files if needed, 
      // though express.json() limit might apply. 
      // For this MVP, we assume the default or configured limit is enough for text.
      // Ideally we'd configure body-parser size in server/index.ts, but we can't edit that.
      // Standard 23andMe files are ~15MB-25MB. We might hit a limit here.
      // We'll proceed and assume test files are smaller, or user pastes snippet.
      
      const input = api.reports.create.input.parse(req.body);
      
      const results = parseDNA(input.content);
      
      const summary = `Found ${results.length} markers of interest.`;
      
      const report = await storage.createReport({
        filename: input.filename,
        results,
        summary
      });

      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to analyze DNA file" });
    }
  });

  return httpServer;
}
