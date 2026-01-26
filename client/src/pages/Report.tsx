import { useRoute, Link } from "wouter";
import { ArrowLeft, Share2, Download, AlertTriangle, Info, Tag } from "lucide-react";
import { useReport } from "@/hooks/use-reports";
import { VerdictCard } from "@/components/VerdictCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AnalysisResult } from "@shared/schema";
import { format } from "date-fns";

export default function Report() {
  const [, params] = useRoute("/report/:id");
  const id = parseInt(params?.id || "0");
  const { data: report, isLoading, error } = useReport(id);

  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Report Not Found</h1>
          <p className="text-muted-foreground">The requested analysis could not be found.</p>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const results = report.results as AnalysisResult[];
  const comtVariant = results.find(r => r.rsid === "rs4680");

  // Prepare chart data
  const categoryCounts = results.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">
              {report.filename}
            </span>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Report Meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              DNA Analysis Report
            </Badge>
            <span className="text-sm text-muted-foreground">
              {report.createdAt && format(new Date(report.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
          <h1 className="text-4xl font-display font-bold">Genetic Profile Analysis</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Based on the raw data provided, we identified {results.length} specific markers of interest.
          </p>
        </div>

        {/* Spotlight Section - COMT */}
        {comtVariant && (
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Key Insight: Warrior vs Worrier
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VerdictCard 
                  verdict={comtVariant.verdict}
                  rsid={comtVariant.rsid}
                  genotype={comtVariant.genotype}
                  description={comtVariant.description}
                  interpretation={comtVariant.interpretation}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trait Distribution</CardTitle>
                  <CardDescription>Breakdown by category</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)', 
                          borderRadius: '8px',
                          border: '1px solid var(--border)' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {chartData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="capitalize text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Full Results Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Detailed Findings
          </h2>
          <Card className="overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[150px]">Marker (RSID)</TableHead>
                  <TableHead className="w-[100px]">Genotype</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead>Interpretation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={`${result.rsid}-${idx}`} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-medium text-primary">
                      {result.rsid}
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      <Badge variant="secondary" className="font-mono">
                        {result.genotype}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-muted-foreground">
                        {result.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm leading-relaxed max-w-prose">
                      {result.interpretation}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Disclaimer */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-sm text-blue-900/70 flex gap-4">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold">Educational Purposes Only</h4>
            <p>
              This report is generated based on raw genetic data and public scientific literature. 
              It is not a medical diagnosis and should not be used to make health decisions. 
              Always consult with a qualified healthcare provider or genetic counselor for medical advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b h-16" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
