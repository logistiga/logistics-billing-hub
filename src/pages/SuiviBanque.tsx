import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  Plus,
  Minus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
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
  FileUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import { ExportBanqueDialog } from "@/components/ExportBanqueDialog";
import RapprochementBancaire from "@/components/RapprochementBancaire";
import { generateExportPDF, generateExportExcel } from "@/lib/exportComptabilite";
import { toast } from "sonner";

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

// Données vides - à remplacer par les données de la base de données
const banques = [
  { id: "bgfi", nom: "BGFI Bank", compte: "" },
  { id: "ugb", nom: "UGB", compte: "" },
];
const mockTransactions: TransactionBanque[] = [];

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
  { value: "virement", label: "Virement", icon: ArrowUpRight, color: "bg-mode-virement/15 text-mode-virement border-mode-virement/30" },
  { value: "cheque", label: "Chèque", icon: Receipt, color: "bg-mode-cheque/15 text-mode-cheque border-mode-cheque/30" },
  { value: "carte", label: "Carte", icon: CreditCard, color: "bg-mode-carte/15 text-mode-carte border-mode-carte/30" },
  { value: "prelevement", label: "Prélèvement", icon: RefreshCw, color: "bg-mode-prelevement/15 text-mode-prelevement border-mode-prelevement/30" },
];

const statutConfig: Record<string, { label: string; color: string; icon: any }> = {
  en_attente: { label: "En attente", color: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  valide: { label: "Validé", color: "bg-info/15 text-info border-info/30", icon: CheckCircle2 },
  rapproche: { label: "Rapproché", color: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  rejete: { label: "Rejeté", color: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertCircle },
};

export default function SuiviBanque() {
  const [transactions, setTransactions] = useState<TransactionBanque[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "entree" | "sortie">("all");
  const [filterBanque, setFilterBanque] = useState("all");
  const [filterStatut, setFilterStatut] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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

  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesBanque = filterBanque === "all" || t.banque === banques.find((b) => b.id === filterBanque)?.nom;
      const matchesStatut = filterStatut === "all" || t.statut === filterStatut;
      return matchesSearch && matchesType && matchesBanque && matchesStatut;
    });
    
    // Tri par date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [transactions, searchTerm, filterType, filterBanque, filterStatut, sortOrder]);

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

  const handleExport = (format: "pdf" | "excel", dateDebut: string, dateFin: string, selectedBanques: string[]) => {
    // Filtrer par banques sélectionnées
    const banqueNoms = selectedBanques.map((id) => banques.find((b) => b.id === id)?.nom);
    
    const filteredByDateAndBank = transactions.filter((t) => {
      const dateMatch = t.date >= dateDebut && t.date <= dateFin;
      const banqueMatch = banqueNoms.includes(t.banque);
      return dateMatch && banqueMatch;
    });

    const totaux = {
      entrees: filteredByDateAndBank.filter((t) => t.type === "entree").reduce((sum, t) => sum + t.montant, 0),
      sorties: filteredByDateAndBank.filter((t) => t.type === "sortie").reduce((sum, t) => sum + t.montant, 0),
      solde: 0,
    };
    totaux.solde = totaux.entrees - totaux.sorties;

    const exportTransactions = filteredByDateAndBank.map((t) => ({
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

    const banqueLabel = selectedBanques.length === banques.length 
      ? "Toutes les banques" 
      : banqueNoms.filter(Boolean).join(", ");

    const options = {
      titre: "Journal Bancaire",
      sousTitre: `Transactions bancaires - ${banqueLabel}`,
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

    toast.success(`Export ${format.toUpperCase()} généré pour ${banqueLabel}`);
  };

  const handleValidateRapprochement = (rapprochements: any[]) => {
    // Mettre à jour le statut des transactions rapprochées
    const matchedIds = rapprochements
      .filter((r) => r.matchedItem)
      .map((r) => r.matchedItem.id);
    
    setTransactions((prev) =>
      prev.map((t) =>
        matchedIds.includes(t.id) ? { ...t, statut: "rapproche" as const } : t
      )
    );
    toast.success("Rapprochements validés et transactions mises à jour");
  };

  return (
    <Tabs defaultValue="transactions" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="rapprochement" className="gap-2">
          <FileUp className="h-4 w-4" />
          Rapprochement
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transactions" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative p-3 rounded-2xl gradient-primary shadow-colored">
                <Landmark className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
                Suivi Banque
              </h1>
              <p className="text-muted-foreground">
                Gestion des transactions bancaires
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2"
        >
          <Button
            className="border-2 border-success bg-success/10 text-success hover:bg-success hover:text-success-foreground transition-all duration-300 hover:shadow-lg hover:shadow-success/25"
            variant="outline"
            onClick={() => openDialog("entree")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Encaissement
          </Button>
          <Button
            className="border-2 border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:shadow-lg hover:shadow-destructive/25"
            variant="outline"
            onClick={() => openDialog("sortie")}
          >
            <Minus className="h-4 w-4 mr-2" />
            Décaissement
          </Button>
        </motion.div>
      </div>

      {/* Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde Total - Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="relative overflow-hidden border-0 shadow-xl">
            <div className="absolute inset-0 gradient-primary opacity-95" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAzMGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <CardContent className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/80">Solde Total Banques</p>
                  <p className={`text-3xl font-heading font-bold text-white`}>
                    {formatCurrency(soldeTotalBanque)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {formatCurrency(totalEntrees)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ArrowDownLeft className="h-3 w-3" />
                      {formatCurrency(totalSorties)}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Building className="h-7 w-7 text-white" />
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
            whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
            transition={{ delay: (index + 1) * 0.1, duration: 0.3 }}
          >
            <Card className="h-full hover:border-primary/30 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{banque.nom}</p>
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Landmark className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <p className={`text-2xl font-heading font-bold ${getSoldeBanque(banque.id) >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(getSoldeBanque(banque.id))}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono tracking-tight">
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
          whileHover={{ y: -4 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Card className="h-full border-warning/30 bg-warning/5 hover:bg-warning/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">En attente</p>
                  <p className="text-3xl font-heading font-bold text-warning">{enAttente}</p>
                  <p className="text-xs text-warning/80">À rapprocher</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/20">
                  <Clock className="h-6 w-6 text-warning animate-pulse" />
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 -ml-2 font-medium hover:bg-transparent"
                      onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    >
                      Date
                      {sortOrder === "desc" ? (
                        <ArrowDown className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowUp className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
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
                        {(() => {
                          const mode = modesPaiement.find((m) => m.value === transaction.modePaiement);
                          const ModeIcon = mode?.icon;
                          return (
                            <Badge variant="outline" className={`${mode?.color} border font-medium gap-1`}>
                              {ModeIcon && <ModeIcon className="h-3 w-3" />}
                              {mode?.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statut.color} border font-medium`}>
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
      <ExportBanqueDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
        banques={banques}
        title="Journal Bancaire"
      />
      </TabsContent>

      <TabsContent value="rapprochement">
        <RapprochementBancaire
          banques={banques}
          transactions={transactions.map((t) => ({
            id: t.id,
            date: t.date,
            description: t.description,
            montant: t.montant,
            type: t.type,
            reference: t.reference,
            client: t.client,
            statut: t.statut,
          }))}
          onValidateRapprochement={handleValidateRapprochement}
        />
      </TabsContent>
    </Tabs>
  );
}
