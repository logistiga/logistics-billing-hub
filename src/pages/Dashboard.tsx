import { motion } from "framer-motion";
import {
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
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const recentInvoices = [
  {
    id: "FAC-2024-0142",
    client: "COMILOG SA",
    amount: "3 250 000 FCFA",
    status: "paid",
    date: "14 Déc 2024",
  },
  {
    id: "FAC-2024-0141",
    client: "OLAM Gabon",
    amount: "1 875 000 FCFA",
    status: "pending",
    date: "13 Déc 2024",
  },
  {
    id: "FAC-2024-0140",
    client: "Total Energies",
    amount: "5 420 000 FCFA",
    status: "paid",
    date: "12 Déc 2024",
  },
  {
    id: "FAC-2024-0139",
    client: "Assala Energy",
    amount: "2 100 000 FCFA",
    status: "overdue",
    date: "10 Déc 2024",
  },
  {
    id: "FAC-2024-0138",
    client: "SEEG",
    amount: "890 000 FCFA",
    status: "pending",
    date: "09 Déc 2024",
  },
];

const recentOrders = [
  {
    id: "OT-2024-0089",
    type: "Transport",
    client: "COMILOG SA",
    status: "in_progress",
    date: "15 Déc 2024",
  },
  {
    id: "OT-2024-0088",
    type: "Manutention",
    client: "OLAM Gabon",
    status: "completed",
    date: "14 Déc 2024",
  },
  {
    id: "OT-2024-0087",
    type: "Stockage",
    client: "Total Energies",
    status: "pending",
    date: "14 Déc 2024",
  },
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
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenue ! Voici un aperçu de votre activité
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Exporter</Button>
            <Button variant="gradient">Nouvelle facture</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="hover-lift cursor-pointer border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === "up" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {stat.change}
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold font-heading">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.unit}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-heading">
                  Factures récentes
                </CardTitle>
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
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${status.class}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{invoice.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.client}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{invoice.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.date}
                          </p>
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
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-heading">
                  Ordres de travail récents
                </CardTitle>
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
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${status.class}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.client}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.class}`}
                          >
                            {status.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.type}
                          </p>
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
