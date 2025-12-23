import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Clock,
  Truck,
  Forklift,
  Warehouse,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Interface pour les ordres en attente (données externes)
interface PendingOrder {
  id: string;
  externalRef: string;
  client: string;
  type: string;
  subType: string;
  requestDate: string;
  estimatedAmount: number;
  description: string;
  priority: "low" | "medium" | "high";
  source: string;
}

// Données mockées simulant l'API externe
const mockPendingOrders: PendingOrder[] = [
  {
    id: "ext-001",
    externalRef: "REQ-2024-1234",
    client: "COMILOG SA",
    type: "Transport",
    subType: "Hors Libreville",
    requestDate: "2024-12-20",
    estimatedAmount: 3500000,
    description: "Transport de 50 tonnes de manganèse vers Owendo",
    priority: "high",
    source: "Système central",
  },
  {
    id: "ext-002",
    externalRef: "REQ-2024-1235",
    client: "OLAM Gabon",
    type: "Manutention",
    subType: "Chargement/Déchargement",
    requestDate: "2024-12-19",
    estimatedAmount: 1200000,
    description: "Déchargement containers huile de palme",
    priority: "medium",
    source: "Portail client",
  },
  {
    id: "ext-003",
    externalRef: "REQ-2024-1236",
    client: "Total Energies",
    type: "Stockage",
    subType: "Entrepôt sécurisé",
    requestDate: "2024-12-18",
    estimatedAmount: 2800000,
    description: "Stockage temporaire équipements offshore",
    priority: "high",
    source: "Système central",
  },
  {
    id: "ext-004",
    externalRef: "REQ-2024-1237",
    client: "Assala Energy",
    type: "Transport",
    subType: "Exceptionnel",
    requestDate: "2024-12-17",
    estimatedAmount: 5200000,
    description: "Transport convoi exceptionnel - Turbine",
    priority: "high",
    source: "Email",
  },
  {
    id: "ext-005",
    externalRef: "REQ-2024-1238",
    client: "SEEG",
    type: "Location",
    subType: "Location engin",
    requestDate: "2024-12-16",
    estimatedAmount: 950000,
    description: "Location grue pour chantier électrique",
    priority: "low",
    source: "Portail client",
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

const priorityConfig = {
  low: { label: "Basse", class: "bg-muted text-muted-foreground" },
  medium: { label: "Moyenne", class: "bg-warning/20 text-warning" },
  high: { label: "Haute", class: "bg-destructive/20 text-destructive" },
};

export default function OrdresEnAttente() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(mockPendingOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [creatingOrderId, setCreatingOrderId] = useState<string | null>(null);

  // Simuler le refresh depuis l'API externe
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulation d'appel API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Données synchronisées", {
      description: "Les ordres en attente ont été actualisés depuis le système externe",
    });
    setIsLoading(false);
  };

  const filteredOrders = pendingOrders.filter((order) => {
    const matchesSearch =
      order.externalRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleViewDetails = (order: PendingOrder) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleCreateOrder = async (order: PendingOrder) => {
    setCreatingOrderId(order.id);
    // Simulation de création d'ordre
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Ordre de travail créé", {
      description: `L'ordre ${order.externalRef} a été créé avec succès`,
    });
    
    // Retirer l'ordre de la liste des attentes
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
    setSelectedIds((prev) => prev.filter((id) => id !== order.id));
    setCreatingOrderId(null);
  };

  const handleCreateSelected = async () => {
    if (selectedIds.length === 0) return;
    
    setIsLoading(true);
    // Simulation de création groupée
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success(`${selectedIds.length} ordre(s) créé(s)`, {
      description: "Les ordres de travail ont été créés avec succès",
    });
    
    setPendingOrders((prev) => prev.filter((o) => !selectedIds.includes(o.id)));
    setSelectedIds([]);
    setIsLoading(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Ordres en attente
            </h1>
            <p className="text-muted-foreground mt-1">
              Ordres récupérés du système externe en attente de création
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Synchroniser
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
                  <p className="text-sm text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pendingOrders.filter((o) => o.priority === "high").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Priorité haute</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pendingOrders.filter((o) => o.type === "Transport").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Transports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(pendingOrders.reduce((sum, o) => sum + o.estimatedAmount, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">FCFA estimé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, client ou description..."
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
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Selection Actions */}
        {selectedIds.length > 0 && (
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
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                Annuler
              </Button>
              <Button
                size="sm"
                variant="gradient"
                onClick={handleCreateSelected}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Créer les ordres sélectionnés
              </Button>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Date demande</TableHead>
                  <TableHead>Montant estimé</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Chargement des données...
                        </div>
                      ) : (
                        "Aucun ordre en attente"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, index) => {
                    const typeInfo = typeConfig[order.type as keyof typeof typeConfig];
                    const TypeIcon = typeInfo?.icon || Package;
                    const priorityInfo = priorityConfig[order.priority];

                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(order.id)}
                            onCheckedChange={() => handleSelectOne(order.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {order.externalRef}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{order.client}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${typeInfo?.color || ""} flex items-center gap-1 w-fit`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {order.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityInfo.class}>
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.requestDate)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.estimatedAmount)} FCFA
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {order.source}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewDetails(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Voir détails</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="gradient"
                                  size="sm"
                                  onClick={() => handleCreateOrder(order)}
                                  disabled={creatingOrderId === order.id}
                                >
                                  {creatingOrderId === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Créer
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Créer l'ordre de travail</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
              <DialogDescription>
                Référence externe: {selectedOrder?.externalRef}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedOrder.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedOrder.type} - {selectedOrder.subType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de demande</p>
                    <p className="font-medium">{formatDate(selectedOrder.requestDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant estimé</p>
                    <p className="font-medium">{formatCurrency(selectedOrder.estimatedAmount)} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priorité</p>
                    <Badge className={priorityConfig[selectedOrder.priority].class}>
                      {priorityConfig[selectedOrder.priority].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium">{selectedOrder.source}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{selectedOrder.description}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Fermer
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  if (selectedOrder) {
                    handleCreateOrder(selectedOrder);
                    setViewDialogOpen(false);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer l'ordre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
