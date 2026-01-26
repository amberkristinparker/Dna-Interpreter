import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Dna, ArrowRight, Activity, FileText } from "lucide-react";
import { useReports, useAnalyzeDNA } from "@/hooks/use-reports";
import { UploadZone } from "@/components/UploadZone";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: reports, isLoading } = useReports();
  const analyzeMutation = useAnalyzeDNA();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUpload = async (content: string, filename: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMutation.mutateAsync({ content, filename });
      toast({
        title: "Analysis Complete",
        description: "Your DNA report is ready to view.",
      });
      setLocation(`/report/${result.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong processing your file.",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen scientific-grid">
      {/* Hero Section */}
      <header className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Dna className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent tracking-tight leading-tight">
            Decode Your DNA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your raw DNA data to discover insights about your personality, 
            health traits, and genetic predispositions.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-20 space-y-16">
        {/* Upload Section */}
        <section className="bg-card/50 backdrop-blur-sm rounded-3xl p-2 shadow-2xl shadow-primary/5 ring-1 ring-border/50">
          <UploadZone onFileSelect={handleUpload} isAnalyzing={isAnalyzing} />
        </section>

        {/* Recent Analyses Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Analyses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </>
            ) : reports?.length === 0 ? (
              <Card className="col-span-full border-dashed p-8 bg-transparent">
                <div className="text-center text-muted-foreground space-y-2">
                  <FileText className="w-8 h-8 mx-auto opacity-50" />
                  <p>No reports yet. Upload a file to get started.</p>
                </div>
              </Card>
            ) : (
              reports?.map((report) => (
                <Link key={report.id} href={`/report/${report.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-primary/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="font-display text-lg group-hover:text-primary transition-colors">
                            {report.filename}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {report.createdAt ? format(new Date(report.createdAt), "MMM d, yyyy • h:mm a") : "Unknown date"}
                          </CardDescription>
                        </div>
                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {/* Preview badges based on findings count */}
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {Array.isArray(report.results) ? report.results.length : 0} Markers Found
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-muted/20">
        <p>© 2024 Genotype AI. Educational purposes only.</p>
      </footer>
    </div>
  );
}
