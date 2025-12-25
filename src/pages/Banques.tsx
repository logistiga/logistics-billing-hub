import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Landmark,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Building2,
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

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  isDefault: boolean;
}

// Données vides - à remplacer par les données de la base de données
const mockBanks: BankAccount[] = [];

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

export default function Banques() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                  <Input placeholder="BGFI Bank Gabon" />
                </div>
                <div className="space-y-2">
                  <Label>Titulaire du compte *</Label>
                  <Input placeholder="LOGISTICA SARL" />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de compte *</Label>
                  <Input placeholder="0001 0000 1234 5678 90" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input placeholder="GA21 0001..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Code SWIFT</Label>
                    <Input placeholder="BGFIGALIB" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch id="default" />
                  <Label htmlFor="default">Compte par défaut</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="gradient" onClick={() => setIsDialogOpen(false)}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banks Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {mockBanks.map((bank) => (
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
                        <DropdownMenuItem className="text-destructive">
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
                        {bank.iban}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SWIFT</span>
                      <span className="font-mono font-medium">{bank.swift}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}
