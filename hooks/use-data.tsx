"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import type { DataUploadResult } from "@/components/chat/data-upload";

interface DataContextType {
  uploadedData: DataUploadResult | null;
  setUploadedData: (data: DataUploadResult | null) => void;
  dataContext: string;
  generateDataContext: (data: DataUploadResult) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [uploadedData, setUploadedData] = useState<DataUploadResult | null>(
    null
  );

  const generateDataContext = useCallback((data: DataUploadResult): string => {
    const sampleRows = data.rows.slice(0, 5);
    const columnTypes = data.headers.map((_header, i) => {
      const values = data.rows
        .slice(0, 100)
        .map((row) => row[i])
        .filter((v) => v !== "");
      const numericCount = values.filter(
        (v) => !Number.isNaN(Number(v))
      ).length;
      const dateCount = values.filter(
        (v) => !Number.isNaN(Date.parse(v))
      ).length;

      if (numericCount / values.length > 0.8) {
        return "numeric";
      }
      if (dateCount / values.length > 0.8) {
        return "date";
      }
      return "text";
    });

    return `I have uploaded a dataset with the following information:

File: ${data.fileName}
Rows: ${data.rowCount.toLocaleString()}
Columns: ${data.columnCount}

Column headers and types:
${data.headers.map((h, i) => `- ${h} (${columnTypes[i]})`).join("\n")}

Sample data (first ${sampleRows.length} rows):
${sampleRows.map((row) => data.headers.map((h, i) => `${h}: ${row[i]}`).join(", ")).join("\n")}

Please analyze this data and answer my questions about it.`;
  }, []);

  const dataContext = uploadedData ? generateDataContext(uploadedData) : "";

  return (
    <DataContext.Provider
      value={{
        uploadedData,
        setUploadedData,
        dataContext,
        generateDataContext,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
