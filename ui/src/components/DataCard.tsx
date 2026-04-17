import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface DataCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  className?: string;
}

export function DataCard({ label, value, change, changeType = "neutral", icon, className }: DataCardProps) {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-semibold tracking-tight" style={{ fontSize: "1.5rem" }}>
            {value}
          </p>
          {change && (
            <p className={cn("mt-1 text-sm", changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}
