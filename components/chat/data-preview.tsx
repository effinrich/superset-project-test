"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Database, Table } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DataUploadResult } from "./data-upload";

interface DataPreviewProps {
  data: DataUploadResult;
  className?: string;
}

const ROWS_PER_PAGE = 10;

export function DataPreview({ data, className }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(data.rows.length / ROWS_PER_PAGE);
  const startRow = currentPage * ROWS_PER_PAGE;
  const visibleRows = data.rows.slice(startRow, startRow + ROWS_PER_PAGE);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col gap-3", className)}
      initial={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Data Preview</span>
          <span className="text-xs text-muted-foreground">
            ({data.rowCount.toLocaleString()} rows)
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              className="size-7"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              className="size-7"
              disabled={currentPage >= totalPages - 1}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-10">
                  #
                </th>
                {data.headers.map((header) => (
                  <th
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                    key={header}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                  key={`row-${row.join("-")}`}
                >
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {startRow + visibleRows.indexOf(row) + 1}
                  </td>
                  {row.map((cell) => (
                    <td
                      className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate"
                      key={`cell-${row.join("-")}-${cell}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Table className="size-3" />
        <span>Showing columns: {data.headers.join(", ")}</span>
      </div>
    </motion.div>
  );
}
