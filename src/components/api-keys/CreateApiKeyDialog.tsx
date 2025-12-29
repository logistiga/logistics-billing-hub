import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiKeysService, CreateApiKeyData } from "@/services/api/api-keys.service";

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: (data: { key: string; name: string }) => void;
}

const defaultPermissions = [
  { key: "clients:read", label: "Lire les clients" },
  { key: "clients:write", label: "Créer/modifier les clients" },
  { key: "ordres:read", label: "Lire les ordres de travail" },
  { key: "ordres:write", label: "Créer/modifier les ordres de travail" },
  { key: "ordres:status", label: "Modifier le statut des OT" },
  { key: "invoices:read", label: "Lire les factures" },
  { key: "invoices:write", label: "Créer/modifier les factures" },
];

export const CreateApiKeyDialog = ({
  open,
  onOpenChange,
  onKeyCreated,
}: CreateApiKeyDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rateLimit, setRateLimit] = useState(60);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["*"]);
  const [fullAccess, setFullAccess] = useState(true);

  const createMutation = useMutation({
    mutationFn: (data: CreateApiKeyData) => apiKeysService.create(data),
    onSuccess: (data) => {
      onKeyCreated({ key: data.key, name: data.name });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer la clé API.",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setRateLimit(60);
    setExpiresAt(undefined);
    setSelectedPermissions(["*"]);
    setFullAccess(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Nom requis",
        description: "Veuillez donner un nom à cette clé API.",
      });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      rate_limit: rateLimit,
      expires_at: expiresAt?.toISOString(),
      permissions: fullAccess ? ["*"] : selectedPermissions,
    });
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une clé API</DialogTitle>
            <DialogDescription>
              Générez une nouvelle clé pour permettre l'accès à l'API externe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la clé *</Label>
              <Input
                id="name"
                placeholder="Ex: Application mobile, Partenaire X..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de l'utilisation de cette clé..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rateLimit">Limite de requêtes/min</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  min={1}
                  max={1000}
                  value={rateLimit}
                  onChange={(e) => setRateLimit(parseInt(e.target.value) || 60)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date d'expiration</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt ? format(expiresAt, "PPP", { locale: fr }) : "Jamais"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiresAt}
                      onSelect={setExpiresAt}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fullAccess"
                  checked={fullAccess}
                  onCheckedChange={(checked) => {
                    setFullAccess(!!checked);
                    if (checked) {
                      setSelectedPermissions(["*"]);
                    } else {
                      setSelectedPermissions([]);
                    }
                  }}
                />
                <label
                  htmlFor="fullAccess"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Accès complet (toutes les permissions)
                </label>
              </div>

              {!fullAccess && (
                <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                  {defaultPermissions.map((perm) => (
                    <div key={perm.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={perm.key}
                        checked={selectedPermissions.includes(perm.key)}
                        onCheckedChange={() => togglePermission(perm.key)}
                      />
                      <label
                        htmlFor={perm.key}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {perm.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Générer la clé
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
