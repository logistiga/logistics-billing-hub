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
  CreditCard,
  ArrowRightLeft,
  CheckSquare,
  Banknote,
  Clock,
  Layers,
  Receipt,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PaymentDialog, type PayableDocument, type Payment } from "@/components/PaymentDialog";
import { PaymentHistory, mockPaymentHistory, type PaymentRecord } from "@/components/PaymentHistory";
import { toast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  number: string;
  client: string;
  clientId: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  advance: number;
  status: "paid" | "pending" | "overdue" | "partial" | "advance";
  type: "Manutention" | "Transport" | "Stockage" | "Location";
}

const initialInvoices: Invoice[] = [
  {
    id: "1",
    number: "FAC-2024-0142",
    client: "COMILOG SA",
    clientId: "c1",
    date: "14/12/2024",
    dueDate: "14/01/2025",
    amount: 3250000,
    paid: 3250000,
    advance: 0,
    status: "paid",
    type: "Transport",
  },
  {
    id: "2",
    number: "FAC-2024-0141",
    client: "OLAM Gabon",
    clientId: "c2",
    date: "13/12/2024",
    dueDate: "13/01/2025",
    amount: 1875000,
    paid: 0,
    advance: 500000,
    status: "advance",
    type: "Manutention",
  },
  {
    id: "3",
    number: "FAC-2024-0140",
    client: "Total Energies",
    clientId: "c3",
    date: "12/12/2024",
    dueDate: "12/01/2025",
    amount: 5420000,
    paid: 5420000,
    advance: 0,
    status: "paid",
    type: "Transport",
  },
  {
    id: "4",
    number: "FAC-2024-0139",
    client: "Assala Energy",
    clientId: "c4",
    date: "10/12/2024",
    dueDate: "10/01/2025",
    amount: 2100000,
    paid: 0,
    advance: 0,
    status: "overdue",
    type: "Stockage",
  },
  {
    id: "5",
    number: "FAC-2024-0138",
    client: "SEEG",
    clientId: "c5",
    date: "09/12/2024",
    dueDate: "09/01/2025",
    amount: 890000,
    paid: 450000,
    advance: 0,
    status: "partial",
    type: "Location",
  },
  {
    id: "6",
    number: "FAC-2024-0137",
    client: "OLAM Gabon",
    clientId: "c2",
    date: "08/12/2024",
    dueDate: "08/01/2025",
    amount: 2350000,
    paid: 0,
    advance: 0,
    status: "pending",
    type: "Transport",
  },
  {
    id: "7",
    number: "FAC-2024-0136",
    client: "OLAM Gabon",
    clientId: "c2",
    date: "05/12/2024",
    dueDate: "05/01/2025",
    amount: 1200000,
    paid: 0,
    advance: 0,
    status: "pending",
    type: "Manutention",
  },
];

const statusConfig = {
  paid: {
    label: "Payée",
    class: "bg-success text-success-foreground",
  },
  pending: {
    label: "En attente",
    class: "bg-warning/20 text-warning border-warning/30",
  },
  overdue: {
    label: "En retard",
    class: "bg-destructive text-destructive-foreground",
  },
  partial: {
    label: "Partielle",
    class: "bg-primary/20 text-primary border-primary/30",
  },
  advance: {
    label: "Avance",
    class: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30",
  },
};

