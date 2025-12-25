import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Percent,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { taxesService, type TaxAPI } from "@/services/api/taxes.service";

export interface Tax {
  id: string;
  name: string;
  code: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
  description: string;
  applicableOn: ("devis" | "ordres" | "factures")[];
  createdAt: string;
}

// Mapper API -> Local
const mapApiTaxToLocal = (tax: TaxAPI): Tax => ({
  id: String(tax.id),
  name: tax.name,
  code: tax.code,
  rate: tax.rate,
  isActive: tax.is_active,
  isDefault: tax.is_default,
  description: tax.description || "",
  applicableOn: (tax.applicable_on || []) as ("devis" | "ordres" | "factures")[],
  createdAt: tax.created_at,
});

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function Taxes() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [deletingTax, setDeletingTax] = useState<Tax | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    rate: "",
    description: "",
    isActive: true,
    isDefault: false,
    applicableDevis: true,
    applicableOrdres: true,
    applicableFactures: true,
  });

  // Charger les taxes depuis l'API
  const loadTaxes = async () => {
    try {
      setIsLoading(true);
      const data = await taxesService.getAll();
      setTaxes(data.map(mapApiTaxToLocal));
    } catch (error) {
      console.error("Erreur chargement taxes:", error);
      toast.error("Erreur lors du chargement des taxes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      rate: "",
      description: "",
      isActive: true,
      isDefault: false,
      applicableDevis: true,
      applicableOrdres: true,
      applicableFactures: true,
    });
    setEditingTax(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tax: Tax) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      code: tax.code,
      rate: tax.rate.toString(),
      description: tax.description,
      isActive: tax.isActive,
      isDefault: tax.isDefault,
      applicableDevis: tax.applicableOn.includes("devis"),
      applicableOrdres: tax.applicableOn.includes("ordres"),
      applicableFactures: tax.applicableOn.includes("factures"),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.rate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const applicableOn: string[] = [];
    if (formData.applicableDevis) applicableOn.push("devis");
    if (formData.applicableOrdres) applicableOn.push("ordres");
    if (formData.applicableFactures) applicableOn.push("factures");

    if (applicableOn.length === 0) {
      toast.error("La taxe doit être applicable sur au moins un type de document");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingTax) {
        // Update existing tax
        await taxesService.update(Number(editingTax.id), {
          name: formData.name,
          code: formData.code.toUpperCase(),
          rate: parseFloat(formData.rate),
          description: formData.description,
          is_active: formData.isActive,
          is_default: formData.isDefault,
          applicable_on: applicableOn,
        });
        toast.success(`La taxe "${formData.name}" a été mise à jour`);
      } else {
        // Create new tax
        await taxesService.create({
          name: formData.name,
          code: formData.code.toUpperCase(),
          rate: parseFloat(formData.rate),
          description: formData.description,
          is_active: formData.isActive,
          is_default: formData.isDefault,
          applicable_on: applicableOn,
        });
        toast.success(`La taxe "${formData.name}" a été créée`);
      }

      setIsDialogOpen(false);
      resetForm();
      loadTaxes();
    } catch (error) {
      console.error("Erreur sauvegarde taxe:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deletingTax) {
      try {
        await taxesService.delete(Number(deletingTax.id));
        toast.success(`La taxe "${deletingTax.name}" a été supprimée`);
        setIsDeleteDialogOpen(false);
        setDeletingTax(null);
        loadTaxes();
      } catch (error) {
        console.error("Erreur suppression taxe:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const toggleActive = async (tax: Tax) => {
    try {
      await taxesService.update(Number(tax.id), { is_active: !tax.isActive });
      toast.success(`La taxe "${tax.name}" a été ${tax.isActive ? "désactivée" : "activée"}`);
      loadTaxes();
    } catch (error) {
      console.error("Erreur toggle active:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const toggleDefault = async (tax: Tax) => {
    try {
      await taxesService.update(Number(tax.id), { is_default: !tax.isDefault });
      toast.success(`La taxe "${tax.name}" ${tax.isDefault ? "n'est plus appliquée par défaut" : "sera appliquée par défaut"}`);
      loadTaxes();
    } catch (error) {
      console.error("Erreur toggle default:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const activeTaxes = taxes.filter((t) => t.isActive);
  const defaultTaxes = taxes.filter((t) => t.isDefault && t.isActive);
  const totalDefaultRate = defaultTaxes.reduce((sum, t) => sum + t.rate, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Taxes
            </h1>
            <p className="text-muted-foreground mt-1">
              Configurez les taux de taxes applicables sur vos documents
            </p>
          </div>
          <Button variant="gradient" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle taxe
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total taxes</p>
                    <p className="text-2xl font-bold">{taxes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actives</p>
                    <p className="text-2xl font-bold">{activeTaxes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Par défaut</p>
                    <p className="text-2xl font-bold">{defaultTaxes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux total défaut</p>
                    <p className="text-2xl font-bold text-primary">{totalDefaultRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Box */}
        {defaultTaxes.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">Taxes par défaut actives</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Les taxes suivantes seront automatiquement appliquées aux nouveaux documents:{" "}
                      {defaultTaxes.map((t) => `${t.name} (${t.rate}%)`).join(", ")} = {totalDefaultRate}% total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Taxes Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Liste des taxes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : taxes.length === 0 ? (
              <div className="text-center py-12">
                <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune taxe configurée</h3>
                <p className="text-muted-foreground mt-1">Ajoutez votre première taxe</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Taxe</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Applicable sur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.map((tax, index) => (
                  <motion.tr
                    key={tax.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          tax.isActive ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <Percent className={`h-5 w-5 ${tax.isActive ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="font-medium">{tax.name}</p>
                          <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {tax.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
                        {tax.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className={`text-2xl font-bold ${tax.isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {tax.rate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tax.applicableOn.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type === "devis" ? "Devis" : type === "ordres" ? "Ordres" : "Factures"}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={
                            tax.isActive
                              ? "bg-success/20 text-success"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {tax.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {tax.isDefault && tax.isActive && (
                          <Badge variant="outline" className="text-xs border-primary text-primary">
                            Par défaut
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(tax)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(tax)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {tax.isActive ? "Désactiver" : "Activer"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleDefault(tax)}>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {tax.isDefault ? "Retirer des défauts" : "Définir par défaut"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingTax(tax);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingTax ? "Modifier la taxe" : "Nouvelle taxe"}
              </DialogTitle>
              <DialogDescription>
                {editingTax
                  ? "Modifiez les informations de la taxe"
                  : "Créez une nouvelle taxe à appliquer sur vos documents"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de la taxe *</Label>
                  <Input
                    placeholder="TVA Standard"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    placeholder="TVA18"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Taux (%) *</Label>
                <Input
                  type="number"
                  placeholder="18"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Description de la taxe..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium">Applicable sur</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="applicable-devis"
                      checked={formData.applicableDevis}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, applicableDevis: checked })
                      }
                    />
                    <Label htmlFor="applicable-devis" className="text-sm">Devis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="applicable-ordres"
                      checked={formData.applicableOrdres}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, applicableOrdres: checked })
                      }
                    />
                    <Label htmlFor="applicable-ordres" className="text-sm">Ordres</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="applicable-factures"
                      checked={formData.applicableFactures}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, applicableFactures: checked })
                      }
                    />
                    <Label htmlFor="applicable-factures" className="text-sm">Factures</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-3">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="active">Taxe active</Label>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3">
                        <Switch
                          id="defaultTax"
                          checked={formData.isDefault}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isDefault: checked })
                          }
                        />
                        <Label htmlFor="defaultTax">Par défaut</Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cette taxe sera automatiquement sélectionnée<br />lors de la création de nouveaux documents</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="gradient" onClick={handleSave}>
                {editingTax ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la taxe ?</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la taxe "{deletingTax?.name}" ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
