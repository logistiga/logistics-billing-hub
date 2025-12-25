import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ordresTravailService, clientsService } from "@/services/api";
import type { OrdreTravail as OrdreTravailAPI, Client } from "@/services/api/types";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  Truck,
  Package,
  Warehouse,
  Forklift,
  Ban,
  CreditCard,
  AlertTriangle,
  CircleDollarSign,
  ReceiptText,
  ClipboardList,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { PaymentDialog, type PayableDocument, type Payment } from "@/components/PaymentDialog";
import { PaymentHistory, mockPaymentHistory, type PaymentRecord } from "@/components/PaymentHistory";

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  clientId: string;
  type: string;
  subType: string;
  date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "converted";
  amount: number;
  paid: number;
  advance: number;
  description: string;
  invoiceNumber?: string;
}

// Fonction pour mapper les ordres API vers le format local
const mapApiOrderToWorkOrder = (ordre: any): WorkOrder => ({
  id: String(ordre.id),
  number: ordre.numero || ordre.number || `OT-${ordre.id}`,
  client: ordre.client?.name || `Client ${ordre.client_id}`,
  clientId: String(ordre.client_id),
  type: ordre.type,
  subType: "",
  date: ordre.date,
  status: ordre.status as WorkOrder["status"],
  amount: Number(ordre.total) || Number(ordre.amount) || 0,
  paid: 0,
  advance: 0,
  description: ordre.description || "",
});

