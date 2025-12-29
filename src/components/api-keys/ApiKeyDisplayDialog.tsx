import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Check, AlertTriangle, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyDisplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyData: { key: string; name: string } | null;
}

export const ApiKeyDisplayDialog = ({
  open,
  onOpenChange,
  keyData,
}: ApiKeyDisplayDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (keyData?.key) {
      navigator.clipboard.writeText(keyData.key);
      setCopied(true);
      toast({
        title: "Clé copiée!",
        description: "La clé API a été copiée dans le presse-papier.",
      });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    setCopied(false);
    onOpenChange(false);
  };

  if (!keyData) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-green-500" />
            Clé API créée avec succès
          </DialogTitle>
          <DialogDescription>
            Voici votre nouvelle clé API pour "{keyData.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600">Important!</AlertTitle>
            <AlertDescription className="text-amber-600/90">
              Copiez cette clé maintenant. Vous ne pourrez plus la voir après avoir fermé
              cette fenêtre.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Votre clé API :</label>
            <div className="flex gap-2">
              <Input
                value={keyData.key}
                readOnly
                className="font-mono text-sm bg-muted"
              />
              <Button
                type="button"
                variant={copied ? "default" : "outline"}
                size="icon"
                onClick={copyToClipboard}
                className={copied ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Comment utiliser cette clé :</h4>
            <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`// Header HTTP requis
X-API-Key: ${keyData.key}

// Exemple avec fetch
fetch('${window.location.origin.replace('lovableproject.com', 'lovable.app')}/api/external/health', {
  headers: {
    'X-API-Key': '${keyData.key}',
    'Content-Type': 'application/json'
  }
})`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>
            {copied ? "Fermer" : "J'ai copié la clé, fermer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
