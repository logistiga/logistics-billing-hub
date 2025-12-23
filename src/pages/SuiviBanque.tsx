import { useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  Plus,
  Minus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Building,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportDialog } from "@/components/ExportDialog";
import { generateExportPDF, generateExportExcel } from "@/lib/exportComptabilite";

interface TransactionBanque {
  id: string;
  date: string;
  dateValeur?: string;
  type: "entree" | "sortie";
  categorie: string;
  description: string;
  reference: string;
  montant: number;
  modePaiement: "virement" | "cheque" | "carte" | "prelevement";
  banque: string;
  compteBancaire: string;
  client?: string;
  facture?: string;
  statut: "en_attente" | "valide" | "rapproche" | "rejete";
  createdBy: string;
}

const banques = [
  { id: "bgfi", nom: "BGFI Bank", compte: "40003 04140 4104165087118" },
  { id: "ugb", nom: "UGB", compte: "40002 00043 9000330B81 84" },
];

const mockTransactions: TransactionBanque[] = [
  {
    id: "1",
    date: "2024-01-15",
    dateValeur: "2024-01-16",
    type: "entree",
    categorie: "Paiement facture",
    description: "Virement reçu - Règlement FAC-2024-001",
    reference: "VIR-001",
    montant: 5500000,
    modePaiement: "virement",
    banque: "BGFI Bank",
    compteBancaire: "40003 04140 4104165087118",
    client: "Total Gabon",
    facture: "FAC-2024-001",
    statut: "rapproche",
    createdBy: "Admin",
  },
  {
    id: "2",
    date: "2024-01-14",
    dateValeur: "2024-01-14",
    type: "sortie",
    categorie: "Salaires",
    description: "Virement salaires - Janvier 2024",
    reference: "VIR-002",
    montant: 8500000,
    modePaiement: "virement",
    banque: "BGFI Bank",
    compteBancaire: "40003 04140 4104165087118",
    statut: "valide",
    createdBy: "Comptable",
  },
  {
    id: "3",
    date: "2024-01-13",
    type: "entree",
    categorie: "Paiement facture",
    description: "Chèque encaissé - Comilog",
    reference: "CHQ-001",
    montant: 3200000,
    modePaiement: "cheque",
    banque: "UGB",
    compteBancaire: "40002 00043 9000330B81 84",
    client: "Comilog",
    statut: "en_attente",
    createdBy: "Admin",
  },
  {
    id: "4",
    date: "2024-01-12",
    dateValeur: "2024-01-12",
    type: "sortie",
    categorie: "Fournisseur",
    description: "Paiement fournisseur pièces détachées",
    reference: "VIR-003",
    montant: 1850000,
    modePaiement: "virement",
    banque: "BGFI Bank",
    compteBancaire: "40003 04140 4104165087118",
    statut: "rapproche",
    createdBy: "Comptable",
  },
  {
    id: "5",
    date: "2024-01-11",
    type: "sortie",
    categorie: "Charges",
    description: "Prélèvement assurance véhicules",
    reference: "PRE-001",
    montant: 450000,
    modePaiement: "prelevement",
    banque: "BGFI Bank",
    compteBancaire: "40003 04140 4104165087118",
    statut: "valide",
    createdBy: "Système",
  },
  {
    id: "6",
    date: "2024-01-10",
    dateValeur: "2024-01-11",
    type: "entree",
    categorie: "Paiement facture",
    description: "Virement reçu - Assala Energy",
    reference: "VIR-004",
    montant: 2750000,
    modePaiement: "virement",
    banque: "UGB",
    compteBancaire: "40002 00043 9000330B81 84",
    client: "Assala Energy",
    facture: "FAC-2024-005",
    statut: "rapproche",
    createdBy: "Admin",
  },
  {
    id: "7",
    date: "2024-01-09",
    type: "sortie",
    categorie: "Impôts",
    description: "Paiement TVA - Décembre 2023",
    reference: "VIR-005",
    montant: 1200000,
    modePaiement: "virement",
    banque: "BGFI Bank",
    compteBancaire: "40003 04140 4104165087118",
    statut: "valide",
    createdBy: "Comptable",
  },
];

