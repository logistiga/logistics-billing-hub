import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className={cn("flex items-center gap-1 text-xs text-destructive mt-1", className)}>
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}
