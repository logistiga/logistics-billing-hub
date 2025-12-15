import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
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
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  type: "Manutention" | "Transport" | "Stockage" | "Location";
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
    subType: "Transport Hors Libreville",
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
    subType: "Transport Exceptionnel",
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

const typeIcons = {
  Manutention: Forklift,
  Transport: Truck,
  Stockage: Warehouse,
  Location: Package,
};

const typeColors = {
  Manutention: "bg-blue-100 text-blue-700 border-blue-200",
  Transport: "bg-amber-100 text-amber-700 border-amber-200",
  Stockage: "bg-purple-100 text-purple-700 border-purple-200",
  Location: "bg-green-100 text-green-700 border-green-200",
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

export default function OrdresTravail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const filteredOrders = mockOrders.filter((order) => {
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel ordre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Nouvel ordre de travail
                </DialogTitle>
                <DialogDescription>
                  Sélectionnez le type de prestation
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                {!selectedType ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(typeIcons).map(([type, Icon]) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 ${typeColors[type as keyof typeof typeColors]}`}
                      >
                        <Icon className="h-8 w-8 mx-auto mb-3" />
                        <p className="font-semibold">{type}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedType("")}
                      >
                        ← Retour
                      </Button>
                      <Badge className={typeColors[selectedType as keyof typeof typeColors]}>
                        {selectedType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Client *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comilog">COMILOG SA</SelectItem>
                            <SelectItem value="olam">OLAM Gabon</SelectItem>
                            <SelectItem value="total">Total Energies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Sous-type *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Type de prestation" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType === "Transport" && (
                              <>
                                <SelectItem value="hors-lbv">Hors Libreville</SelectItem>
                                <SelectItem value="import">Import</SelectItem>
                                <SelectItem value="export">Export</SelectItem>
                                <SelectItem value="exceptionnel">Exceptionnel</SelectItem>
                              </>
                            )}
                            {selectedType === "Manutention" && (
                              <>
                                <SelectItem value="chargement">Chargement/Déchargement</SelectItem>
                                <SelectItem value="empotage">Empotage/Dépotage</SelectItem>
                              </>
                            )}
                            {selectedType === "Stockage" && (
                              <>
                                <SelectItem value="entrepot">Entrepôt sécurisé</SelectItem>
                                <SelectItem value="plein-air">Stockage plein air</SelectItem>
                              </>
                            )}
                            {selectedType === "Location" && (
                              <>
                                <SelectItem value="engin">Location engin</SelectItem>
                                <SelectItem value="vehicule">Location véhicule</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea placeholder="Description de la prestation..." />
                    </div>

                    <div className="border rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-3">Lignes de prestation</h4>
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2">Quantité</div>
                        <div className="col-span-2">Prix unit.</div>
                        <div className="col-span-2">Total</div>
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <Input className="col-span-6" placeholder="Description" />
                        <Input className="col-span-2" type="number" placeholder="1" />
                        <Input className="col-span-2" type="number" placeholder="0" />
                        <Input className="col-span-2" disabled placeholder="0 FCFA" />
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une ligne
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {selectedType && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button variant="gradient" onClick={() => setIsDialogOpen(false)}>
                    Créer l'ordre
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
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

        {/* Orders Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredOrders.map((order) => {
            const TypeIcon = typeIcons[order.type];
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            return (
              <motion.div key={order.id} variants={itemVariants}>
                <Card className="hover-lift cursor-pointer border-border/50 group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-xl ${typeColors[order.type]}`}
                        >
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.client}
                          </p>
                        </div>
                      </div>
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
                            Voir détails
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
                            <FileCheck className="h-4 w-4 mr-2" />
                            Convertir en facture
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {order.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {order.subType}
                        </Badge>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.class}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(order.amount)} FCFA
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </PageTransition>
  );
}