const typeConfig = {
  Manutention: {
    icon: Forklift,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Transport: {
    icon: Truck,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  Stockage: {
    icon: Warehouse,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  Location: {
    icon: Package,
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

const statusConfig = {
  pending: {
    label: "En attente",
    icon: Clock,
    class: "bg-warning/20 text-warning",
  },
  in_progress: {
    label: "En cours",
    icon: Clock,
    class: "bg-primary/20 text-primary",
  },
  completed: {
    label: "Terminé",
    icon: CheckCircle2,
    class: "bg-success/20 text-success",
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    class: "bg-muted text-muted-foreground",
  },
  converted: {
    label: "Facturé",
    icon: FileCheck,
    class: "bg-cyan-500/20 text-cyan-600",
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function OrdresTravail() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Action states
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  
  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"single" | "group" | "advance">("single");
  const [paymentDocuments, setPaymentDocuments] = useState<PayableDocument[]>([]);
  
  // Payment history states
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState<WorkOrder | null>(null);

  // Avoir dialog states
  const [avoirDialogOpen, setAvoirDialogOpen] = useState(false);
  const [selectedOrderForAvoir, setSelectedOrderForAvoir] = useState<WorkOrder | null>(null);
  const [avoirAmount, setAvoirAmount] = useState("");
  const [avoirReason, setAvoirReason] = useState("");

  // Convert to invoice dialog state
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [orderToConvert, setOrderToConvert] = useState<WorkOrder | null>(null);

  // Charger les ordres depuis l'API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await ordresTravailService.getAll({ per_page: 100 });
        const mappedOrders = (response.data || []).map(mapApiOrderToWorkOrder);
        setOrders(mappedOrders);
      } catch (error) {
        console.error("Erreur chargement ordres:", error);
        toast.error("Erreur lors du chargement des ordres de travail");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleViewHistory = (order: WorkOrder) => {
    setSelectedOrderForHistory(order);
    setHistoryDialogOpen(true);
  };

  const getPaymentHistory = (orderNumber: string): PaymentRecord[] => {
    return mockPaymentHistory[orderNumber] || [];
  };

  // Avoir handlers
  const handleCreateAvoir = (order: WorkOrder) => {
    setSelectedOrderForAvoir(order);
    setAvoirAmount("");
    setAvoirReason("");
    setAvoirDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const confirmCreateAvoir = () => {
    if (!selectedOrderForAvoir) return;
    
    const amount = parseFloat(avoirAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    
    if (amount > selectedOrderForAvoir.amount) {
      toast.error("Le montant de l'avoir ne peut pas dépasser le montant de l'ordre");
      return;
    }
    
    if (!avoirReason.trim()) {
      toast.error("Veuillez indiquer le motif de l'avoir");
      return;
    }

    // Générer le numéro d'avoir
    const year = new Date().getFullYear();
    const avoirNumber = `AV-${year}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`;

    toast.success(`Avoir ${avoirNumber} créé`, {
      description: `${formatCurrency(amount)} FCFA pour l'ordre ${selectedOrderForAvoir.number}`,
    });

    setAvoirDialogOpen(false);
    navigate("/avoirs");
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (order.number || "").toLowerCase().includes(searchLower) ||
      (order.client || "").toLowerCase().includes(searchLower);
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = selectedIds.length === filteredOrders.length && filteredOrders.length > 0;
  const isSomeSelected = selectedIds.length > 0;


  // Action handlers
  const handleViewDetails = (order: WorkOrder) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleEdit = (order: WorkOrder) => {
    navigate(`/ordres-travail/${order.id}/editer`);
  };

  const handleDownloadPDF = async (order: WorkOrder) => {
    try {
      toast.info(`Génération du PDF pour ${order.number}...`);
      const blob = await ordresTravailService.downloadPdf(parseInt(order.id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${order.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`PDF téléchargé pour ${order.number}`);
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      toast.error("Erreur lors du téléchargement du PDF");
    }
  };

  const handleSendEmail = (order: WorkOrder) => {
    setSelectedOrder(order);
    setEmailAddress("");
    setEmailDialogOpen(true);
  };

  const confirmSendEmail = () => {
    if (!emailAddress) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    toast.success(`Email envoyé à ${emailAddress}`, {
      description: `Ordre de travail ${selectedOrder?.number} envoyé avec succès`
    });
    setEmailDialogOpen(false);
  };

  const handleConvertToInvoice = (order: WorkOrder) => {
    setOrderToConvert(order);
    setConvertDialogOpen(true);
  };

  const confirmConvertToInvoice = async () => {
    if (!orderToConvert) return;

    try {
      const result = await ordresTravailService.convertToInvoice(parseInt(orderToConvert.id));

      // Mettre à jour l'ordre localement
      setOrders(orders.map(o => 
        o.id === orderToConvert.id 
          ? { ...o, status: "converted" as const, invoiceNumber: result.invoice_number } 
          : o
      ));

      toast.success(`Facture ${result.invoice_number} créée`, {
        description: `L'ordre ${orderToConvert.number} a été converti en facture`,
      });

      setConvertDialogOpen(false);
      setOrderToConvert(null);
      
      // Redirect to invoices page
      navigate("/factures");
    } catch (error: any) {
      console.error("Erreur conversion:", error);
      toast.error(error?.message || "Erreur lors de la conversion en facture");
    }
  };

  const toPayableDocument = (order: WorkOrder): PayableDocument => ({
    id: order.id,
    number: order.number,
    client: order.client,
    clientId: order.clientId,
    date: order.date,
    amount: order.amount,
    paid: order.paid + order.advance,
    type: "ordre",
    documentType: order.type,
  });

  const handleRecordPayment = (order: WorkOrder) => {
    setPaymentDocuments([toPayableDocument(order)]);
    setPaymentMode("single");
    setPaymentDialogOpen(true);
  };

  const handleAdvancePayment = (order: WorkOrder) => {
    setPaymentDocuments([toPayableDocument(order)]);
    setPaymentMode("advance");
    setPaymentDialogOpen(true);
  };

  const handleGroupPayment = () => {
    const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
    if (selectedOrders.length < 2) {
      toast.error("Sélection insuffisante", {
        description: "Sélectionnez au moins 2 ordres pour un paiement groupé",
      });
      return;
    }
    
    // Vérifier que tous les ordres sont du même client
    const clientIds = new Set(selectedOrders.map((o) => o.clientId));
    if (clientIds.size > 1) {
      toast.error("Clients différents", {
        description: "Le paiement groupé n'est possible que pour un seul client. Sélectionnez des ordres du même client.",
      });
      return;
    }
    
    setPaymentDocuments(selectedOrders.map(toPayableDocument));
    setPaymentMode("group");
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = (payment: Payment, updatedDocs: PayableDocument[]) => {
    setOrders((prev) =>
      prev.map((order) => {
        const updatedDoc = updatedDocs.find((d) => d.id === order.id);
        if (!updatedDoc) return order;
        
        if (payment.isAdvance) {
          return { ...order, advance: order.advance + payment.amount };
        }
        return { ...order, paid: updatedDoc.paid };
      })
    );
    setSelectedIds([]);
  };

  const handleCancel = (order: WorkOrder) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (selectedOrder) {
      try {
        await ordresTravailService.cancel(parseInt(selectedOrder.id));
        setOrders(orders.map(o => 
          o.id === selectedOrder.id ? { ...o, status: "cancelled" as const } : o
        ));
        toast.success(`Ordre annulé`, {
          description: `${selectedOrder.number} a été annulé`
        });
      } catch (error: any) {
        console.error("Erreur annulation:", error);
        toast.error(error?.message || "Erreur lors de l'annulation");
      }
    }
    setCancelDialogOpen(false);
  };

  const handleDelete = (order: WorkOrder) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedOrder) {
      try {
        await ordresTravailService.delete(parseInt(selectedOrder.id));
        setOrders(orders.filter(o => o.id !== selectedOrder.id));
        toast.success(`Ordre supprimé`, {
          description: `${selectedOrder.number} a été supprimé définitivement`
        });
      } catch (error: any) {
        console.error("Erreur suppression:", error);
        toast.error(error?.message || "Erreur lors de la suppression");
      }
    }
    setDeleteDialogOpen(false);
  };

  // Calcul des statistiques
  const stats = {
    total: orders.length,
    enCours: orders.filter(o => o.status === "in_progress").length,
    termines: orders.filter(o => o.status === "completed").length,
    enAttente: orders.filter(o => o.status === "pending").length,
    montantTotal: orders.reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header Premium */}
        <PageHeader
          title="Ordres de travail"
          subtitle="Gérez vos connaissements et ordres de travail"
          icon={ClipboardList}
          badges={[
            { label: "En cours", value: stats.enCours, variant: "info" },
            { label: "Terminés", value: stats.termines, variant: "success" },
            { label: "En attente", value: stats.enAttente, variant: "warning" },
          ]}
        >
          <Button variant="gradient" onClick={() => navigate("/ordres-travail/nouveau")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel ordre
          </Button>
        </PageHeader>

        {/* Stats Cards */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Total ordres"
            value={stats.total}
            unit="ordres"
            icon={ClipboardList}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="En cours"
            value={stats.enCours}
            unit="ordres actifs"
            icon={Clock}
            variant="info"
            delay={0.1}
          />
          <StatCard
            title="Terminés"
            value={stats.termines}
            unit="ce mois"
            icon={CheckCircle2}
            variant="success"
            delay={0.2}
          />
          <StatCard
            title="Montant total"
            value={new Intl.NumberFormat("fr-GA").format(stats.montantTotal)}
            unit="FCFA"
            icon={CreditCard}
            variant="warning"
            change="+8.2%"
            trend="up"
            delay={0.3}
          />
        </StatCardGrid>

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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Manutention">Manutention</SelectItem>
              <SelectItem value="Stockage">Stockage</SelectItem>
              <SelectItem value="Location">Location</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
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
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedIds.length} ordre(s) sélectionné(s)
              </span>
              <span className="text-sm text-muted-foreground">
                - Total:{" "}
                {formatCurrency(
                  orders
                    .filter((o) => selectedIds.includes(o.id))
                    .reduce((sum, o) => sum + (o.amount - o.paid - o.advance), 0)
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

        {/* Orders Table */}
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
                  <TableHead>Sous-type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => {
                  const config = typeConfig[order.type as keyof typeof typeConfig];
                  const TypeIcon = config?.icon || Truck;
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  const isSelected = selectedIds.includes(order.id);
                  const hasPaidNotTransferred = (order.paid > 0 || order.advance > 0);
                  return (
                    <motion.tr
                      key={order.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className={`group hover:bg-muted/50 cursor-pointer ${isSelected ? "bg-primary/5" : ""} ${hasPaidNotTransferred ? "bg-emerald-50/50" : ""}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectOne(order.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {order.number}
                          {hasPaidNotTransferred && (
                            <span className="flex items-center gap-1 text-emerald-600" title="Paiement reçu - Non transféré en facture">
                              <CircleDollarSign className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{order.client}</TableCell>
                      <TableCell>
                        <Badge className={`${config?.color || "bg-muted"} border`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.subType}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.date}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(order.amount)} FCFA
                      </TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${status.class}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voir détails & historique</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(order)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Modifier</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadPDF(order)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Télécharger PDF</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSendEmail(order)}>
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Envoyer par email</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRecordPayment(order)}>
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Enregistrer paiement / avance</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleConvertToInvoice(order)}>
                                <FileCheck className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Convertir en facture</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-orange-500 hover:text-orange-600" 
                                onClick={() => handleCreateAvoir(order)}
                              >
                                <ReceiptText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Créer un avoir</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => handleCancel(order)}
                                disabled={order.status === "cancelled"}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Annuler</TooltipContent>
                          </Tooltip>
                          {/* Ne pas supprimer si paiement existant ou converti en facture */}
                          {order.paid === 0 && order.advance === 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive" 
                                  onClick={() => handleDelete(order)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Supprimer</TooltipContent>
                            </Tooltip>
                          )}
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l'ordre de travail</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Numéro</Label>
                  <p className="font-medium">{selectedOrder.number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Client</Label>
                  <p className="font-medium">{selectedOrder.client}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Type</Label>
                  <p className="font-medium">{selectedOrder.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Sous-type</Label>
                  <p className="font-medium">{selectedOrder.subType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Date</Label>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Montant</Label>
                  <p className="font-medium">{formatCurrency(selectedOrder.amount)} FCFA</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="font-medium">{selectedOrder.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Statut</Label>
                <Badge className={statusConfig[selectedOrder.status].class + " mt-1"}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'ordre de travail</DialogTitle>
            <DialogDescription>Modifier les informations de {selectedOrder?.number}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Input defaultValue={selectedOrder.client} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={selectedOrder.description} />
              </div>
              <div className="space-y-2">
                <Label>Montant (FCFA)</Label>
                <Input type="number" defaultValue={selectedOrder.amount} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={() => {
              toast.success("Modifications enregistrées");
              setEditDialogOpen(false);
            }}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer par email</DialogTitle>
            <DialogDescription>Envoyer {selectedOrder?.number} par email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Adresse email</Label>
              <Input 
                type="email" 
                placeholder="exemple@email.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Annuler</Button>
            <Button onClick={confirmSendEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        documents={paymentDocuments}
        onPaymentComplete={handlePaymentComplete}
        mode={paymentMode}
      />

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Annuler l'ordre de travail
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler {selectedOrder?.number} ? Cette action changera le statut en "Annulé".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-amber-500 hover:bg-amber-600">
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Supprimer l'ordre de travail
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedOrder?.number} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment History Dialog */}
      {selectedOrderForHistory && (
        <PaymentHistory
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          documentNumber={selectedOrderForHistory.number}
          documentType="ordre"
          client={selectedOrderForHistory.client}
          totalAmount={selectedOrderForHistory.amount}
          payments={getPaymentHistory(selectedOrderForHistory.number)}
        />
      )}

      {/* Avoir Dialog */}
      <Dialog open={avoirDialogOpen} onOpenChange={setAvoirDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-orange-500" />
              Créer un avoir
            </DialogTitle>
            <DialogDescription>
              {selectedOrderForAvoir && (
                <>
                  Créer un avoir pour l'ordre <strong>{selectedOrderForAvoir.number}</strong>
                  <br />
                  Client: {selectedOrderForAvoir.client} • Montant: {formatCurrency(selectedOrderForAvoir.amount)} FCFA
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="avoirAmountOT">Montant de l'avoir (FCFA) *</Label>
              <Input
                id="avoirAmountOT"
                type="number"
                placeholder="Ex: 150000"
                value={avoirAmount}
                onChange={(e) => setAvoirAmount(e.target.value)}
              />
              {selectedOrderForAvoir && (
                <p className="text-xs text-muted-foreground">
                  Maximum: {formatCurrency(selectedOrderForAvoir.amount)} FCFA
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="avoirReasonOT">Motif de l'avoir *</Label>
              <Textarea
                id="avoirReasonOT"
                placeholder="Ex: Erreur de facturation, retour de marchandise, remise commerciale..."
                value={avoirReason}
                onChange={(e) => setAvoirReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAvoirDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmCreateAvoir} className="bg-orange-500 hover:bg-orange-600">
              <ReceiptText className="h-4 w-4 mr-2" />
              Créer l'avoir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Invoice Confirmation Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-cyan-500" />
              Convertir en facture
            </AlertDialogTitle>
            <AlertDialogDescription>
              {orderToConvert && (
                <>
                  Êtes-vous sûr de vouloir convertir l'ordre <strong>{orderToConvert.number}</strong> en facture ?
                  <br /><br />
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client:</span>
                      <span className="font-medium text-foreground">{orderToConvert.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground">{orderToConvert.type} - {orderToConvert.subType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant:</span>
                      <span className="font-medium text-foreground">{formatCurrency(orderToConvert.amount)} FCFA</span>
                    </div>
                    {orderToConvert.advance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avance reçue:</span>
                        <span className="font-medium text-green-600">-{formatCurrency(orderToConvert.advance)} FCFA</span>
                      </div>
                    )}
                  </div>
                  <br />
                  Cette action changera le statut de l'ordre en "Facturé" et créera une nouvelle facture.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConvertToInvoice}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Convertir en facture
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
