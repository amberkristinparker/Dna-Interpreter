import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Brain, Scale, Sword } from "lucide-react";
import type { Verdict } from "@shared/schema";
import { cn } from "@/lib/utils";

interface VerdictCardProps {
  verdict: Verdict;
  rsid: string;
  genotype: string;
  description: string;
  interpretation: string;
}

export function VerdictCard({ verdict, rsid, genotype, description, interpretation }: VerdictCardProps) {
  const getVerdictConfig = (v: Verdict) => {
    switch (v) {
      case "warrior":
        return {
          icon: Sword,
          label: "Warrior",
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          gradient: "from-red-500/10 to-orange-500/10",
        };
      case "worrier":
        return {
          icon: Brain,
          label: "Worrier",
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
          gradient: "from-blue-500/10 to-indigo-500/10",
        };
      case "balanced":
        return {
          icon: Scale,
          label: "Balanced",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          gradient: "from-emerald-500/10 to-teal-500/10",
        };
      default:
        return {
          icon: Shield,
          label: "Unknown",
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          gradient: "from-gray-100 to-gray-200",
        };
    }
  };

  const config = getVerdictConfig(verdict);
  const Icon = config.icon;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg border-2",
      config.border
    )}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", config.gradient)} />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider bg-background/50 backdrop-blur-sm">
            {rsid}
          </Badge>
          <Badge className={cn("capitalize font-bold shadow-sm", config.bg, config.color, "border-0")}>
            {config.label} Type
          </Badge>
        </div>
        <CardTitle className="flex items-center gap-3 text-2xl mt-4">
          <div className={cn("p-3 rounded-xl shadow-inner", config.bg)}>
            <Icon className={cn("w-8 h-8", config.color)} strokeWidth={2.5} />
          </div>
          <div>
            <span className="block text-sm font-medium text-muted-foreground font-sans">COMT Gene Variant</span>
            <span className="text-3xl font-display">{genotype}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative pt-4 space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">What this means</h4>
          <p className="text-lg font-medium leading-relaxed">
            {interpretation}
          </p>
        </div>
        
        <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border text-sm text-muted-foreground">
          <p>{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
