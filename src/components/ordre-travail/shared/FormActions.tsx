import { Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClear: () => void;
  onCancel: () => void;
  onPreviewPdf: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
}

export function FormActions({
  onClear,
  onCancel,
  onPreviewPdf,
  onSubmit,
  isSubmitting = false,
  canSubmit = true,
  submitLabel = "Créer l'ordre",
  submittingLabel = "Création...",
}: FormActionsProps) {
  return (
    <div className="flex justify-between pt-4 border-t">
      <Button
        variant="ghost"
        onClick={onClear}
        className="text-muted-foreground hover:text-destructive"
        disabled={isSubmitting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Réinitialiser
      </Button>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button variant="outline" onClick={onPreviewPdf} disabled={!canSubmit || isSubmitting}>
          <FileText className="h-4 w-4 mr-2" />
          Aperçu PDF
        </Button>
        <Button variant="gradient" onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}
