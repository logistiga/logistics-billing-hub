import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Target,
  CreditCard,
  Receipt,
  Clipboard,
  Building2,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Données pour le graphique de chiffre d'affaires mensuel
const revenueData = [
  { month: "Jan", revenue: 18500000, expenses: 12000000 },
  { month: "Fév", revenue: 21200000, expenses: 13500000 },
  { month: "Mar", revenue: 19800000, expenses: 11800000 },
  { month: "Avr", revenue: 23500000, expenses: 14200000 },
  { month: "Mai", revenue: 22100000, expenses: 13800000 },
  { month: "Juin", revenue: 25800000, expenses: 15200000 },
  { month: "Juil", revenue: 24200000, expenses: 14800000 },
  { month: "Août", revenue: 20500000, expenses: 12500000 },
  { month: "Sep", revenue: 26800000, expenses: 16000000 },
  { month: "Oct", revenue: 28500000, expenses: 17200000 },
  { month: "Nov", revenue: 27200000, expenses: 16500000 },
  { month: "Déc", revenue: 24580000, expenses: 15000000 },
];

// Données pour la répartition par type de service
const serviceData = [
  { name: "Transport", value: 45, color: "hsl(var(--primary))" },
  { name: "Manutention", value: 28, color: "hsl(var(--success))" },
  { name: "Stockage", value: 18, color: "hsl(var(--warning))" },
  { name: "Autres", value: 9, color: "hsl(var(--muted-foreground))" },
];

// Données pour les ordres par jour (7 derniers jours)
const ordersPerDay = [
  { day: "Lun", orders: 12 },
  { day: "Mar", orders: 18 },
  { day: "Mer", orders: 15 },
  { day: "Jeu", orders: 22 },
  { day: "Ven", orders: 19 },
  { day: "Sam", orders: 8 },
  { day: "Dim", orders: 3 },
];

const stats = [
  {
    title: "Chiffre d'affaires",
    value: "24 580 000",
    unit: "FCFA",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Clients actifs",
    value: "156",
    unit: "clients",
    change: "+8",
    trend: "up",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    title: "Factures en cours",
    value: "42",
    unit: "factures",
    change: "-3",
    trend: "down",
    icon: FileText,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Paiements reçus",
    value: "18 450 000",
    unit: "FCFA",
    change: "+22.3%",
    trend: "up",
    icon: Wallet,
    color: "bg-primary/10 text-primary",
  },
];

// KPIs supplémentaires
const additionalKPIs = [
  {
    title: "Taux de recouvrement",
    value: 87,
    target: 95,
    unit: "%",
    icon: Target,
    color: "primary",
  },
  {
    title: "Ordres complétés",
    value: 234,
    target: 250,
    unit: "ce mois",
    icon: Clipboard,
    color: "success",
  },
  {
    title: "Nouveaux clients",
    value: 12,
    target: 15,
    unit: "ce mois",
    icon: Users,
    color: "warning",
  },
  {
    title: "Créances clients",
    value: 6130000,
    formatted: "6.13M",
    unit: "FCFA",
    icon: CreditCard,
    color: "destructive",
  },
];

const recentInvoices = [
  { id: "FAC-2024-0142", client: "COMILOG SA", amount: "3 250 000 FCFA", status: "paid", date: "14 Déc 2024" },
  { id: "FAC-2024-0141", client: "OLAM Gabon", amount: "1 875 000 FCFA", status: "pending", date: "13 Déc 2024" },
  { id: "FAC-2024-0140", client: "Total Energies", amount: "5 420 000 FCFA", status: "paid", date: "12 Déc 2024" },
  { id: "FAC-2024-0139", client: "Assala Energy", amount: "2 100 000 FCFA", status: "overdue", date: "10 Déc 2024" },
];

const recentOrders = [
  { id: "OT-2024-0089", type: "Transport", client: "COMILOG SA", status: "in_progress", date: "15 Déc 2024" },
  { id: "OT-2024-0088", type: "Manutention", client: "OLAM Gabon", status: "completed", date: "14 Déc 2024" },
  { id: "OT-2024-0087", type: "Stockage", client: "Total Energies", status: "pending", date: "14 Déc 2024" },
];