const categoriesEntree = [
  "Paiement facture",
  "Remboursement",
  "Subvention",
  "Intérêts",
  "Autre",
];

const categoriesSortie = [
  "Salaires",
  "Fournisseur",
  "Charges",
  "Impôts",
  "Loyer",
  "Assurance",
  "Autre",
];

const modesPaiement = [
  { value: "virement", label: "Virement", icon: ArrowUpRight },
  { value: "cheque", label: "Chèque", icon: Receipt },
  { value: "carte", label: "Carte bancaire", icon: CreditCard },
  { value: "prelevement", label: "Prélèvement", icon: RefreshCw },
];

const statutConfig: Record<string, { label: string; color: string; icon: any }> = {
  en_attente: { label: "En attente", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  valide: { label: "Validé", color: "bg-blue-500/10 text-blue-500", icon: CheckCircle2 },
  rapproche: { label: "Rapproché", color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  rejete: { label: "Rejeté", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

export default function SuiviBanque() {
  const [transactions, setTransactions] = useState<TransactionBanque[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "entree" | "sortie">("all");
  const [filterBanque, setFilterBanque] = useState("all");
  const [filterStatut, setFilterStatut] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"entree" | "sortie">("entree");
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    categorie: "",
    description: "",
    montant: "",
    modePaiement: "virement" as TransactionBanque["modePaiement"],
    banque: "bgfi",
    client: "",
    facture: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculs par banque
  const getSoldeBanque = (banqueId: string) => {
    const banqueTransactions = transactions.filter(
      (t) => t.banque === banques.find((b) => b.id === banqueId)?.nom
    );
    const entrees = banqueTransactions
      .filter((t) => t.type === "entree")
      .reduce((sum, t) => sum + t.montant, 0);
    const sorties = banqueTransactions
      .filter((t) => t.type === "sortie")
      .reduce((sum, t) => sum + t.montant, 0);
    return entrees - sorties;
  };

  const totalEntrees = transactions
    .filter((t) => t.type === "entree")
    .reduce((sum, t) => sum + t.montant, 0);

  const totalSorties = transactions
    .filter((t) => t.type === "sortie")
    .reduce((sum, t) => sum + t.montant, 0);

  const soldeTotalBanque = totalEntrees - totalSorties;

  const enAttente = transactions.filter((t) => t.statut === "en_attente").length;

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesBanque = filterBanque === "all" || t.banque === banques.find((b) => b.id === filterBanque)?.nom;
    const matchesStatut = filterStatut === "all" || t.statut === filterStatut;
    return matchesSearch && matchesType && matchesBanque && matchesStatut;
  });

  const handleSubmit = () => {
    const selectedBanque = banques.find((b) => b.id === formData.banque);
    const newTransaction: TransactionBanque = {
      id: Date.now().toString(),
      date: formData.date,
      type: transactionType,
      categorie: formData.categorie,
      description: formData.description,
      reference: `${formData.modePaiement === "cheque" ? "CHQ" : formData.modePaiement === "virement" ? "VIR" : "PRE"}-${String(transactions.length + 1).padStart(3, "0")}`,
      montant: parseFloat(formData.montant) || 0,
      modePaiement: formData.modePaiement,
      banque: selectedBanque?.nom || "",
      compteBancaire: selectedBanque?.compte || "",
      client: formData.client || undefined,
      facture: formData.facture || undefined,
      statut: "en_attente",
      createdBy: "Admin",
    };

    setTransactions([newTransaction, ...transactions]);
    setDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      categorie: "",
      description: "",
      montant: "",
      modePaiement: "virement",
      banque: "bgfi",
      client: "",
      facture: "",
    });
  };

  const openDialog = (type: "entree" | "sortie") => {
    setTransactionType(type);
    setFormData({ ...formData, categorie: "" });
    setDialogOpen(true);
  };

  const handleExport = (format: "pdf" | "excel", dateDebut: string, dateFin: string) => {
    const filteredByDate = transactions.filter((t) => {
      return t.date >= dateDebut && t.date <= dateFin;
    });

    const totaux = {
      entrees: filteredByDate.filter((t) => t.type === "entree").reduce((sum, t) => sum + t.montant, 0),
      sorties: filteredByDate.filter((t) => t.type === "sortie").reduce((sum, t) => sum + t.montant, 0),
      solde: 0,
    };
    totaux.solde = totaux.entrees - totaux.sorties;

    const exportTransactions = filteredByDate.map((t) => ({
      date: t.date,
      reference: t.reference,
      description: t.description,
      categorie: t.categorie,
      type: t.type,
      montant: t.montant,
      client: t.client,
      modePaiement: t.modePaiement,
      banque: t.banque,
    }));

    const options = {
      titre: "Journal Bancaire",
      sousTitre: "Transactions bancaires (virements, chèques, cartes)",
      periodeDebut: dateDebut,
      periodeFin: dateFin,
      transactions: exportTransactions,
      totaux,
      type: "banque" as const,
    };

    if (format === "pdf") {
      generateExportPDF(options);
    } else {
      generateExportExcel(options);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Landmark className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Suivi Banque</h1>
              <p className="text-muted-foreground">
                Gestion des transactions bancaires (virements, chèques, cartes)
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => openDialog("entree")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Encaissement
          </Button>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => openDialog("sortie")}
          >
            <Minus className="h-4 w-4 mr-2" />
            Décaissement
          </Button>
        </div>
      </div>

      {/* Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Solde Total Banques</p>
                  <p className={`text-xl font-bold ${soldeTotalBanque >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                    {formatCurrency(soldeTotalBanque)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Building className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {banques.map((banque, index) => (
          <motion.div
            key={banque.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{banque.nom}</p>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className={`text-lg font-bold ${getSoldeBanque(banque.id) >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                    {formatCurrency(getSoldeBanque(banque.id))}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {banque.compte}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold text-amber-500">{enAttente}</p>
                  <p className="text-xs text-muted-foreground">À rapprocher</p>
                </div>
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-500" />
              Journal Bancaire
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterBanque} onValueChange={setFilterBanque}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Banque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {banques.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="entree">Entrées</SelectItem>
                  <SelectItem value="sortie">Sorties</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="valide">Validé</SelectItem>
                  <SelectItem value="rapproche">Rapproché</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const statut = statutConfig[transaction.statut];
                  return (
                    <TableRow key={transaction.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div>
                          <p>{formatDate(transaction.date)}</p>
                          {transaction.dateValeur && (
                            <p className="text-xs text-muted-foreground">
                              Valeur: {formatDate(transaction.dateValeur)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {transaction.reference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="truncate">{transaction.description}</p>
                          {transaction.client && (
                            <p className="text-xs text-muted-foreground">
                              Client: {transaction.client}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {transaction.banque}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {modesPaiement.find((m) => m.value === transaction.modePaiement)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statut.color}>
                          <statut.icon className="h-3 w-3 mr-1" />
                          {statut.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold ${
                            transaction.type === "entree"
                              ? "text-emerald-500"
                              : "text-destructive"
                          }`}
                        >
                          {transaction.type === "entree" ? "+" : "-"}{" "}
                          {formatCurrency(transaction.montant)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Rapprocher
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune transaction trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {transactionType === "entree" ? (
                <>
                  <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
                  <span>Nouvel encaissement bancaire</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                  <span>Nouveau décaissement bancaire</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Enregistrer une {transactionType === "entree" ? "entrée" : "sortie"} bancaire
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Montant (FCFA)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banque</Label>
                <Select
                  value={formData.banque}
                  onValueChange={(value) => setFormData({ ...formData, banque: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {banques.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select
                  value={formData.modePaiement}
                  onValueChange={(value: TransactionBanque["modePaiement"]) =>
                    setFormData({ ...formData, modePaiement: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modesPaiement.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) => setFormData({ ...formData, categorie: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {(transactionType === "entree" ? categoriesEntree : categoriesSortie).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {transactionType === "entree" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client (optionnel)</Label>
                  <Input
                    placeholder="Nom du client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>N° Facture</Label>
                  <Input
                    placeholder="FAC-2024-XXX"
                    value={formData.facture}
                    onChange={(e) => setFormData({ ...formData, facture: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className={transactionType === "entree" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              variant={transactionType === "sortie" ? "destructive" : "default"}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
        title="Journal Bancaire"
      />
    </div>
  );
}
