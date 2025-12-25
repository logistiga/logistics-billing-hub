import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  CreditCard,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  Percent,
  Clock,
  CheckCircle2,
  Filter,
  CalendarClock,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Credit {
  id: string;
  bank: string;
  reference: string;
  capitalInitial: number;
  capitalRestant: number;
  tauxInteret: number;
  mensualite: number;
  dateDebut: string;
  dateFin: string;
  dureeTotal: number;
  echeancesPayees: number;
  status: "active" | "overdue" | "completed" | "suspended";
  prochainPaiement: string;
  objetCredit: string;
}

interface Payment {
  id: string;
  creditId: string;
  creditRef: string;
  bank: string;
  date: string;
  montant: number;
  capital: number;
  interet: number;
  status: "paid" | "pending" | "overdue";
  echeance: number;
}

const mockCredits: Credit[] = [];

const mockPayments: Payment[] = [];

const statusConfig = {
  active: {
    label: "Actif",
    class: "bg-success/20 text-success",
    icon: CheckCircle2,
  },
  overdue: {
    label: "En retard",
    class: "bg-destructive/20 text-destructive",
    icon: AlertTriangle,
  },
  completed: {
    label: "Terminé",
    class: "bg-muted text-muted-foreground",
    icon: CheckCircle2,
  },
  suspended: {
    label: "Suspendu",
    class: "bg-warning/20 text-warning",
    icon: Clock,
  },
};

const paymentStatusConfig = {
  paid: {
    label: "Payé",
    class: "bg-success/20 text-success",
  },
  pending: {
    label: "En attente",
    class: "bg-warning/20 text-warning",
  },
  overdue: {
    label: "En retard",
    class: "bg-destructive/20 text-destructive",
  },
};

