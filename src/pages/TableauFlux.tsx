import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { cashFlowStore, CashTransaction } from "@/lib/cashFlowStore";

// Données banque (mockées pour l'instant)
interface BankTransaction {
  id: string;
  date: string;
  type: "entree" | "sortie";
  categorie: string;
  description: string;
  montant: number;
  source: "banque";
  banque: string;
}

const mockBankTransactions: BankTransaction[] = [
  { id: "b1", date: "2024-01-15", type: "entree", categorie: "Paiement facture", description: "Virement - Total Gabon", montant: 5500000, source: "banque", banque: "BGFI Bank" },
  { id: "b2", date: "2024-01-14", type: "sortie", categorie: "Salaires", description: "Virement salaires - Janvier", montant: 8500000, source: "banque", banque: "BGFI Bank" },
  { id: "b3", date: "2024-01-13", type: "entree", categorie: "Paiement facture", description: "Chèque - Comilog", montant: 3200000, source: "banque", banque: "UGB" },
  { id: "b4", date: "2024-01-12", type: "sortie", categorie: "Fournisseur", description: "Paiement fournisseur", montant: 1850000, source: "banque", banque: "BGFI Bank" },
  { id: "b5", date: "2024-01-11", type: "sortie", categorie: "Charges", description: "Assurance véhicules", montant: 450000, source: "banque", banque: "BGFI Bank" },
  { id: "b6", date: "2024-01-10", type: "entree", categorie: "Paiement facture", description: "Virement - Assala Energy", montant: 2750000, source: "banque", banque: "UGB" },
];

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function TableauFlux() {
  const [caisseTxns, setCaisseTxns] = useState<CashTransaction[]>([]);
  const [periode, setPeriode] = useState("mois");
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const updateData = () => {
      setCaisseTxns(cashFlowStore.getPastTransactions());
      setForceUpdate((v) => v + 1);
    };
    updateData();
    const unsub = cashFlowStore.subscribe(updateData);
    return unsub;
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  // Calculs caisse
  const caisseEncaissements = caisseTxns
    .filter((t) => t.type === "encaissement")
    .reduce((sum, t) => sum + t.montant, 0);
  const caisseDecaissements = caisseTxns
    .filter((t) => t.type === "decaissement")
    .reduce((sum, t) => sum + t.montant, 0);
  const soldeCaisse = caisseEncaissements - caisseDecaissements;

  // Calculs banque
  const banqueEntrees = mockBankTransactions
    .filter((t) => t.type === "entree")
    .reduce((sum, t) => sum + t.montant, 0);
  const banqueSorties = mockBankTransactions
    .filter((t) => t.type === "sortie")
    .reduce((sum, t) => sum + t.montant, 0);
  const soldeBanque = banqueEntrees - banqueSorties;

  // Totaux globaux
  const totalEncaissements = caisseEncaissements + banqueEntrees;
  const totalDecaissements = caisseDecaissements + banqueSorties;
  const soldeGlobal = totalEncaissements - totalDecaissements;

  // Combiner toutes les transactions pour le tableau
  const allTransactions = [
    ...caisseTxns.map((t) => ({
      id: t.id,
      date: t.date,
      type: t.type === "encaissement" ? ("entree" as const) : ("sortie" as const),
      categorie: t.categorie,
      description: t.description,
      montant: t.montant,
      source: "caisse" as const,
      banque: "-",
    })),
    ...mockBankTransactions,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Données pour les graphiques
  const chartDataSources = [
    { name: "Caisse", encaissements: caisseEncaissements, decaissements: caisseDecaissements },
    { name: "Banque", encaissements: banqueEntrees, decaissements: banqueSorties },
  ];

  const pieDataFlux = [
    { name: "Encaissements", value: totalEncaissements, color: "#10b981" },
    { name: "Décaissements", value: totalDecaissements, color: "#ef4444" },
  ];

  // Répartition par catégorie
  const categorieMap = new Map<string, number>();
  allTransactions
    .filter((t) => t.type === "sortie")
    .forEach((t) => {
      const current = categorieMap.get(t.categorie) || 0;
      categorieMap.set(t.categorie, current + t.montant);
    });
  const pieDataCategories = Array.from(categorieMap.entries()).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
  }));

  // Évolution journalière
  const dailyData = new Map<string, { date: string; entrees: number; sorties: number }>();
  allTransactions.forEach((t) => {
    const existing = dailyData.get(t.date) || { date: t.date, entrees: 0, sorties: 0 };
    if (t.type === "entree") {
      existing.entrees += t.montant;
    } else {
      existing.sorties += t.montant;
    }
    dailyData.set(t.date, existing);
  });
  const evolutionData = Array.from(dailyData.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau des Flux</h1>
            <p className="text-muted-foreground">
              Vue consolidée de tous les mouvements (Caisse + Banque)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semaine">Cette semaine</SelectItem>
              <SelectItem value="mois">Ce mois</SelectItem>
              <SelectItem value="trimestre">Ce trimestre</SelectItem>
              <SelectItem value="annee">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Solde Global</p>
                  <p className={`text-2xl font-bold ${soldeGlobal >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                    {formatCurrency(soldeGlobal)}
                  </p>
                  <p className="text-xs text-muted-foreground">Caisse + Banque</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  {soldeGlobal >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-primary" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Encaissements</p>
                  <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalEncaissements)}</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="text-muted-foreground">
                      <Wallet className="h-3 w-3 mr-1" />
                      {formatCurrency(caisseEncaissements)}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      <Landmark className="h-3 w-3 mr-1" />
                      {formatCurrency(banqueEntrees)}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-emerald-500/10">
                  <ArrowDownLeft className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Décaissements</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDecaissements)}</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="text-muted-foreground">
                      <Wallet className="h-3 w-3 mr-1" />
                      {formatCurrency(caisseDecaissements)}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      <Landmark className="h-3 w-3 mr-1" />
                      {formatCurrency(banqueSorties)}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-destructive/10">
                  <ArrowUpRight className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Répartition par source</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Caisse</span>
                    </div>
                    <span className={`font-semibold ${soldeCaisse >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {formatCurrency(soldeCaisse)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Banque</span>
                    </div>
                    <span className={`font-semibold ${soldeBanque >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {formatCurrency(soldeBanque)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Comparaison sources */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparaison Caisse vs Banque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartDataSources}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} className="text-xs" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="encaissements" name="Encaissements" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="decaissements" name="Décaissements" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Répartition flux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Répartition des flux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={pieDataFlux}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieDataFlux.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Evolution + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart - Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Évolution journalière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} className="text-xs" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label as string)}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Categories decaissements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Décaissements par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={pieDataCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieDataCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Dernières transactions consolidées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tout</TabsTrigger>
              <TabsTrigger value="caisse">Caisse</TabsTrigger>
              <TabsTrigger value="banque">Banque</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TransactionsTable transactions={allTransactions} formatCurrency={formatCurrency} formatDate={formatDate} />
            </TabsContent>
            <TabsContent value="caisse">
              <TransactionsTable
                transactions={allTransactions.filter((t) => t.source === "caisse")}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </TabsContent>
            <TabsContent value="banque">
              <TransactionsTable
                transactions={allTransactions.filter((t) => t.source === "banque")}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant Table réutilisable
function TransactionsTable({
  transactions,
  formatCurrency,
  formatDate,
}: {
  transactions: any[];
  formatCurrency: (n: number) => string;
  formatDate: (s: string) => string;
}) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.slice(0, 15).map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{formatDate(t.date)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1">
                  {t.source === "caisse" ? (
                    <>
                      <Wallet className="h-3 w-3" />
                      Caisse
                    </>
                  ) : (
                    <>
                      <Landmark className="h-3 w-3" />
                      {t.banque}
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>{t.categorie}</TableCell>
              <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
              <TableCell>
                <Badge className={t.type === "entree" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}>
                  {t.type === "entree" ? (
                    <>
                      <ArrowDownLeft className="h-3 w-3 mr-1" />
                      Entrée
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Sortie
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell className={`text-right font-semibold ${t.type === "entree" ? "text-emerald-500" : "text-destructive"}`}>
                {t.type === "entree" ? "+" : "-"}
                {formatCurrency(t.montant)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
