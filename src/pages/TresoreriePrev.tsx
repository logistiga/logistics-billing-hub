import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  Wallet,
  Plus,
  Trash2,
  Edit,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface CashFlowItem {
  id: string;
  type: "encaissement" | "decaissement";
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "confirmed" | "expected" | "uncertain";
  reference?: string;
  isManual?: boolean;
}

// Catégories de décaissements
const decaissementCategories = [
  { value: "salaires", label: "Salaires" },
  { value: "fournisseurs", label: "Fournisseurs" },
  { value: "charges", label: "Charges fixes" },
  { value: "impots", label: "Impôts & Taxes" },
  { value: "investissements", label: "Investissements" },
  { value: "remboursements", label: "Remboursements" },
  { value: "autres", label: "Autres" },
];

// Catégories d'encaissements
const encaissementCategories = [
  { value: "clients", label: "Clients" },
  { value: "subventions", label: "Subventions" },
  { value: "emprunts", label: "Emprunts" },
  { value: "autres", label: "Autres" },
];

// Données de trésorerie prévisionnelle initiales
const generateInitialData = (): CashFlowItem[] => {
  const today = new Date();
  const data: CashFlowItem[] = [];

  const encaissements = [
    { client: "COMILOG SA", amount: 3250000, daysFromNow: 5, status: "confirmed" as const },
    { client: "OLAM Gabon", amount: 1875000, daysFromNow: 12, status: "expected" as const },
    { client: "Total Energies", amount: 5420000, daysFromNow: 18, status: "expected" as const },
    { client: "Assala Energy", amount: 2100000, daysFromNow: 25, status: "uncertain" as const },
    { client: "SEEG", amount: 890000, daysFromNow: 30, status: "expected" as const },
  ];

  const decaissements = [
    { category: "Salaires", description: "Paie décembre 2024", amount: 4500000, daysFromNow: 3, status: "confirmed" as const },
    { category: "Fournisseurs", description: "Carburant PIZOLUB", amount: 1200000, daysFromNow: 7, status: "confirmed" as const },
    { category: "Charges", description: "Loyer entrepôt", amount: 850000, daysFromNow: 10, status: "confirmed" as const },
    { category: "Fournisseurs", description: "Pièces détachées", amount: 650000, daysFromNow: 15, status: "expected" as const },
    { category: "Impôts", description: "TVA T4 2024", amount: 2100000, daysFromNow: 20, status: "confirmed" as const },
  ];

  encaissements.forEach((e, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + e.daysFromNow);
    data.push({
      id: `enc-${i}`,
      type: "encaissement",
      category: "Clients",
      description: `Paiement ${e.client}`,
      amount: e.amount,
      date: date.toISOString().split("T")[0],
      status: e.status,
      reference: `FAC-2024-${String(140 + i).padStart(4, "0")}`,
    });
  });

  decaissements.forEach((d, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + d.daysFromNow);
    data.push({
      id: `dec-${i}`,
      type: "decaissement",
      category: d.category,
      description: d.description,
      amount: d.amount,
      date: date.toISOString().split("T")[0],
      status: d.status,
    });
  });

  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const statusConfig = {
  confirmed: {
    label: "Confirmé",
    class: "bg-success text-success-foreground",
    icon: CheckCircle,
  },
  expected: {
    label: "Prévu",
    class: "bg-primary/20 text-primary border-primary/30",
    icon: Calendar,
  },
  uncertain: {
    label: "Incertain",
    class: "bg-warning/20 text-warning border-warning/30",
    icon: AlertTriangle,
  },
};