export default function CreditBancaire() {
  const [searchTerm, setSearchTerm] = useState("");
  const [credits, setCredits] = useState<Credit[]>(mockCredits);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredCredits = credits.filter((credit) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      credit.bank.toLowerCase().includes(searchLower) ||
      credit.reference.toLowerCase().includes(searchLower) ||
      credit.objetCredit.toLowerCase().includes(searchLower)
    );
  });

  // Calculs statistiques
  const totalCapital = credits.reduce((sum, c) => sum + c.capitalInitial, 0);
  const totalRestant = credits.reduce((sum, c) => sum + c.capitalRestant, 0);
  const totalMensualites = credits.reduce((sum, c) => sum + c.mensualite, 0);
  const overdueCount = credits.filter((c) => c.status === "overdue").length;

  // Fonction pour parser les dates au format DD/MM/YYYY
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Calcul des alertes
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingPayments = credits.filter((credit) => {
    const paymentDate = parseDate(credit.prochainPaiement);
    return paymentDate >= today && paymentDate <= in7Days && credit.status !== "completed";
  });

  const overduePayments = mockPayments.filter((payment) => payment.status === "overdue");

  const handleViewDetails = (credit: Credit) => {
    setSelectedCredit(credit);
    setViewDialogOpen(true);
  };

  const handleDeleteCredit = (credit: Credit) => {
    setSelectedCredit(credit);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCredit) {
      setCredits(credits.filter((c) => c.id !== selectedCredit.id));
      toast.success(`Crédit ${selectedCredit.reference} supprimé`);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Crédits Bancaires
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestion des emprunts bancaires et échéanciers
            </p>
          </div>
          <Button variant="gradient" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau crédit
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Capital Total
                </CardTitle>
                <CreditCard className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCapital)} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  {credits.length} crédit{credits.length > 1 ? "s" : ""} actif{credits.length > 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reste à Payer
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalRestant)} FCFA
                </div>
                <p className="text-xs text-muted-foreground">
                  {((totalRestant / totalCapital) * 100).toFixed(1)}% du capital
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-success">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mensualités
                </CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(totalMensualites)} FCFA
                </div>
                <p className="text-xs text-muted-foreground">Total par mois</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En Retard
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{overdueCount}</div>
                <p className="text-xs text-muted-foreground">Paiements en retard</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Section Alertes */}
        {(overduePayments.length > 0 || upcomingPayments.length > 0) && (
          <div className="space-y-3">
            {overduePayments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Paiements en retard</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1">
                      {overduePayments.map((payment) => (
                        <li key={payment.id} className="flex items-center justify-between text-sm">
                          <span>
                            <span className="font-mono font-medium">{payment.creditRef}</span>
                            <span className="text-muted-foreground"> - {payment.bank}</span>
                            <span className="text-muted-foreground"> (Échéance #{payment.echeance})</span>
                          </span>
                          <span className="font-semibold">{formatCurrency(payment.montant)} FCFA</span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {upcomingPayments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Alert className="border-warning/50 bg-warning/10">
                  <CalendarClock className="h-4 w-4 text-warning" />
                  <AlertTitle className="font-semibold text-warning">Paiements à venir (7 jours)</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1">
                      {upcomingPayments.map((credit) => (
                        <li key={credit.id} className="flex items-center justify-between text-sm">
                          <span>
                            <span className="font-mono font-medium">{credit.reference}</span>
                            <span className="text-muted-foreground"> - {credit.bank}</span>
                            <span className="text-muted-foreground"> (le {credit.prochainPaiement})</span>
                          </span>
                          <span className="font-semibold">{formatCurrency(credit.mensualite)} FCFA</span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>
        )}

        {/* Barre de recherche */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par banque, référence ou objet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline" className="text-primary border-primary h-10 flex items-center px-4">
            {filteredCredits.length} résultat{filteredCredits.length > 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="credits" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Crédits Actifs
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Historique Paiements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="space-y-4 mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Référence</TableHead>
                      <TableHead>Banque</TableHead>
                      <TableHead>Objet</TableHead>
                      <TableHead className="text-right">Capital</TableHead>
                      <TableHead className="text-right">Reste</TableHead>
                      <TableHead className="text-center">Progression</TableHead>
                      <TableHead className="text-right">Mensualité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCredits.map((credit, index) => {
                      const status = statusConfig[credit.status];
                      const StatusIcon = status.icon;
                      const progression = ((credit.dureeTotal - (credit.dureeTotal - credit.echeancesPayees)) / credit.dureeTotal) * 100;
                      
                      return (
                        <motion.tr
                          key={credit.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-muted/50"
                        >
                          <TableCell className="font-medium font-mono">
                            {credit.reference}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {credit.bank}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {credit.objetCredit}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(credit.capitalInitial)}
                          </TableCell>
                          <TableCell className="text-right text-destructive font-medium">
                            {formatCurrency(credit.capitalRestant)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={progression} className="h-2 w-20" />
                              <span className="text-xs text-muted-foreground">
                                {credit.echeancesPayees}/{credit.dureeTotal}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(credit.mensualite)}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.class}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleViewDetails(credit)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Voir échéancier</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Modifier</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteCredit(credit)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Supprimer</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Crédit</TableHead>
                      <TableHead>Banque</TableHead>
                      <TableHead className="text-center">Échéance</TableHead>
                      <TableHead className="text-right">Capital</TableHead>
                      <TableHead className="text-right">Intérêts</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayments.map((payment, index) => {
                      const status = paymentStatusConfig[payment.status];
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-muted/50"
                        >
                          <TableCell className="text-muted-foreground">
                            {payment.date}
                          </TableCell>
                          <TableCell className="font-mono font-medium">
                            {payment.creditRef}
                          </TableCell>
                          <TableCell>{payment.bank}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">#{payment.echeance}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(payment.capital)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(payment.interet)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(payment.montant)}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.class}>{status.label}</Badge>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Détails du crédit {selectedCredit?.reference}
            </DialogTitle>
            <DialogDescription>
              Informations complètes et échéancier du crédit
            </DialogDescription>
          </DialogHeader>
          {selectedCredit && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Banque</Label>
                  <p className="font-medium">{selectedCredit.bank}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Objet</Label>
                  <p className="font-medium">{selectedCredit.objetCredit}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Capital initial</Label>
                  <p className="font-medium">{formatCurrency(selectedCredit.capitalInitial)} FCFA</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Capital restant</Label>
                  <p className="font-medium text-destructive">{formatCurrency(selectedCredit.capitalRestant)} FCFA</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Taux d'intérêt</Label>
                  <p className="font-medium">{selectedCredit.tauxInteret}%</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mensualité</Label>
                  <p className="font-medium">{formatCurrency(selectedCredit.mensualite)} FCFA</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Période</Label>
                  <p className="font-medium">{selectedCredit.dateDebut} → {selectedCredit.dateFin}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Échéances</Label>
                  <p className="font-medium">{selectedCredit.echeancesPayees} / {selectedCredit.dureeTotal} payées</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Progression du remboursement</Label>
                <Progress 
                  value={(selectedCredit.echeancesPayees / selectedCredit.dureeTotal) * 100} 
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground text-right">
                  {((selectedCredit.echeancesPayees / selectedCredit.dureeTotal) * 100).toFixed(1)}% remboursé
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Prochain paiement:</span>
                  <span>{selectedCredit.prochainPaiement}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-semibold text-primary">{formatCurrency(selectedCredit.mensualite)} FCFA</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
            <Button variant="gradient">
              <DollarSign className="h-4 w-4 mr-2" />
              Enregistrer paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau crédit bancaire</DialogTitle>
            <DialogDescription>
              Enregistrez un nouveau crédit avec son échéancier
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Banque *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bgfi">BGFI Bank</SelectItem>
                  <SelectItem value="uba">UBA Gabon</SelectItem>
                  <SelectItem value="orabank">Orabank</SelectItem>
                  <SelectItem value="ecobank">Ecobank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objet du crédit *</Label>
              <Input placeholder="Ex: Acquisition véhicules" />
            </div>
            <div className="space-y-2">
              <Label>Capital emprunté (FCFA) *</Label>
              <Input type="number" placeholder="100000000" />
            </div>
            <div className="space-y-2">
              <Label>Taux d'intérêt (%) *</Label>
              <Input type="number" step="0.1" placeholder="8.5" />
            </div>
            <div className="space-y-2">
              <Label>Durée (mois) *</Label>
              <Input type="number" placeholder="60" />
            </div>
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="gradient" onClick={() => {
              toast.success("Crédit créé avec succès");
              setCreateDialogOpen(false);
            }}>
              Créer le crédit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Supprimer le crédit
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le crédit {selectedCredit?.reference} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
