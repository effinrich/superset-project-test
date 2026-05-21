"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DataPreview } from "@/components/chat/data-preview";
import type { DataUploadResult } from "@/components/chat/data-upload";
import { DataUpload } from "@/components/chat/data-upload";
import { Greeting } from "@/components/chat/greeting";
import { Button } from "@/components/ui/button";
import { useData } from "@/hooks/use-data";
import { SAMPLE_DATASET_CSV } from "@/lib/sample-data";

export default function Page() {
  const { uploadedData, setUploadedData } = useData();

  const handleDataUpload = (data: DataUploadResult) => {
    setUploadedData(data);
  };

  const loadSampleData = () => {
    const blob = new Blob([SAMPLE_DATASET_CSV], { type: "text/csv" });
    const file = new File([blob], "sample-sales-data.csv", {
      type: "text/csv",
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const lines = content.split("\n").filter((line) => line.trim() !== "");
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

        const result: DataUploadResult = {
          fileName: "sample-sales-data.csv",
          fileType: "text/csv",
          content,
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
        };

        setUploadedData(result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <Greeting />

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          <DataUpload className="w-full" onDataUploaded={handleDataUpload} />
        </motion.div>

        {!uploadedData && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              className="gap-2"
              onClick={loadSampleData}
              variant="outline"
            >
              <Sparkles className="size-4" />
              Try with sample data
            </Button>
          </motion.div>
        )}

        {uploadedData && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
          >
            <DataPreview data={uploadedData} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
