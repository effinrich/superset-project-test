import { motion } from "framer-motion";
import { BarChart3, FileSpreadsheet, MessageSquare } from "lucide-react";

export const Greeting = () => {
  return (
    <div className="flex flex-col items-center px-4" key="overview">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Chat with your data
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 text-center text-muted-foreground/80 text-sm max-w-md"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Upload a CSV or Excel file, then ask questions like "What's the trend?"
        or "Show me a chart"
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex gap-4"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <FileSpreadsheet className="size-4" />
          <span>Upload data</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <MessageSquare className="size-4" />
          <span>Ask questions</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <BarChart3 className="size-4" />
          <span>Get insights</span>
        </div>
      </motion.div>
    </div>
  );
};