export default function Factures() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"single" | "group" | "advance">("single");
  const [paymentDocuments, setPaymentDocuments] = useState<PayableDocument[]>([]);
  
  // Payment history states
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState<Invoice | null>(null);

  const handleViewHistory = (invoice: Invoice) => {
    setSelectedInvoiceForHistory(invoice);
    setHistoryDialogOpen(true);
  };

  const getPaymentHistory = (invoiceNumber: string): PaymentRecord[] => {
    return mockPaymentHistory[invoiceNumber] || [];
  };

  const filteredInvoices = invoices.filter((invoice) => {
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

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((inv) => inv.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0;
  const isSomeSelected = selectedIds.length > 0;

  // Convert invoice to payable document
  const toPayableDocument = (inv: Invoice): PayableDocument => ({
    id: inv.id,
    number: inv.number,
    client: inv.client,
    clientId: inv.clientId,
    date: inv.date,
    amount: inv.amount,
    paid: inv.paid + inv.advance,
    type: "facture",
    documentType: inv.type,
  });

  // Payment handlers
  const handleSinglePayment = (invoice: Invoice) => {
    setPaymentDocuments([toPayableDocument(invoice)]);
    setPaymentMode("single");
    setPaymentDialogOpen(true);
  };

  const handleAdvancePayment = (invoice: Invoice) => {
    setPaymentDocuments([toPayableDocument(invoice)]);
    setPaymentMode("advance");
    setPaymentDialogOpen(true);
  };

  const handleGroupPayment = () => {
    const selectedInvoices = invoices.filter((inv) => selectedIds.includes(inv.id));
    if (selectedInvoices.length < 2) {
      toast({
        title: "Sélection insuffisante",
        description: "Sélectionnez au moins 2 factures pour un paiement groupé",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier que toutes les factures sont du même client
    const clientIds = new Set(selectedInvoices.map((inv) => inv.clientId));
    if (clientIds.size > 1) {
      toast({
        title: "Clients différents",
        description: "Le paiement groupé n'est possible que pour un seul client. Sélectionnez des factures du même client.",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentDocuments(selectedInvoices.map(toPayableDocument));
    setPaymentMode("group");
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = (payment: Payment, updatedDocs: PayableDocument[]) => {
    // Update invoices with new payment amounts
    setInvoices((prev) =>
      prev.map((inv) => {
        const updatedDoc = updatedDocs.find((d) => d.id === inv.id);
        if (!updatedDoc) return inv;

        const newPaid = updatedDoc.paid;
        const remaining = inv.amount - newPaid;
        
        let newStatus: Invoice["status"];
        if (payment.isAdvance) {
          newStatus = "advance";
          return { ...inv, advance: inv.advance + payment.amount, status: newStatus };
        } else if (remaining <= 0) {
          newStatus = "paid";
        } else if (newPaid > 0) {
          newStatus = "partial";
        } else {
          newStatus = inv.status;
        }

        return { ...inv, paid: newPaid, status: newStatus };
      })
    );

    setSelectedIds([]);
  };

  // Calculate stats
  const stats = [
    {
      label: "Total facturé",
      value: formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0)),
      unit: "FCFA",
    },
    {
      label: "Payé",
      value: formatCurrency(invoices.reduce((sum, inv) => sum + inv.paid, 0)),
      unit: "FCFA",
    },
    {
      label: "Avances reçues",
      value: formatCurrency(invoices.reduce((sum, inv) => sum + inv.advance, 0)),
      unit: "FCFA",
    },
    {
      label: "En attente",
      value: formatCurrency(
        invoices.reduce((sum, inv) => sum + (inv.amount - inv.paid - inv.advance), 0)
      ),
      unit: "FCFA",
    },
  ];

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
          <div className="flex gap-2">
            {isSomeSelected && (
              <Button variant="outline" onClick={handleGroupPayment}>
                <Layers className="h-4 w-4 mr-2" />
                Paiement groupé ({selectedIds.length})
              </Button>
            )}
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle facture
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
              <SelectItem value="advance">Avec avance</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Plus de filtres
          </Button>
        </div>

        {/* Selection Info */}
        {isSomeSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedIds.length} facture(s) sélectionnée(s)
              </span>
              <span className="text-sm text-muted-foreground">
                - Total:{" "}
                {formatCurrency(
                  invoices
                    .filter((inv) => selectedIds.includes(inv.id))
                    .reduce((sum, inv) => sum + (inv.amount - inv.paid - inv.advance), 0)
                )}{" "}
                FCFA restant
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleGroupPayment}>
                <CreditCard className="h-4 w-4 mr-2" />
                Payer la sélection
              </Button>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Payé/Avance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice, index) => {
                  const status = statusConfig[invoice.status];
                  const remaining = invoice.amount - invoice.paid - invoice.advance;
                  const isSelected = selectedIds.includes(invoice.id);

                  return (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group hover:bg-muted/50 cursor-pointer ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectOne(invoice.id)}
                        />
                      </TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          {invoice.paid > 0 && (
                            <span className="text-success text-sm">
                              {formatCurrency(invoice.paid)}
                            </span>
                          )}
                          {invoice.advance > 0 && (
                            <span className="text-cyan-600 text-xs">
                              +{formatCurrency(invoice.advance)} avance
                            </span>
                          )}
                          {remaining > 0 && (
                            <span className="text-muted-foreground text-xs">
                              Reste: {formatCurrency(remaining)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.class}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" title="Voir">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700" title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" title="Télécharger PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-700" title="Envoyer par email">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-700" title="Enregistrer paiement" onClick={() => handleSinglePayment(invoice)}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500 hover:text-cyan-700" title="Enregistrer avance" onClick={() => handleAdvancePayment(invoice)}>
                            <Banknote className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary/80" title="Historique paiements" onClick={() => handleViewHistory(invoice)}>
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:text-indigo-700" title="Convertir en avoir">
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        documents={paymentDocuments}
        onPaymentComplete={handlePaymentComplete}
        mode={paymentMode}
      />

      {/* Payment History Dialog */}
      {selectedInvoiceForHistory && (
        <PaymentHistory
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          documentNumber={selectedInvoiceForHistory.number}
          documentType="facture"
          client={selectedInvoiceForHistory.client}
          totalAmount={selectedInvoiceForHistory.amount}
          payments={getPaymentHistory(selectedInvoiceForHistory.number)}
        />
      )}
    </PageTransition>
  );
}
