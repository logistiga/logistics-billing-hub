import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Download,
  Mail,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  ArrowRightLeft,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Invoice {
  id: string;
  number: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: "paid" | "pending" | "overdue" | "partial";
  type: "Manutention" | "Transport" | "Stockage" | "Location";
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "FAC-2024-0142",
    client: "COMILOG SA",
    date: "14/12/2024",
    dueDate: "14/01/2025",
    amount: 3250000,
    paid: 3250000,
    status: "paid",
    type: "Transport",
  },
  {
    id: "2",
    number: "FAC-2024-0141",
    client: "OLAM Gabon",
    date: "13/12/2024",
    dueDate: "13/01/2025",
    amount: 1875000,
    paid: 0,
    status: "pending",
    type: "Manutention",
  },
  {
    id: "3",
    number: "FAC-2024-0140",
    client: "Total Energies",
    date: "12/12/2024",
    dueDate: "12/01/2025",
    amount: 5420000,
    paid: 5420000,
    status: "paid",
    type: "Transport",
  },
  {
    id: "4",
    number: "FAC-2024-0139",
    client: "Assala Energy",
    date: "10/12/2024",
    dueDate: "10/01/2025",
    amount: 2100000,
    paid: 0,
    status: "overdue",
    type: "Stockage",
  },
  {
    id: "5",
    number: "FAC-2024-0138",
    client: "SEEG",
    date: "09/12/2024",
    dueDate: "09/01/2025",
    amount: 890000,
    paid: 450000,
    status: "partial",
    type: "Location",
  },
];

const statusConfig = {
  paid: {
    label: "Payée",
    variant: "default" as const,
    class: "bg-success text-success-foreground",
  },
  pending: {
    label: "En attente",
    variant: "secondary" as const,
    class: "bg-warning/20 text-warning border-warning/30",
  },
  overdue: {
    label: "En retard",
    variant: "destructive" as const,
    class: "bg-destructive text-destructive-foreground",
  },
  partial: {
    label: "Partielle",
    variant: "outline" as const,
    class: "bg-primary/20 text-primary border-primary/30",
  },
};

const stats = [
  { label: "Total facturé", value: "13 535 000", unit: "FCFA" },
  { label: "Payé", value: "9 120 000", unit: "FCFA" },
  { label: "En attente", value: "4 415 000", unit: "FCFA" },
  { label: "Factures", value: "5", unit: "ce mois" },
];

export default function Factures() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Factures
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez et suivez toutes vos factures
            </p>
          </div>
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
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
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-heading mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.unit}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="paid">Payées</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="partial">Partielles</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Plus de filtres
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice, index) => {
                  const status = statusConfig[invoice.status];
                  return (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {invoice.number}
                      </TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {invoice.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.date}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.dueDate}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.amount)} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge className={status.class}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Envoyer par email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Enregistrer paiement
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Convertir en avoir
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
