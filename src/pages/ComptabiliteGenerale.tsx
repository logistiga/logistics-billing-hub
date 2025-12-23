import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Download,
  Filter,
  PieChart,
  BarChart3,
  ArrowRight,
  Banknote,
  CreditCard,
  Receipt,
  RefreshCw,
  Building,
  Clock,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { ExportDialog } from "@/components/ExportDialog";
import { generateExportPDF, generateExportExcel } from "@/lib/exportComptabilite";

// Mock data combined
const caisseData = {
  solde: 4940000,
  entrees: 5590000,
  sorties: 650000,
  transactions: 8,
};

const banqueData = {
  solde: 11450000,
  entrees: 11450000,
  sorties: 12000000,
  transactions: 7,
  banques: [
    { nom: "BGFI Bank", solde: 6500000, compte: "40003 04140 4104165087118" },
    { nom: "UGB", solde: 4950000, compte: "40002 00043 9000330B81 84" },
  ],
};

const recentTransactions = [
  { id: "1", date: "2024-01-15", type: "entree", source: "banque", description: "Virement reçu - Total Gabon", montant: 5500000, mode: "virement" },
  { id: "2", date: "2024-01-15", type: "entree", source: "caisse", description: "Paiement espèces FAC-2024-001", montant: 2500000, mode: "especes" },
  { id: "3", date: "2024-01-14", type: "sortie", source: "banque", description: "Virement salaires", montant: 8500000, mode: "virement" },
  { id: "4", date: "2024-01-14", type: "sortie", source: "caisse", description: "Carburant véhicules", montant: 450000, mode: "especes" },
  { id: "5", date: "2024-01-13", type: "entree", source: "banque", description: "Chèque Comilog", montant: 3200000, mode: "cheque" },
  { id: "6", date: "2024-01-13", type: "entree", source: "caisse", description: "Acompte CMD-2024-015", montant: 1200000, mode: "especes" },
  { id: "7", date: "2024-01-12", type: "sortie", source: "banque", description: "Paiement fournisseur", montant: 1850000, mode: "virement" },
  { id: "8", date: "2024-01-11", type: "sortie", source: "banque", description: "Prélèvement assurance", montant: 450000, mode: "prelevement" },
];

const monthlyData = [
  { mois: "Janvier", entrees: 22140000, sorties: 12650000 },
  { mois: "Décembre", entrees: 18500000, sorties: 15200000 },
  { mois: "Novembre", entrees: 25000000, sorties: 18000000 },
  { mois: "Octobre", entrees: 21000000, sorties: 16500000 },
];

const categoriesDepenses = [
  { nom: "Salaires", montant: 8500000, pourcentage: 67 },
  { nom: "Fournisseurs", montant: 1850000, pourcentage: 15 },
  { nom: "Carburant", montant: 450000, pourcentage: 4 },
  { nom: "Charges", montant: 450000, pourcentage: 4 },
  { nom: "Impôts", montant: 1200000, pourcentage: 9 },
  { nom: "Autres", montant: 200000, pourcentage: 1 },
];

