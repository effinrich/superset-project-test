"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileSpreadsheet, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataUploadProps {
  onDataUploaded: (data: DataUploadResult) => void;
  className?: string;
}

export interface DataUploadResult {
  fileName: string;
  fileType: string;
  content: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
}

export function DataUpload({ onDataUploaded, className }: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<DataUploadResult | null>(
    null
  );

  const parseCSV = useCallback((content: string): DataUploadResult => {
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) {
      throw new Error("Empty file");
    }

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines
      .slice(1)
      .map((line) => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      })
      .filter((row) => row.some((cell) => cell !== ""));

    return {
      fileName: "",
      fileType: "text/csv",
      content,
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length,
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (
        !file.name.endsWith(".csv") &&
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls")
      ) {
        toast.error("Please upload a CSV or Excel file");
        return;
      }

      setIsUploading(true);

      try {
        const content = await file.text();
        const result = parseCSV(content);
        result.fileName = file.name;
        result.fileType = file.type || "text/csv";

        setUploadedFile(result);
        onDataUploaded(result);
        toast.success(
          `Uploaded ${file.name} - ${result.rowCount} rows, ${result.columnCount} columns`
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to parse file"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onDataUploaded, parseCSV]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const clearUpload = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {uploadedFile ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-4"
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            key="file"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
              <FileSpreadsheet className="size-5 text-green-500" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {uploadedFile.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadedFile.rowCount.toLocaleString()} rows ·{" "}
                {uploadedFile.columnCount} columns
              </p>
            </div>

            <Button
              className="size-8 shrink-0"
              onClick={clearUpload}
              size="icon"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/50 bg-card/50 hover:border-border hover:bg-card"
            )}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            key="upload"
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              accept=".csv,.xlsx,.xls"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileInput}
              type="file"
            />

            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl transition-colors duration-200",
                  isDragging ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Upload
                  className={cn(
                    "size-6 transition-colors duration-200",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium">
                  {isUploading ? "Uploading..." : "Drop your CSV file here"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                <AlertCircle className="size-3" />
                <span>Supports CSV files</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
