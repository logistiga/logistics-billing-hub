import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Banknote,
  CreditCard,
  Receipt,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Transaction {
  id: string;
  date: string;
  type: "entree" | "sortie";
  categorie: string;
  description: string;
  reference: string;
  montant: number;
  modePaiement: "especes" | "cheque" | "virement" | "carte";
  client?: string;
  facture?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-15",
    type: "entree",
    categorie: "Paiement facture",
    description: "Règlement facture FAC-2024-001",
    reference: "REC-001",
    montant: 2500000,
    modePaiement: "virement",
    client: "Total Gabon",
    facture: "FAC-2024-001",
  },
  {
    id: "2",
    date: "2024-01-14",
    type: "sortie",
    categorie: "Carburant",
    description: "Carburant véhicules - Janvier",
    reference: "DEP-001",
    montant: 450000,
    modePaiement: "especes",
  },
  {
    id: "3",
    date: "2024-01-13",
    type: "entree",
    categorie: "Paiement facture",
    description: "Acompte commande CMD-2024-015",
    reference: "REC-002",
    montant: 1200000,
    modePaiement: "cheque",
    client: "Comilog",
  },
  {
    id: "4",
    date: "2024-01-12",
    type: "sortie",
    categorie: "Salaires",
    description: "Salaires employés - Décembre 2023",
    reference: "DEP-002",
    montant: 3500000,
    modePaiement: "virement",
  },
  {
    id: "5",
    date: "2024-01-11",
    type: "entree",
    categorie: "Paiement facture",
    description: "Règlement facture FAC-2024-003",
    reference: "REC-003",
    montant: 890000,
    modePaiement: "especes",
    client: "Assala Energy",
    facture: "FAC-2024-003",
  },
  {
    id: "6",
    date: "2024-01-10",
    type: "sortie",
    categorie: "Fournitures",
    description: "Fournitures de bureau",
    reference: "DEP-003",
    montant: 125000,
    modePaiement: "carte",
  },
  {
    id: "7",
    date: "2024-01-09",
    type: "sortie",
    categorie: "Maintenance",
    description: "Réparation camion - Immatriculation AB-123-CD",
    reference: "DEP-004",
    montant: 780000,
    modePaiement: "virement",
  },
  {
    id: "8",
    date: "2024-01-08",
    type: "entree",
    categorie: "Autre",
    description: "Remboursement assurance",
    reference: "REC-004",
    montant: 350000,
    modePaiement: "virement",
  },
];

const categoriesEntree = [
  "Paiement facture",
  "Acompte",
  "Remboursement",
  "Subvention",
  "Autre",
];

const categoriesSortie = [
  "Carburant",
  "Salaires",
  "Fournitures",
  "Maintenance",
  "Loyer",
  "Électricité",
  "Eau",
  "Téléphone",
  "Internet",
  "Assurance",
  "Impôts",
  "Autre",
];

const modesPaiement = [
  { value: "especes", label: "Espèces", icon: Banknote },
  { value: "cheque", label: "Chèque", icon: Receipt },
  { value: "virement", label: "Virement", icon: ArrowUpRight },
  { value: "carte", label: "Carte bancaire", icon: CreditCard },
];

export default function Caisse() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "entree" | "sortie">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"entree" | "sortie">("entree");
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    categorie: "",
    description: "",
    montant: "",
    modePaiement: "especes" as Transaction["modePaiement"],
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

  // Calculs
  const totalEntrees = transactions
    .filter((t) => t.type === "entree")
    .reduce((sum, t) => sum + t.montant, 0);

  const totalSorties = transactions
    .filter((t) => t.type === "sortie")
    .reduce((sum, t) => sum + t.montant, 0);

  const soldeActuel = totalEntrees - totalSorties;

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: formData.date,
      type: transactionType,
      categorie: formData.categorie,
      description: formData.description,
      reference: `${transactionType === "entree" ? "REC" : "DEP"}-${String(transactions.length + 1).padStart(3, "0")}`,
      montant: parseFloat(formData.montant) || 0,
      modePaiement: formData.modePaiement,
      client: formData.client || undefined,
      facture: formData.facture || undefined,
    };

    setTransactions([newTransaction, ...transactions]);
    setDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      categorie: "",
      description: "",
      montant: "",
      modePaiement: "especes",
      client: "",
      facture: "",
    });
  };

  const openDialog = (type: "entree" | "sortie") => {
    setTransactionType(type);
    setFormData({
      ...formData,
      categorie: "",
    });
    setDialogOpen(true);
  };

  const stats = [
    {
      title: "Solde actuel",
      value: formatCurrency(soldeActuel),
      icon: Wallet,
      color: soldeActuel >= 0 ? "text-emerald-500" : "text-destructive",
      bgColor: soldeActuel >= 0 ? "bg-emerald-500/10" : "bg-destructive/10",
    },
    {
      title: "Total Entrées",
      value: formatCurrency(totalEntrees),
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      subtitle: `${transactions.filter((t) => t.type === "entree").length} opérations`,
    },
    {
      title: "Total Sorties",
      value: formatCurrency(totalSorties),
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subtitle: `${transactions.filter((t) => t.type === "sortie").length} opérations`,
    },
    {
      title: "Opérations du jour",
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
          <h1 className="text-3xl font-bold text-foreground">Caisse</h1>
          <p className="text-muted-foreground mt-1">
            Gestion de la trésorerie et des mouvements de fonds
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => openDialog("entree")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Entrée
          </Button>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => openDialog("sortie")}
          >
            <Minus className="h-4 w-4 mr-2" />
            Sortie
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

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Journal de caisse
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
              <Select
                value={filterType}
                onValueChange={(value: "all" | "entree" | "sortie") =>
                  setFilterType(value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="entree">Entrées</SelectItem>
                  <SelectItem value="sortie">Sorties</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
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
                  <TableHead>Mode</TableHead>
                  <TableHead>Client/Fournisseur</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
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
                      <Badge variant="outline">{transaction.categorie}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="capitalize"
                      >
                        {modesPaiement.find(
                          (m) => m.value === transaction.modePaiement
                        )?.label || transaction.modePaiement}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.client || "-"}</TableCell>
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
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucune transaction trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for adding transaction */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {transactionType === "entree" ? (
                <>
                  <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
                  <span>Nouvelle entrée de caisse</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                  <span>Nouvelle sortie de caisse</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Enregistrer une {transactionType === "entree" ? "entrée" : "sortie"} de fonds
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modePaiement">Mode de paiement</Label>
                <Select
                  value={formData.modePaiement}
                  onValueChange={(value: Transaction["modePaiement"]) =>
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
              <Label htmlFor="categorie">Catégorie</Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) =>
                  setFormData({ ...formData, categorie: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {(transactionType === "entree"
                    ? categoriesEntree
                    : categoriesSortie
                  ).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">Montant (FCFA)</Label>
              <Input
                id="montant"
                type="number"
                placeholder="0"
                value={formData.montant}
                onChange={(e) =>
                  setFormData({ ...formData, montant: e.target.value })
                }
              />
            </div>

            {transactionType === "entree" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client (optionnel)</Label>
                  <Input
                    id="client"
                    placeholder="Nom du client"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facture">N° Facture (optionnel)</Label>
                  <Input
                    id="facture"
                    placeholder="FAC-2024-XXX"
                    value={formData.facture}
                    onChange={(e) =>
                      setFormData({ ...formData, facture: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de l'opération..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
              className={
                transactionType === "entree"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