// Top clients
const topClients = [
  { name: "COMILOG SA", revenue: 8500000, orders: 45, growth: 15 },
  { name: "Total Energies", revenue: 6200000, orders: 32, growth: 8 },
  { name: "OLAM Gabon", revenue: 4800000, orders: 28, growth: -3 },
  { name: "Assala Energy", revenue: 3200000, orders: 18, growth: 22 },
  { name: "SEEG", revenue: 1880000, orders: 12, growth: 5 },
];

const statusConfig = {
  paid: { label: "Payée", icon: CheckCircle2, class: "text-success bg-success/10" },
  pending: { label: "En attente", icon: Clock, class: "text-warning bg-warning/10" },
  overdue: { label: "En retard", icon: AlertCircle, class: "text-destructive bg-destructive/10" },
  in_progress: { label: "En cours", icon: Clock, class: "text-primary bg-primary/10" },
  completed: { label: "Terminé", icon: CheckCircle2, class: "text-success bg-success/10" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat("fr-GA").format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)} FCFA
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header Premium */}
        <PageHeader
          title="Tableau de bord"
          subtitle="Bienvenue ! Voici un aperçu de votre activité"
          icon={LayoutDashboard}
          badges={[
            { label: "CA ce mois", value: "24.5M FCFA", variant: "success" },
            { label: "Clients actifs", value: "156", variant: "info" },
          ]}
        >
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Décembre 2024
          </Button>
          <Button variant="gradient">Nouvelle facture</Button>
        </PageHeader>

        {/* Stats Grid avec StatCard */}
        <StatCardGrid columns={4}>
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              unit={stat.unit}
              change={stat.change}
              trend={stat.trend as "up" | "down"}
              icon={stat.icon}
              variant={stat.trend === "up" ? "success" : "destructive"}
              delay={index * 0.1}
            />
          ))}
        </StatCardGrid>

        {/* KPIs avec objectifs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {additionalKPIs.map((kpi, index) => (
            <motion.div key={kpi.title} variants={itemVariants}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-${kpi.color}/10`}>
                      <kpi.icon className={`h-4 w-4 text-${kpi.color}`} />
                    </div>
                    {kpi.target && (
                      <Badge variant="outline" className="text-xs">
                        Objectif: {kpi.target}{typeof kpi.value === "number" && kpi.target ? "" : ""}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  <p className="text-xl font-bold mt-1">
                    {kpi.formatted || kpi.value}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{kpi.unit}</span>
                  </p>
                  {kpi.target && typeof kpi.value === "number" && (
                    <Progress
                      value={(kpi.value / kpi.target) * 100}
                      className="h-1.5 mt-2"
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique CA mensuel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-heading">Évolution du chiffre d'affaires</CardTitle>
                    <CardDescription>Revenus vs Dépenses sur 12 mois</CardDescription>
                  </div>
                  <Badge className="bg-success/20 text-success">+18.5% vs 2023</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenus"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Dépenses"
                      stroke="hsl(var(--destructive))"
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Répartition par service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Répartition par service</CardTitle>
                <CardDescription>Part du chiffre d'affaires</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {serviceData.map((service) => (
                    <div key={service.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {service.name} ({service.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Deuxième ligne de graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ordres par jour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Ordres cette semaine</CardTitle>
                <CardDescription>Nombre d'ordres par jour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ordersPerDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-heading">Top clients</CardTitle>
                  <CardDescription>Par chiffre d'affaires ce mois</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Voir tous
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topClients.map((client, index) => (
                    <div
                      key={client.name}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.orders} ordres</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(client.revenue)} FCFA</p>
                        <div className={`flex items-center justify-end gap-1 text-xs ${client.growth >= 0 ? "text-success" : "text-destructive"}`}>
                          {client.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {client.growth >= 0 ? "+" : ""}{client.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Factures et Ordres récents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-heading">Factures récentes</CardTitle>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentInvoices.map((invoice) => {
                    const status = statusConfig[invoice.status as keyof typeof statusConfig];
                    const StatusIcon = status.icon;
                    return (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${status.class}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{invoice.id}</p>
                            <p className="text-xs text-muted-foreground">{invoice.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{invoice.amount}</p>
                          <p className="text-xs text-muted-foreground">{invoice.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  Voir toutes les factures
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-heading">Ordres de travail récents</CardTitle>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig];
                    const StatusIcon = status.icon;
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${status.class}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                            {status.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">{order.type}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  Voir tous les ordres
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
