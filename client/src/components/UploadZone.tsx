import { useCallback, useState } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (content: string, filename: string) => Promise<void>;
  isAnalyzing: boolean;
}

export function UploadZone({ onFileSelect, isAnalyzing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.txt')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a raw DNA data .txt file (e.g. from 23andMe or Ancestry).",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        await onFileSelect(content, file.name);
      }
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Read error",
        description: "Failed to read the file content.",
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
        isDragging 
          ? "border-primary bg-primary/5 shadow-xl scale-[1.01]" 
          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30",
        isAnalyzing && "pointer-events-none opacity-80"
      )}
    >
      <input
        type="file"
        accept=".txt"
        className="absolute inset-0 cursor-pointer opacity-0 z-50"
        onChange={handleFileInput}
        disabled={isAnalyzing}
      />
      
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className={cn(
          "p-4 rounded-full transition-all duration-300",
          isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          {isAnalyzing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Upload className="w-8 h-8" strokeWidth={2} />
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-display text-xl font-bold">
            {isAnalyzing ? "Analyzing Genome..." : "Upload DNA Data"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Drag & drop your raw data .txt file here, or click to browse
          </p>
        </div>

        {!isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
            <FileText className="w-3.5 h-3.5" />
            <span>Supports 23andMe, AncestryDNA, MyHeritage formats</span>
          </div>
        )}
      </div>

      {/* Decorative scanning line animation */}
      {isAnalyzing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan opacity-50" />
      )}
    </div>
  );
}
