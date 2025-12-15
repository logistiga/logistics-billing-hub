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
  FileText,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  category: "standard" | "note_debut";
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
    category: "standard",
    type: "Transport",
    subType: "Transport Hors Libreville",
    date: "15/12/2024",
    status: "in_progress",
    amount: 2500000,
    description: "Transport de minerai vers Port-Gentil",
  },
  {
    id: "2",
    number: "ND-2024-0012",
    client: "OLAM Gabon",
    category: "note_debut",
    type: "Note de début",
    subType: "Ouverture de port",
    date: "14/12/2024",
    status: "completed",
    amount: 850000,
    description: "Ouverture de port - Container MSKU1234567",
  },
  {
    id: "3",
    number: "OT-2024-0088",
    client: "OLAM Gabon",
    category: "standard",
    type: "Manutention",
    subType: "Chargement/Déchargement",
    date: "14/12/2024",
    status: "completed",
    amount: 850000,
    description: "Manutention containers au port",
  },
  {
    id: "4",
    number: "ND-2024-0011",
    client: "Total Energies",
    category: "note_debut",
    type: "Note de début",
    subType: "Surestaries",
    date: "14/12/2024",
    status: "pending",
    amount: 1200000,
    description: "Surestaries container 15 jours",
  },
  {
    id: "5",
    number: "OT-2024-0087",
    client: "Total Energies",
    category: "standard",
    type: "Stockage",
    subType: "Entrepôt sécurisé",
    date: "14/12/2024",
    status: "pending",
    amount: 1200000,
    description: "Stockage équipements pétroliers",
  },
  {
    id: "6",
    number: "OT-2024-0086",
    client: "Assala Energy",
    category: "standard",
    type: "Transport",
    subType: "Transport Exceptionnel",
    date: "13/12/2024",
    status: "completed",
    amount: 4500000,
    description: "Convoi exceptionnel équipement lourd",
  },
  {
    id: "7",
    number: "OT-2024-0085",
    client: "SEEG",
    category: "standard",
    type: "Location",
    subType: "Location engin",
    date: "12/12/2024",
    status: "cancelled",
    amount: 750000,
    description: "Location grue - Annulé",
  },
];

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Manutention: Forklift,
  Transport: Truck,
  Stockage: Warehouse,
  Location: Package,
  "Note de début": FileText,
};

const typeColors: Record<string, string> = {
  Manutention: "bg-blue-100 text-blue-700 border-blue-200",
  Transport: "bg-amber-100 text-amber-700 border-amber-200",
  Stockage: "bg-purple-100 text-purple-700 border-purple-200",
  Location: "bg-green-100 text-green-700 border-green-200",
  "Note de début": "bg-rose-100 text-rose-700 border-rose-200",
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

const categoryLabels = {
  standard: "Ordre de travail",
  note_debut: "Note de début",
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function OrdresTravail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"" | "standard" | "note_debut">("");
  const [selectedType, setSelectedType] = useState("");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || order.type === typeFilter || 
      (typeFilter === "note_debut" && order.category === "note_debut");
    return matchesSearch && matchesType;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const resetDialog = () => {
    setSelectedCategory("");
    setSelectedType("");
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialog();
          }}>
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
                  Sélectionnez le type de document
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                {!selectedCategory ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedCategory("standard")}
                      className="p-6 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 bg-amber-50 text-amber-700 border-amber-200"
                    >
                      <Truck className="h-8 w-8 mx-auto mb-3" />
                      <p className="font-semibold">Ordre de travail</p>
                      <p className="text-xs mt-1 opacity-70">Manutention, Transport, Stockage, Location</p>
                    </button>
                    <button
                      onClick={() => setSelectedCategory("note_debut")}
                      className="p-6 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 bg-rose-50 text-rose-700 border-rose-200"
                    >
                      <FileText className="h-8 w-8 mx-auto mb-3" />
                      <p className="font-semibold">Note de début</p>
                      <p className="text-xs mt-1 opacity-70">Ouverture de port, Détention, Surestaries, Magasinage</p>
                    </button>
                  </div>
                ) : selectedCategory === "standard" && !selectedType ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory("")}
                      >
                        ← Retour
                      </Button>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        Ordre de travail
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(typeIcons).filter(([type]) => type !== "Note de début").map(([type, Icon]) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 ${typeColors[type]}`}
                        >
                          <Icon className="h-8 w-8 mx-auto mb-3" />
                          <p className="font-semibold">{type}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedCategory === "note_debut") {
                            setSelectedCategory("");
                          } else {
                            setSelectedType("");
                          }
                        }}
                      >
                        ← Retour
                      </Button>
                      <Badge className={selectedCategory === "note_debut" ? "bg-rose-100 text-rose-700 border-rose-200" : typeColors[selectedType]}>
                        {selectedCategory === "note_debut" ? "Note de début" : selectedType}
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
                        <Label>Type *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Type de prestation" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory === "note_debut" && (
                              <>
                                <SelectItem value="ouverture">Ouverture de port</SelectItem>
                                <SelectItem value="detention">Détention</SelectItem>
                                <SelectItem value="surestaries">Surestaries</SelectItem>
                                <SelectItem value="magasinage">Magasinage</SelectItem>
                              </>
                            )}
                            {selectedType === "Transport" && (
                              <>
                                <SelectItem value="hors-lbv">Hors Libreville</SelectItem>
                                <SelectItem value="import">Import sur Libreville</SelectItem>
                                <SelectItem value="export">Export</SelectItem>
                                <SelectItem value="exceptionnel">Exceptionnel</SelectItem>
                              </>
                            )}
                            {selectedType === "Manutention" && (
                              <>
                                <SelectItem value="chargement">Chargement/Déchargement</SelectItem>
                                <SelectItem value="empotage">Empotage/Dépotage</SelectItem>
                                <SelectItem value="autre">Autre (à préciser)</SelectItem>
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
              {(selectedCategory === "note_debut" || selectedType) && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetDialog();
                  }}>
                    Annuler
                  </Button>
                  <Button variant="gradient" onClick={() => {
                    setIsDialogOpen(false);
                    resetDialog();
                  }}>
                    Créer
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
              <SelectItem value="note_debut">Note de début</SelectItem>
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
                  const TypeIcon = typeIcons[order.type] || FileText;
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
                        <Badge className={`${typeColors[order.type] || "bg-muted"} border`}>
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
