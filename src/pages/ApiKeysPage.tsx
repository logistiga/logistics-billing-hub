import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreHorizontal, Copy, Trash2, RefreshCw, Eye, EyeOff, Key, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiKeysService, ApiKey } from "@/services/api/api-keys.service";
import { CreateApiKeyDialog } from "@/components/api-keys/CreateApiKeyDialog";
import { ApiKeyDisplayDialog } from "@/components/api-keys/ApiKeyDisplayDialog";
import { Link } from "react-router-dom";

const ApiKeysPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [keyToRegenerate, setKeyToRegenerate] = useState<ApiKey | null>(null);
  const [newKeyData, setNewKeyData] = useState<{ key: string; name: string } | null>(null);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeysService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiKeysService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({
        title: "Clé API révoquée",
        description: "La clé API a été révoquée avec succès.",
      });
      setKeyToDelete(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de révoquer la clé API.",
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (id: number) => apiKeysService.regenerate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setNewKeyData({ key: data.key, name: data.name });
      setKeyToRegenerate(null);
      toast({
        title: "Clé API régénérée",
        description: "Une nouvelle clé a été générée. Copiez-la maintenant!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de régénérer la clé API.",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiKeysService.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la clé API a été mis à jour.",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié!",
      description: "Clé copiée dans le presse-papier.",
    });
  };

  const handleKeyCreated = (data: { key: string; name: string }) => {
    setNewKeyData(data);
    queryClient.invalidateQueries({ queryKey: ["api-keys"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clés API</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les clés d'accès pour l'API externe
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/api-docs">
              <ExternalLink className="h-4 w-4 mr-2" />
              Documentation API
            </Link>
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle clé
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Clés API actives
          </CardTitle>
          <CardDescription>
            Ces clés permettent à des applications externes d'accéder à votre API.
            Gardez-les secrètes!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Clé</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Dernière utilisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.name}</div>
                        {key.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {key.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {key.display_key}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions?.includes("*") ? (
                          <Badge variant="secondary">Accès complet</Badge>
                        ) : key.permissions?.slice(0, 2).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {key.permissions && key.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.last_used_at ? (
                        <div className="text-sm">
                          <div>
                            {formatDistanceToNow(new Date(key.last_used_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </div>
                          {key.last_used_ip && (
                            <div className="text-xs text-muted-foreground">
                              {key.last_used_ip}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Jamais</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {key.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {key.expires_at && new Date(key.expires_at) < new Date() && (
                        <Badge variant="destructive" className="ml-1">
                          Expirée
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(key.prefix)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copier le préfixe
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleActiveMutation.mutate({
                                id: key.id,
                                is_active: !key.is_active,
                              })
                            }
                          >
                            {key.is_active ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setKeyToRegenerate(key)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Régénérer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setKeyToDelete(key)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Révoquer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Aucune clé API</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Créez une clé pour permettre l'accès à votre API
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une clé
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateApiKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onKeyCreated={handleKeyCreated}
      />

      {/* Display new key */}
      <ApiKeyDisplayDialog
        open={!!newKeyData}
        onOpenChange={() => setNewKeyData(null)}
        keyData={newKeyData}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer cette clé API?</AlertDialogTitle>
            <AlertDialogDescription>
              La clé "{keyToDelete?.name}" sera définitivement révoquée. Les applications
              utilisant cette clé ne pourront plus accéder à l'API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => keyToDelete && deleteMutation.mutate(keyToDelete.id)}
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate confirmation */}
      <AlertDialog open={!!keyToRegenerate} onOpenChange={() => setKeyToRegenerate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer cette clé API?</AlertDialogTitle>
            <AlertDialogDescription>
              Une nouvelle clé sera générée pour "{keyToRegenerate?.name}". L'ancienne clé
              cessera de fonctionner immédiatement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToRegenerate && regenerateMutation.mutate(keyToRegenerate.id)}
            >
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApiKeysPage;
