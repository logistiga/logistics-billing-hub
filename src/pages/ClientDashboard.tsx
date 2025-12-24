import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Receipt,
  CreditCard,
  ClipboardList,
  Edit,
  Download,
  Send,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ReceiptText,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftRight,
  History,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AvoirCompensationHistory } from "@/components/AvoirCompensationHistory";

// Mock client data
const mockClientDetails = {
  id: "1",
  name: "COMILOG SA",
  nif: "123456789GA",
  rccm: "LBV/2020/B/12345",
  address: "Boulevard Triomphal, Immeuble Concorde",
  city: "Libreville",
  country: "Gabon",
  phone: "+241 01 76 00 00",
  email: "contact@comilog.ga",
  website: "www.comilog.ga",
  createdAt: "2020-03-15",
  contacts: [
    { id: "1", name: "Jean Mbou", email: "j.mbou@comilog.ga", phone: "+241 077 00 00 00", role: "Directeur Financier" },
    { id: "2", name: "Marie Ndong", email: "m.ndong@comilog.ga", phone: "+241 066 00 00 00", role: "Comptable" },
  ],
};

// Mock invoices
const mockInvoices = [
  { id: "FAC-2024-001", date: "2024-01-15", dueDate: "2024-02-15", amount: 2500000, status: "payée", description: "Prestation maintenance Q1" },
  { id: "FAC-2024-008", date: "2024-02-20", dueDate: "2024-03-20", amount: 1800000, status: "en attente", description: "Consultation technique" },
  { id: "FAC-2024-015", date: "2024-03-10", dueDate: "2024-04-10", amount: 3200000, status: "en retard", description: "Formation personnel" },
  { id: "FAC-2024-022", date: "2024-04-05", dueDate: "2024-05-05", amount: 1500000, status: "brouillon", description: "Support technique" },
];

// Mock quotes
const mockQuotes = [
  { id: "DEV-2024-003", date: "2024-01-20", validUntil: "2024-02-20", amount: 4500000, status: "accepté", description: "Projet installation réseau" },
  { id: "DEV-2024-012", date: "2024-03-15", validUntil: "2024-04-15", amount: 2800000, status: "en attente", description: "Audit sécurité" },
  { id: "DEV-2024-018", date: "2024-04-01", validUntil: "2024-05-01", amount: 1200000, status: "refusé", description: "Maintenance préventive" },
];

// Mock work orders
const mockWorkOrders = [
  { id: "OT-2024-005", date: "2024-01-25", client: "COMILOG SA", status: "terminé", amount: 2500000, description: "Installation équipements" },
  { id: "OT-2024-019", date: "2024-03-20", client: "COMILOG SA", status: "en cours", amount: 1800000, description: "Réparation système" },
  { id: "OT-2024-027", date: "2024-04-08", client: "COMILOG SA", status: "planifié", amount: 3200000, description: "Mise à jour logiciel" },
];

// Mock payments
const mockPayments = [
  { id: "PAY-2024-001", date: "2024-02-10", invoiceId: "FAC-2024-001", amount: 2500000, method: "Virement bancaire", reference: "VIR-123456" },
  { id: "PAY-2024-015", date: "2024-03-05", invoiceId: "FAC-2023-089", amount: 1500000, method: "Chèque", reference: "CHQ-789012" },
  { id: "PAY-2024-028", date: "2024-04-02", invoiceId: "FAC-2024-002", amount: 800000, method: "Espèces", reference: "ESP-345678" },
];

// Mock credit notes (avoirs)
interface CreditNote {
  id: string;
  number: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  reason: string;
  status: "pending" | "refunded" | "applied" | "cancelled";
  refundMethod?: string;
  refundDate?: string;
}

const mockCreditNotes: CreditNote[] = [
  { id: "1", number: "AV-2024-001", invoiceNumber: "FAC-2024-001", date: "2024-02-20", amount: 250000, reason: "Erreur de facturation", status: "applied" },
  { id: "2", number: "AV-2024-002", invoiceNumber: "FAC-2024-008", date: "2024-03-25", amount: 180000, reason: "Retour de matériel", status: "pending" },
];

const creditNoteStatusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: typeof CheckCircle }> = {
  pending: { variant: "secondary", label: "En attente", icon: Clock },
  refunded: { variant: "default", label: "Remboursé", icon: CheckCircle },
  applied: { variant: "default", label: "Compensé", icon: ArrowLeftRight },
  cancelled: { variant: "outline", label: "Annulé", icon: XCircle },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ClientDashboard() {
  const { id } = useParams();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [compensationHistoryOpen, setCompensationHistoryOpen] = useState(false);

  const client = mockClientDetails;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value) + " FCFA";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      "payée": { variant: "default", label: "Payée" },
      "en attente": { variant: "secondary", label: "En attente" },
      "en retard": { variant: "destructive", label: "En retard" },
      "brouillon": { variant: "outline", label: "Brouillon" },
      "accepté": { variant: "default", label: "Accepté" },
      "refusé": { variant: "destructive", label: "Refusé" },
      "terminé": { variant: "default", label: "Terminé" },
      "en cours": { variant: "secondary", label: "En cours" },
      "planifié": { variant: "outline", label: "Planifié" },
    };
    const config = statusConfig[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calculate totals with avoirs
  const totalInvoiced = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = mockPayments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalCreditNotes = mockCreditNotes.filter(cn => cn.status !== "cancelled").reduce((sum, cn) => sum + cn.amount, 0);
  const appliedCreditNotes = mockCreditNotes.filter(cn => cn.status === "applied").reduce((sum, cn) => sum + cn.amount, 0);
  
  // Balance = Factures - Paiements - Avoirs compensés
  const balance = totalInvoiced - totalPaid - appliedCreditNotes;
  const pendingQuotes = mockQuotes.filter(q => q.status === "en attente").length;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/clients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                {client.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  {client.name}
                </h1>
                <p className="text-muted-foreground">
                  Client depuis le {formatDate(client.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>

        {/* Summary Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total facturé</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvoiced)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total payé</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Solde dû</p>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(balance)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Devis en attente</p>
                    <p className="text-2xl font-bold text-foreground">{pendingQuotes}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Client Info & Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">NIF</p>
                <p className="font-medium">{client.nif}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RCCM</p>
                <p className="font-medium">{client.rccm}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{client.address}</p>
                  <p className="text-sm text-muted-foreground">{client.city}, {client.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{client.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{client.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contacts ({client.contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.contacts.map((contact) => (
                  <div key={contact.id} className="p-4 rounded-lg border border-border/50 bg-muted/30">
                    <p className="font-semibold text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">{contact.role}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for documents */}
        <Card className="border-border/50">
          <Tabs defaultValue="invoices" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="invoices" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Factures</span>
                  <Badge variant="secondary" className="ml-1">{mockInvoices.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="quotes" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <span className="hidden sm:inline">Devis</span>
                  <Badge variant="secondary" className="ml-1">{mockQuotes.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="avoirs" className="flex items-center gap-2">
                  <ReceiptText className="h-4 w-4" />
                  <span className="hidden sm:inline">Avoirs</span>
                  <Badge variant="secondary" className="ml-1">{mockCreditNotes.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="workorders" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Ordres</span>
                  <Badge variant="secondary" className="ml-1">{mockWorkOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Paiements</span>
                  <Badge variant="secondary" className="ml-1">{mockPayments.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="p-6 pt-4">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{invoice.description}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Quotes Tab */}
            <TabsContent value="quotes" className="p-6 pt-4">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>N° Devis</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Validité</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.id}</TableCell>
                        <TableCell>{formatDate(quote.date)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{quote.description}</TableCell>
                        <TableCell>{formatDate(quote.validUntil)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(quote.amount)}</TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Avoirs Tab */}
            <TabsContent value="avoirs" className="p-6 pt-4">
              <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total avoirs</p>
                      <p className="text-xl font-bold text-destructive">-{formatCurrency(totalCreditNotes)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Compensés (déduits du solde)</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(appliedCreditNotes)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setCompensationHistoryOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    Historique compensations
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>N° Avoir</TableHead>
                      <TableHead>Facture liée</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCreditNotes.map((creditNote) => {
                      const config = creditNoteStatusConfig[creditNote.status];
                      const StatusIcon = config.icon;
                      return (
                        <TableRow key={creditNote.id}>
                          <TableCell className="font-medium">{creditNote.number}</TableCell>
                          <TableCell className="text-muted-foreground">{creditNote.invoiceNumber}</TableCell>
                          <TableCell>{formatDate(creditNote.date)}</TableCell>
                          <TableCell className="text-right font-medium text-destructive">-{formatCurrency(creditNote.amount)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{creditNote.reason}</TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Work Orders Tab */}
            <TabsContent value="workorders" className="p-6 pt-4">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>N° Ordre</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWorkOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{order.description}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(order.amount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="p-6 pt-4">
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Référence</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Facture liée</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.reference}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.invoiceId}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Historique des compensations */}
        <AvoirCompensationHistory
          open={compensationHistoryOpen}
          onOpenChange={setCompensationHistoryOpen}
          clientId={client.id}
        />
      </div>
    </PageTransition>
  );
}