export default function ComptabiliteGenerale() {
  const [periode, setPeriode] = useState("mois");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  const soldeGlobal = caisseData.solde + banqueData.solde;
  const totalEntrees = caisseData.entrees + banqueData.entrees;
  const totalSorties = caisseData.sorties + banqueData.sorties;

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "especes": return Banknote;
      case "virement": return ArrowUpRight;
      case "cheque": return Receipt;
      case "carte": return CreditCard;
      case "prelevement": return RefreshCw;
      default: return Receipt;
    }
  };

  const handleExport = (format: "pdf" | "excel", dateDebut: string, dateFin: string) => {
    const filteredByDate = recentTransactions.filter((t) => t.date >= dateDebut && t.date <= dateFin);
    const totaux = {
      entrees: filteredByDate.filter((t) => t.type === "entree").reduce((sum, t) => sum + t.montant, 0),
      sorties: filteredByDate.filter((t) => t.type === "sortie").reduce((sum, t) => sum + t.montant, 0),
      solde: 0,
    };
    totaux.solde = totaux.entrees - totaux.sorties;

    const exportTransactions = filteredByDate.map((t) => ({
      date: t.date,
      reference: `${t.source === "caisse" ? "CAI" : "BNK"}-${t.id}`,
      description: t.description,
      categorie: t.source === "caisse" ? "Espèces" : "Bancaire",
      type: t.type as "entree" | "sortie",
      montant: t.montant,
      modePaiement: t.mode,
    }));

    const options = {
      titre: "Comptabilité Générale",
      sousTitre: "Trésorerie globale (Caisse + Banque)",
      periodeDebut: dateDebut,
      periodeFin: dateFin,
      transactions: exportTransactions,
      totaux,
      type: "global" as const,
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
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comptabilité Générale</h1>
              <p className="text-muted-foreground">
                Vue d'ensemble de la trésorerie (Caisse + Banque)
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jour">Aujourd'hui</SelectItem>
              <SelectItem value="semaine">Cette semaine</SelectItem>
              <SelectItem value="mois">Ce mois</SelectItem>
              <SelectItem value="trimestre">Ce trimestre</SelectItem>
              <SelectItem value="annee">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-t-4 border-t-primary hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Trésorerie Globale</p>
                <div className="p-2 rounded-full bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${soldeGlobal >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                {formatCurrency(soldeGlobal)}
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Caisse</p>
                  <p className="text-sm font-semibold text-amber-500">{formatCurrency(caisseData.solde)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Banques</p>
                  <p className="text-sm font-semibold text-blue-500">{formatCurrency(banqueData.solde)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Entrées</p>
                <div className="p-2 rounded-full bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-500">
                {formatCurrency(totalEntrees)}
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Espèces</p>
                  <p className="text-sm font-semibold">{formatCurrency(caisseData.entrees)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Bancaire</p>
                  <p className="text-sm font-semibold">{formatCurrency(banqueData.entrees)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-t-4 border-t-destructive hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Sorties</p>
                <div className="p-2 rounded-full bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
              </div>
              <p className="text-3xl font-bold text-destructive">
                {formatCurrency(totalSorties)}
              </p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Espèces</p>
                  <p className="text-sm font-semibold">{formatCurrency(caisseData.sorties)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Bancaire</p>
                  <p className="text-sm font-semibold">{formatCurrency(banqueData.sorties)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
            <Link to="/caisse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Banknote className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Caisse (Espèces)</CardTitle>
                      <CardDescription>Transactions en espèces</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Solde</p>
                    <p className="font-bold text-amber-500">{formatCurrency(caisseData.solde)}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                    <p className="text-xs text-muted-foreground mb-1">Entrées</p>
                    <p className="font-semibold text-emerald-500">{formatCurrency(caisseData.entrees)}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/10">
                    <p className="text-xs text-muted-foreground mb-1">Sorties</p>
                    <p className="font-semibold text-destructive">{formatCurrency(caisseData.sorties)}</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
            <Link to="/suivi-banque">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Landmark className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Suivi Banque</CardTitle>
                      <CardDescription>Virements, chèques, cartes</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {banqueData.banques.map((banque) => (
                    <div key={banque.nom} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{banque.nom}</p>
                        <p className="text-xs text-muted-foreground font-mono">{banque.compte}</p>
                      </div>
                      <p className="font-bold text-blue-500">{formatCurrency(banque.solde)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>
      </div>

      {/* Tabs for detailed view */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="repartition">Répartition</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Dernières transactions
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((t) => {
                      const ModeIcon = getModeIcon(t.mode);
                      return (
                        <TableRow key={t.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {formatDate(t.date)}
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[200px] truncate">{t.description}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={t.source === "caisse" ? "border-amber-500 text-amber-500" : "border-blue-500 text-blue-500"}
                            >
                              {t.source === "caisse" ? (
                                <><Banknote className="h-3 w-3 mr-1" />Caisse</>
                              ) : (
                                <><Landmark className="h-3 w-3 mr-1" />Banque</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              <ModeIcon className="h-3 w-3 mr-1" />
                              {t.mode === "especes" ? "Espèces" : t.mode.charAt(0).toUpperCase() + t.mode.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-bold ${t.type === "entree" ? "text-emerald-500" : "text-destructive"}`}>
                              {t.type === "entree" ? "+" : "-"} {formatCurrency(t.montant)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Évolution mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((mois, index) => (
                  <motion.div
                    key={mois.mois}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">{mois.mois}</p>
                      <Badge variant={mois.entrees > mois.sorties ? "default" : "destructive"}>
                        {mois.entrees > mois.sorties ? "+" : ""}{formatCurrency(mois.entrees - mois.sorties)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Entrées</span>
                          <span className="text-sm font-medium text-emerald-500">{formatCurrency(mois.entrees)}</span>
                        </div>
                        <Progress value={100} className="h-2 bg-emerald-500/20" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Sorties</span>
                          <span className="text-sm font-medium text-destructive">{formatCurrency(mois.sorties)}</span>
                        </div>
                        <Progress value={(mois.sorties / mois.entrees) * 100} className="h-2 bg-destructive/20" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repartition">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Répartition des dépenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoriesDepenses.map((cat, index) => (
                  <motion.div
                    key={cat.nom}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cat.nom}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{cat.pourcentage}%</span>
                        <span className="font-semibold">{formatCurrency(cat.montant)}</span>
                      </div>
                    </div>
                    <Progress value={cat.pourcentage} className="h-2" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
