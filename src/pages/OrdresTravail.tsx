import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  type: string;
  subType: string;
  date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  amount: number;
  description: string;
}

const mockOrders: WorkOrder[] = [
  {
    id: "1",
    number: "OT-2024-0089",
    client: "COMILOG SA",
    type: "Transport",
    subType: "Hors Libreville",
    date: "15/12/2024",
    status: "in_progress",
    amount: 2500000,
    description: "Transport de minerai vers Port-Gentil",
  },
  {
    id: "2",
    number: "OT-2024-0088",
    client: "OLAM Gabon",
    type: "Manutention",
    subType: "Chargement/Déchargement",
    date: "14/12/2024",
    status: "completed",
    amount: 850000,
    description: "Manutention containers au port",
  },
  {
    id: "3",
    number: "OT-2024-0087",
    client: "Total Energies",
    type: "Stockage",
    subType: "Entrepôt sécurisé",
    date: "14/12/2024",
    status: "pending",
    amount: 1200000,
    description: "Stockage équipements pétroliers",
  },
  {
    id: "4",
    number: "OT-2024-0086",
    client: "Assala Energy",
    type: "Transport",
    subType: "Exceptionnel",
    date: "13/12/2024",
    status: "completed",
    amount: 4500000,
    description: "Convoi exceptionnel équipement lourd",
  },
  {
    id: "5",
    number: "OT-2024-0085",
    client: "SEEG",
    type: "Location",
    subType: "Location engin",
    date: "12/12/2024",
    status: "cancelled",
    amount: 750000,
    description: "Location grue - Annulé",
  },
];

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
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function OrdresTravail() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Action states
  const [orders, setOrders] = useState<WorkOrder[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Action handlers
  const handleViewDetails = (order: WorkOrder) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleEdit = (order: WorkOrder) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleDownloadPDF = (order: WorkOrder) => {
    toast.success(`PDF généré pour ${order.number}`, {
      description: "Le téléchargement va commencer..."
    });
    setTimeout(() => {
      const element = document.createElement("a");
      element.setAttribute("href", "data:application/pdf;charset=utf-8,");
      element.setAttribute("download", `${order.number}.pdf`);
      element.click();
    }, 500);
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
    toast.success(`Converti en facture`, {
      description: `${order.number} a été converti en facture`
    });
  };

  const handleRecordPayment = (order: WorkOrder) => {
    setSelectedOrder(order);
    setPaymentAmount(order.amount.toString());
    setPaymentMethod("");
    setPaymentDialogOpen(true);
  };

  const confirmPayment = () => {
    if (!paymentMethod) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }
    toast.success(`Paiement enregistré`, {
      description: `${formatCurrency(Number(paymentAmount))} FCFA reçu pour ${selectedOrder?.number}`
    });
    setPaymentDialogOpen(false);
  };

  const handleCancel = (order: WorkOrder) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (selectedOrder) {
      setOrders(orders.map(o => 
        o.id === selectedOrder.id ? { ...o, status: "cancelled" as const } : o
      ));
      toast.success(`Ordre annulé`, {
        description: `${selectedOrder.number} a été annulé`
      });
    }
    setCancelDialogOpen(false);
  };

  const handleDelete = (order: WorkOrder) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      setOrders(orders.filter(o => o.id !== selectedOrder.id));
      toast.success(`Ordre supprimé`, {
        description: `${selectedOrder.number} a été supprimé définitivement`
      });
    }
    setDeleteDialogOpen(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Ordres de travail
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos connaissements et ordres de travail
            </p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/ordres-travail/nouveau")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel ordre
          </Button>
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

        {/* Orders Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
                  return (
                    <motion.tr
                      key={order.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {order.number}
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" title="Voir détails" onClick={() => handleViewDetails(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700" title="Modifier" onClick={() => handleEdit(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" title="Télécharger PDF" onClick={() => handleDownloadPDF(order)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-700" title="Envoyer par email" onClick={() => handleSendEmail(order)}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:text-indigo-700" title="Convertir en facture" onClick={() => handleConvertToInvoice(order)}>
                            <FileCheck className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-700" title="Enregistrer paiement" onClick={() => handleRecordPayment(order)}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-700" title="Annuler" onClick={() => handleCancel(order)} disabled={order.status === "cancelled"}>
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" title="Supprimer" onClick={() => handleDelete(order)}>
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
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>Paiement pour {selectedOrder?.number}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Montant (FCFA)</Label>
              <Input 
                type="number" 
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virement">Virement bancaire</SelectItem>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Annuler</Button>
            <Button onClick={confirmPayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </PageTransition>
  );
}