export default function TresoreriePrev() {
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>(generateInitialData);
  const [period, setPeriod] = useState("60");
  const [viewType, setViewType] = useState<"all" | "encaissement" | "decaissement">("all");
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CashFlowItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: "decaissement" as "encaissement" | "decaissement",
    category: "",
    description: "",
    amount: "",
    date: undefined as Date | undefined,
    status: "expected" as CashFlowItem["status"],
    reference: "",
  });

  const resetForm = () => {
    setFormData({
      type: "decaissement",
      category: "",
      description: "",
      amount: "",
      date: undefined,
      status: "expected",
      reference: "",
    });
    setEditingItem(null);
  };

  // Handlers pour CRUD
  const handleOpenCreate = (type: "encaissement" | "decaissement" = "decaissement") => {
    resetForm();
    setFormData((prev) => ({ ...prev, type }));
    setCreateDialogOpen(true);
  };

  const handleEdit = (item: CashFlowItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      category: item.category,
      description: item.description,
      amount: item.amount.toString(),
      date: new Date(item.date),
      status: item.status,
      reference: item.reference || "",
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCashFlowItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Prévision supprimée",
      description: "La prévision a été supprimée avec succès",
    });
  };

  const handleSubmit = () => {
    if (!formData.category || !formData.description || !formData.amount || !formData.date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    if (editingItem) {
      // Update existing
      setCashFlowItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                type: formData.type,
                category: formData.category,
                description: formData.description,
                amount,
                date: formData.date!.toISOString().split("T")[0],
                status: formData.status,
                reference: formData.reference || undefined,
              }
            : item
        )
      );
      toast({
        title: "Prévision modifiée",
        description: "La prévision a été mise à jour",
      });
    } else {
      // Create new
      const newItem: CashFlowItem = {
        id: `manual-${Date.now()}`,
        type: formData.type,
        category: formData.category,
        description: formData.description,
        amount,
        date: formData.date!.toISOString().split("T")[0],
        status: formData.status,
        reference: formData.reference || undefined,
        isManual: true,
      };
      setCashFlowItems((prev) =>
        [...prev, newItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
      toast({
        title: "Prévision créée",
        description: `${formData.type === "encaissement" ? "Encaissement" : "Décaissement"} ajouté avec succès`,
      });
    }

    setCreateDialogOpen(false);
    resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDateDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  // Filtrer les items par période
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + parseInt(period));

  const filteredItems = cashFlowItems.filter((item) => {
    const itemDate = new Date(item.date);
    const matchesPeriod = itemDate >= today && itemDate <= endDate;
    const matchesType = viewType === "all" || item.type === viewType;
    return matchesPeriod && matchesType;
  });

  // Générer données pour le graphique (dynamique)
  const chartData = useMemo(() => {
    const data = [];
    let solde = 8500000;

    for (let i = 0; i <= 60; i += 7) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + i + 7);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() + i);

      const weekItems = cashFlowItems.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= weekStart && itemDate < weekEnd;
      });

      const encaissements = weekItems
        .filter((item) => item.type === "encaissement")
        .reduce((sum, item) => sum + item.amount, 0);

      const decaissements = weekItems
        .filter((item) => item.type === "decaissement")
        .reduce((sum, item) => sum + item.amount, 0);

      solde = solde + encaissements - decaissements;

      const weekLabel = i === 0 ? "S. actuelle" : `S+${Math.ceil(i / 7)}`;

      data.push({
        semaine: weekLabel,
        encaissements: encaissements / 1000000,
        decaissements: decaissements / 1000000,
        solde: solde / 1000000,
      });
    }

    return data;
  }, [cashFlowItems]);

  // Calculs des totaux
  const totalEncaissements = filteredItems
    .filter((item) => item.type === "encaissement")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDecaissements = filteredItems
    .filter((item) => item.type === "decaissement")
    .reduce((sum, item) => sum + item.amount, 0);

  const encaissementsConfirmes = filteredItems
    .filter((item) => item.type === "encaissement" && item.status === "confirmed")
    .reduce((sum, item) => sum + item.amount, 0);

  const decaissementsConfirmes = filteredItems
    .filter((item) => item.type === "decaissement" && item.status === "confirmed")
    .reduce((sum, item) => sum + item.amount, 0);

  const soldeInitial = 8500000;
  const soldeProjeté = soldeInitial + totalEncaissements - totalDecaissements;
  const soldeMinimal = soldeInitial + encaissementsConfirmes - totalDecaissements;

  const stats = [
    {
      label: "Solde actuel",
      value: formatCurrency(soldeInitial),
      unit: "FCFA",
      icon: Wallet,
      color: "text-primary",
    },
    {
      label: "Encaissements prévus",
      value: formatCurrency(totalEncaissements),
      unit: "FCFA",
      icon: ArrowUpRight,
      color: "text-success",
      subValue: `${formatCurrency(encaissementsConfirmes)} confirmés`,
    },
    {
      label: "Décaissements prévus",
      value: formatCurrency(totalDecaissements),
      unit: "FCFA",
      icon: ArrowDownRight,
      color: "text-destructive",
      subValue: `${formatCurrency(decaissementsConfirmes)} confirmés`,
    },
    {
      label: "Solde projeté",
      value: formatCurrency(soldeProjeté),
      unit: "FCFA",
      icon: soldeProjeté >= soldeInitial ? TrendingUp : TrendingDown,
      color: soldeProjeté >= soldeInitial ? "text-success" : "text-destructive",
      subValue: `Min: ${formatCurrency(soldeMinimal)}`,
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Trésorerie Prévisionnelle
            </h1>
            <p className="text-muted-foreground mt-1">
              Projection des flux de trésorerie et soldes prévisionnels
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-bold font-heading ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.unit}
                    {stat.subValue && ` • ${stat.subValue}`}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Evolution du solde */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Évolution du solde</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="semaine" className="text-xs" />
                  <YAxis tickFormatter={(value) => `${value}M`} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}M FCFA`, "Solde"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="solde"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorSolde)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Flux par semaine */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Flux hebdomadaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="semaine" className="text-xs" />
                  <YAxis tickFormatter={(value) => `${value}M`} className="text-xs" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}M FCFA`,
                      name === "encaissements" ? "Encaissements" : "Décaissements",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="encaissements" name="Encaissements" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="decaissements" name="Décaissements" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        {soldeMinimal < 2000000 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Attention : Solde minimal critique</p>
              <p className="text-sm text-muted-foreground mt-1">
                Le solde minimal projeté ({formatCurrency(soldeMinimal)} FCFA) pourrait descendre sous le seuil de sécurité. 
                Envisagez de relancer les clients ou de décaler certains décaissements.
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters + Add buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant={viewType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("all")}
            >
              Tous
            </Button>
            <Button
              variant={viewType === "encaissement" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("encaissement")}
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Encaissements
            </Button>
            <Button
              variant={viewType === "decaissement" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("decaissement")}
            >
              <ArrowDownRight className="h-4 w-4 mr-1" />
              Décaissements
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleOpenCreate("encaissement")}>
              <Plus className="h-4 w-4 mr-1" />
              Encaissement
            </Button>
            <Button size="sm" variant="gradient" onClick={() => handleOpenCreate("decaissement")}>
              <Plus className="h-4 w-4 mr-1" />
              Décaissement
            </Button>
          </div>
        </div>

        {/* Detailed table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Détail des mouvements prévus</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun mouvement prévu pour cette période
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const StatusIcon = statusConfig[item.status].icon;
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{formatDateDisplay(item.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.type === "encaissement" ? (
                              <ArrowUpRight className="h-4 w-4 text-success" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-destructive" />
                            )}
                            <span className="capitalize">{item.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div>
                            <p>{item.description}</p>
                            {item.reference && (
                              <p className="text-xs text-muted-foreground">{item.reference}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            item.type === "encaissement" ? "text-success" : "text-destructive"
                          }`}
                        >
                          {item.type === "encaissement" ? "+" : "-"}
                          {formatCurrency(item.amount)} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig[item.status].class}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[item.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Modifier la prévision" : "Nouvelle prévision"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Modifiez les détails de la prévision"
                  : `Ajouter un ${formData.type === "encaissement" ? "encaissement" : "décaissement"} prévisionnel`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Type selector */}
              <div className="space-y-2">
                <Label>Type de mouvement</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "encaissement" | "decaissement") =>
                    setFormData((prev) => ({ ...prev, type: value, category: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encaissement">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-success" />
                        Encaissement
                      </div>
                    </SelectItem>
                    <SelectItem value="decaissement">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                        Décaissement
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === "encaissement" ? encaissementCategories : decaissementCategories).map(
                      (cat) => (
                        <SelectItem key={cat.value} value={cat.label}>
                          {cat.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Paiement facture client X, Loyer mensuel..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 1500000"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date prévue *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CashFlowItem["status"]) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Confirmé
                      </div>
                    </SelectItem>
                    <SelectItem value="expected">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Prévu
                      </div>
                    </SelectItem>
                    <SelectItem value="uncertain">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Incertain
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reference (optional) */}
              <div className="space-y-2">
                <Label htmlFor="reference">Référence (optionnel)</Label>
                <Input
                  id="reference"
                  placeholder="Ex: FAC-2024-0150, BON-001..."
                  value={formData.reference}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
