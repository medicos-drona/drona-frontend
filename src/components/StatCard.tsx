import React from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  loading?: boolean;
  error?: boolean;
}

export const StatCard = ({
  icon = <HelpCircle className="h-5 w-5 text-muted-foreground" />,
  label,
  value,
  className,
  iconClassName,
  labelClassName,
  valueClassName,
  loading = false,
  error = false,
}: StatCardProps) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-2">
        <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted", iconClassName)}>
          {error ? <AlertCircle className="h-5 w-5 text-destructive" /> : icon}
        </div>
        <div className="space-y-1">
          <p className={cn("text-sm font-medium text-muted-foreground", labelClassName)}>
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-9 w-24" />
          ) : error ? (
            <p className={cn("text-sm font-medium text-destructive")}>
              Failed to load
            </p>
          ) : (
            <p className={cn("text-3xl font-bold", valueClassName)}>
              {value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
