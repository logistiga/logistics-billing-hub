import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
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
  Banknote,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExportDialog } from "@/components/ExportDialog";
import { generateExportPDF, generateExportExcel } from "@/lib/exportComptabilite";
import { toast } from "@/hooks/use-toast";
import { 
  cashFlowStore, 
  CashTransaction,
  encaissementCategories,
  decaissementCategories 
} from "@/lib/cashFlowStore";

export default function Caisse() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "encaissement" | "decaissement">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"encaissement" | "decaissement">("encaissement");
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    categorie: "",
    description: "",
    montant: "",
    client: "",
    facture: "",
  });

  // Charger et écouter les changements du store
  useEffect(() => {
    const loadTransactions = () => {
      setTransactions(cashFlowStore.getPastTransactions());
    };
    
    loadTransactions();
    const unsubscribe = cashFlowStore.subscribe(loadTransactions);
    return () => unsubscribe();
  }, []);

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

  const getCategoryLabel = (value: string, type: "encaissement" | "decaissement") => {
    const categories = type === "encaissement" ? encaissementCategories : decaissementCategories;
    return categories.find(c => c.value === value)?.label || value;
  };

  const totalEntrees = transactions
    .filter((t) => t.type === "encaissement")
    .reduce((sum, t) => sum + t.montant, 0);

  const totalSorties = transactions
    .filter((t) => t.type === "decaissement")
    .reduce((sum, t) => sum + t.montant, 0);

  const soldeCaisse = totalEntrees - totalSorties;

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = () => {
    if (!formData.categorie || !formData.description || !formData.montant) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const montant = parseFloat(formData.montant);
    if (isNaN(montant) || montant <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    cashFlowStore.add({
      date: formData.date,
      type: transactionType,
      categorie: formData.categorie,
      description: formData.description,
      reference: `CAI-${Date.now().toString().slice(-6)}`,
      montant,
      client: formData.client || undefined,
      facture: formData.facture || undefined,
      status: "confirmed",
      source: "caisse",
      createdBy: "Admin",
    });

    toast({
      title: transactionType === "encaissement" ? "Encaissement enregistré" : "Décaissement enregistré",
      description: `${formatCurrency(montant)} ${transactionType === "encaissement" ? "encaissé" : "décaissé"}`,
    });

    setDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      categorie: "",
      description: "",
      montant: "",
      client: "",
      facture: "",
    });
  };

  const handleDelete = (id: string) => {
    cashFlowStore.delete(id);
    toast({
      title: "Transaction supprimée",
      description: "La transaction a été supprimée avec succès",
    });
  };

  const openDialog = (type: "encaissement" | "decaissement") => {
    setTransactionType(type);
    setFormData({ ...formData, categorie: "" });
    setDialogOpen(true);
  };

  const handleExport = (format: "pdf" | "excel", dateDebut: string, dateFin: string) => {
    const filteredByDate = transactions.filter((t) => {
      return t.date >= dateDebut && t.date <= dateFin;
    });

    const totaux = {
      entrees: filteredByDate.filter((t) => t.type === "encaissement").reduce((sum, t) => sum + t.montant, 0),
      sorties: filteredByDate.filter((t) => t.type === "decaissement").reduce((sum, t) => sum + t.montant, 0),
      solde: 0,
    };
    totaux.solde = totaux.entrees - totaux.sorties;

    const mappedTransactions = filteredByDate.map(t => ({
      id: t.id,
      date: t.date,
      type: t.type === "encaissement" ? "entree" as const : "sortie" as const,
      categorie: getCategoryLabel(t.categorie, t.type),
      description: t.description,
      reference: t.reference,
      montant: t.montant,
      client: t.client,
      facture: t.facture,
      createdBy: t.createdBy || "Admin",
    }));

    const options = {
      titre: "Journal de Caisse",
      sousTitre: "Transactions en espèces",
      periodeDebut: dateDebut,
      periodeFin: dateFin,
      transactions: mappedTransactions,
      totaux,
      type: "caisse" as const,
    };

    if (format === "pdf") {
      generateExportPDF(options);
    } else {
      generateExportExcel(options);
    }
  };

  const stats = [
    {
      title: "Solde Caisse",
      value: formatCurrency(soldeCaisse),
      icon: Wallet,
      color: soldeCaisse >= 0 ? "text-emerald-500" : "text-destructive",
      bgColor: soldeCaisse >= 0 ? "bg-emerald-500/10" : "bg-destructive/10",
    },
    {
      title: "Entrées Espèces",
      value: formatCurrency(totalEntrees),
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      subtitle: `${transactions.filter((t) => t.type === "encaissement").length} opérations`,
    },
    {
      title: "Sorties Espèces",
      value: formatCurrency(totalSorties),
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subtitle: `${transactions.filter((t) => t.type === "decaissement").length} opérations`,
    },
    {
      title: "Transactions du jour",
      value: transactions.filter(
        (t) => t.date === new Date().toISOString().split("T")[0]
      ).length.toString(),
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Banknote className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Caisse</h1>
              <p className="text-muted-foreground">
                Gestion des transactions en espèces uniquement
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => openDialog("encaissement")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Encaissement
          </Button>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => openDialog("decaissement")}
          >
            <Minus className="h-4 w-4 mr-2" />
            Décaissement
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-amber-500" />
              Journal de Caisse (Espèces)
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={(v: "all" | "encaissement" | "decaissement") => setFilterType(v)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="encaissement">Entrées</SelectItem>
                  <SelectItem value="decaissement">Sorties</SelectItem>
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
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {transaction.reference}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px]">
                        <p className="truncate">{transaction.description}</p>
                        {transaction.facture && (
                          <p className="text-xs text-muted-foreground">
                            Réf: {transaction.facture}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(transaction.categorie, transaction.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.client || "-"}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-bold ${
                          transaction.type === "encaissement"
                            ? "text-emerald-500"
                            : "text-destructive"
                        }`}
                      >
                        {transaction.type === "encaissement" ? "+" : "-"}{" "}
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
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {transactionType === "encaissement" ? (
                <>
                  <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
                  <span>Nouvel encaissement espèces</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                  <span>Nouveau décaissement espèces</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Enregistrer une {transactionType === "encaissement" ? "entrée" : "sortie"} en espèces
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
                <Label>Montant (FCFA) *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) => setFormData({ ...formData, categorie: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {(transactionType === "encaissement" ? encaissementCategories : decaissementCategories).map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {transactionType === "encaissement" && (
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
              <Label>Description *</Label>
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
              className={transactionType === "encaissement" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              variant={transactionType === "decaissement" ? "destructive" : "default"}
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
        title="Journal de Caisse"
      />
    </div>
  );
}
