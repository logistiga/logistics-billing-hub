import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Wallet,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  LineChart,
  Line,
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

interface CashFlowItem {
  id: string;
  type: "encaissement" | "decaissement";
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "confirmed" | "expected" | "uncertain";
  reference?: string;
}

// Données de trésorerie prévisionnelle
const generateForecastData = () => {
  const today = new Date();
  const data: CashFlowItem[] = [];

  // Encaissements prévus (factures à encaisser)
  const encaissements = [
    { client: "COMILOG SA", amount: 3250000, daysFromNow: 5, status: "confirmed" as const },
    { client: "OLAM Gabon", amount: 1875000, daysFromNow: 12, status: "expected" as const },
    { client: "Total Energies", amount: 5420000, daysFromNow: 18, status: "expected" as const },
    { client: "Assala Energy", amount: 2100000, daysFromNow: 25, status: "uncertain" as const },
    { client: "SEEG", amount: 890000, daysFromNow: 30, status: "expected" as const },
    { client: "COMILOG SA", amount: 1500000, daysFromNow: 35, status: "uncertain" as const },
    { client: "Total Energies", amount: 3200000, daysFromNow: 42, status: "uncertain" as const },
    { client: "OLAM Gabon", amount: 2800000, daysFromNow: 50, status: "uncertain" as const },
  ];

  // Décaissements prévus
  const decaissements = [
    { category: "Salaires", description: "Paie décembre 2024", amount: 4500000, daysFromNow: 3, status: "confirmed" as const },
    { category: "Fournisseurs", description: "Carburant PIZOLUB", amount: 1200000, daysFromNow: 7, status: "confirmed" as const },
    { category: "Charges", description: "Loyer entrepôt", amount: 850000, daysFromNow: 10, status: "confirmed" as const },
    { category: "Fournisseurs", description: "Pièces détachées", amount: 650000, daysFromNow: 15, status: "expected" as const },
    { category: "Impôts", description: "TVA T4 2024", amount: 2100000, daysFromNow: 20, status: "confirmed" as const },
    { category: "Salaires", description: "Paie janvier 2025", amount: 4500000, daysFromNow: 33, status: "expected" as const },
    { category: "Fournisseurs", description: "Maintenance véhicules", amount: 980000, daysFromNow: 38, status: "expected" as const },
    { category: "Charges", description: "Assurances", amount: 1500000, daysFromNow: 45, status: "uncertain" as const },
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

const cashFlowItems = generateForecastData();

// Générer données pour le graphique
const generateChartData = () => {
  const today = new Date();
  const data = [];
  let solde = 8500000; // Solde initial

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
};

const chartData = generateChartData();

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
  const [period, setPeriod] = useState("60");
  const [viewType, setViewType] = useState<"all" | "encaissement" | "decaissement">("all");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  // Filtrer les items par période
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + parseInt(period));

  const filteredItems = cashFlowItems.filter((item) => {
    const itemDate = new Date(item.date);
    const matchesPeriod = itemDate >= today && itemDate <= endDate;
    const matchesType = viewType === "all" || item.type === viewType;
    return matchesPeriod && matchesType;
  });

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

        {/* Filters */}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun mouvement prévu pour cette période
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const StatusIcon = statusConfig[item.status].icon;
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
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
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
