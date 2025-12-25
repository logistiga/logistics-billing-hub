import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Landmark,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Building2,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { banquesService } from "@/services/api/banques.service";
import { toast } from "sonner";
import type { Banque } from "@/services/api/types";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  isDefault: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Mapper les données API vers le format local
const mapApiBankToLocal = (bank: Banque): BankAccount => ({
  id: String(bank.id),
  bankName: bank.name,
  accountName: bank.name,
  accountNumber: bank.account_number,
  iban: bank.iban || "",
  swift: bank.swift || "",
  isDefault: bank.is_default || false,
});

export default function Banques() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    iban: "",
    swift: "",
    isDefault: false,
  });

  // Charger les banques depuis l'API
  const loadBanks = async () => {
    try {
      setIsLoading(true);
      const data = await banquesService.getAll();
      setBanks(data.map(mapApiBankToLocal));
    } catch (error) {
      console.error("Erreur chargement banques:", error);
      toast.error("Erreur lors du chargement des banques");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  // Créer une nouvelle banque
  const handleCreate = async () => {
    if (!formData.bankName || !formData.accountNumber) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await banquesService.create({
        name: formData.bankName,
        account_number: formData.accountNumber,
        iban: formData.iban || undefined,
        swift: formData.swift || undefined,
      });
      toast.success("Compte bancaire créé avec succès");
      setIsDialogOpen(false);
      setFormData({ bankName: "", accountNumber: "", iban: "", swift: "", isDefault: false });
      loadBanks();
    } catch (error) {
      console.error("Erreur création banque:", error);
      toast.error("Erreur lors de la création du compte");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer une banque
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) return;
    
    try {
      await banquesService.delete(Number(id));
      toast.success("Compte supprimé avec succès");
      loadBanks();
    } catch (error) {
      console.error("Erreur suppression banque:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Comptes bancaires
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos comptes bancaires pour les paiements
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau compte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Nouveau compte bancaire
                </DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau compte bancaire
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom de la banque *</Label>
                  <Input 
                    placeholder="BGFI Bank Gabon" 
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de compte *</Label>
                  <Input 
                    placeholder="0001 0000 1234 5678 90" 
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input 
                      placeholder="GA21 0001..." 
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code SWIFT</Label>
                    <Input 
                      placeholder="BGFIGALIB" 
                      value={formData.swift}
                      onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch 
                    id="default" 
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                  />
                  <Label htmlFor="default">Compte par défaut</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="gradient" onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banks Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : banks.length === 0 ? (
          <Card className="p-12 text-center">
            <Landmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucun compte bancaire</h3>
            <p className="text-muted-foreground mt-1">Ajoutez votre premier compte bancaire</p>
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {banks.map((bank) => (
              <motion.div key={bank.id} variants={itemVariants}>
                <Card className="hover-lift cursor-pointer border-border/50 group relative">
                  {bank.isDefault && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Par défaut
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Landmark className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {bank.bankName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {bank.accountName}
                        </p>
                      </div>
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Définir par défaut
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(bank.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">N° Compte</span>
                        <span className="font-mono font-medium">
                          {bank.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IBAN</span>
                        <span className="font-mono text-xs truncate max-w-[180px]">
                          {bank.iban || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SWIFT</span>
                        <span className="font-mono font-medium">{bank.swift || "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
