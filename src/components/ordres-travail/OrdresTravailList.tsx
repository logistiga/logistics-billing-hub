import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { ordresTravailService } from "@/services/api";
import type { OrdreTravail as OrdreTravailAPI } from "@/services/api/types";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
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
  ReceiptText,
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
  Manutention: { icon: Forklift, color: "bg-blue-100 text-blue-700 border-blue-200" },
  Transport: { icon: Truck, color: "bg-amber-100 text-amber-700 border-amber-200" },
  Stockage: { icon: Warehouse, color: "bg-purple-100 text-purple-700 border-purple-200" },
  Location: { icon: Package, color: "bg-green-100 text-green-700 border-green-200" },
};

const statusConfig = {
  pending: { label: "En attente", icon: Clock, class: "bg-warning/20 text-warning" },
  in_progress: { label: "En cours", icon: Clock, class: "bg-primary/20 text-primary" },
  completed: { label: "Terminé", icon: CheckCircle2, class: "bg-success/20 text-success" },
  cancelled: { label: "Annulé", icon: XCircle, class: "bg-muted text-muted-foreground" },
  converted: { label: "Facturé", icon: FileCheck, class: "bg-cyan-500/20 text-cyan-600" },
};

interface OrdresTravailListProps {
  type: "Transport" | "Manutention" | "Stockage" | "Location";
  title: string;
  icon: LucideIcon;
}

export function OrdresTravailList({ type, title, icon: Icon }: OrdresTravailListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [orderToConvert, setOrderToConvert] = useState<WorkOrder | null>(null);
  const [emailAddress, setEmailAddress] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await ordresTravailService.getAll({ per_page: 100, type });
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
  }, [type]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", { style: "decimal", minimumFractionDigits: 0 }).format(value);
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.number || "").toLowerCase().includes(searchLower) ||
      (order.client || "").toLowerCase().includes(searchLower)
    );
  });

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
      description: `Ordre de travail ${selectedOrder?.number} envoyé avec succès`,
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
      setOrders(orders.map((o) =>
        o.id === orderToConvert.id
          ? { ...o, status: "converted" as const, invoiceNumber: result.invoice_number }
          : o
      ));
      toast.success(`Facture ${result.invoice_number} créée`);
      setConvertDialogOpen(false);
      setOrderToConvert(null);
      navigate("/factures");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la conversion en facture");
    }
  };

  const handleCancel = (order: WorkOrder) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (selectedOrder) {
      try {
        await ordresTravailService.cancel(parseInt(selectedOrder.id));
        setOrders(orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: "cancelled" as const } : o
        ));
        toast.success(`Ordre annulé`);
      } catch (error: any) {
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
        setOrders(orders.filter((o) => o.id !== selectedOrder.id));
        toast.success(`Ordre supprimé`);
      } catch (error: any) {
        toast.error(error?.message || "Erreur lors de la suppression");
      }
    }
    setDeleteDialogOpen(false);
  };

  const stats = {
    total: orders.length,
    enCours: orders.filter((o) => o.status === "in_progress").length,
    termines: orders.filter((o) => o.status === "completed").length,
    enAttente: orders.filter((o) => o.status === "pending").length,
    montantTotal: orders.reduce((sum, o) => sum + o.amount, 0),
  };

  const config = typeConfig[type];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title={title}
          subtitle={`Gérez vos ordres de travail de type ${type.toLowerCase()}`}
        >
          <Button onClick={() => navigate(`/ordres-travail/${type.toLowerCase()}/nouveau`)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel ordre
          </Button>
        </PageHeader>

        <StatCardGrid columns={4}>
          <StatCard title="Total" value={stats.total} icon={Icon} />
          <StatCard title="En cours" value={stats.enCours} icon={Clock} variant="warning" />
          <StatCard title="Terminés" value={stats.termines} icon={CheckCircle2} variant="success" />
          <StatCard
            title="Montant total"
            value={`${formatCurrency(stats.montantTotal)} FCFA`}
            icon={ReceiptText}
            variant="info"
          />
        </StatCardGrid>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun ordre de travail trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => {
                        const statusInfo = statusConfig[order.status];
                        const StatusIcon = statusInfo.icon;
                        return (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(order.id)}
                                onCheckedChange={() => handleSelectOne(order.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{order.number}</TableCell>
                            <TableCell>{order.client}</TableCell>
                            <TableCell>
                              {new Date(order.date).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo.class}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(order.amount)} FCFA
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Voir détails</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(order)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Modifier</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(order)}>
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Télécharger PDF</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleSendEmail(order)}>
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Envoyer par email</TooltipContent>
                                </Tooltip>
                                {order.status === "completed" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleConvertToInvoice(order)}
                                        className="text-primary"
                                      >
                                        <FileCheck className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Convertir en facture</TooltipContent>
                                  </Tooltip>
                                )}
                                {order.status !== "cancelled" && order.status !== "converted" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCancel(order)}
                                        className="text-warning"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Annuler</TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(order)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Supprimer</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'ordre {selectedOrder?.number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="font-medium">{selectedOrder.client}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {new Date(selectedOrder.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedOrder.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Montant</Label>
                  <p className="font-medium">{formatCurrency(selectedOrder.amount)} FCFA</p>
                </div>
              </div>
              {selectedOrder.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p>{selectedOrder.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer par email</DialogTitle>
            <DialogDescription>
              Envoyez l'ordre {selectedOrder?.number} par email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmSendEmail}>Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir en facture</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous convertir l'ordre {orderToConvert?.number} en facture ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvertToInvoice}>Convertir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l'ordre</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler l'ordre {selectedOrder?.number} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Oui, annuler</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'ordre</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Voulez-vous vraiment supprimer l'ordre{" "}
              {selectedOrder?.number} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
