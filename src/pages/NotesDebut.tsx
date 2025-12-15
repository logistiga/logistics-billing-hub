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
  FileText,
  Anchor,
  Container,
  Timer,
  Warehouse,
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

interface NoteDebut {
  id: string;
  number: string;
  client: string;
  type: "ouverture_port" | "detention" | "surestaries" | "magasinage";
  factureOrigine: string;
  blNumber: string;
  containerNumber: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  tarifJournalier: number;
  montantTotal: number;
  status: "pending" | "invoiced" | "paid" | "cancelled";
  description: string;
}

const mockNotes: NoteDebut[] = [
  {
    id: "1",
    number: "ND-2024-0015",
    client: "COMILOG SA",
    type: "ouverture_port",
    factureOrigine: "FAC-2024-0120",
    blNumber: "BL-2024-5678",
    containerNumber: "MSKU1234567",
    dateDebut: "01/12/2024",
    dateFin: "15/12/2024",
    nombreJours: 15,
    tarifJournalier: 50000,
    montantTotal: 750000,
    status: "pending",
    description: "Ouverture de port pour container MSKU1234567",
  },
  {
    id: "2",
    number: "ND-2024-0014",
    client: "OLAM Gabon",
    type: "detention",
    factureOrigine: "FAC-2024-0115",
    blNumber: "BL-2024-4321",
    containerNumber: "TCLU9876543",
    dateDebut: "05/12/2024",
    dateFin: "12/12/2024",
    nombreJours: 7,
    tarifJournalier: 75000,
    montantTotal: 525000,
    status: "invoiced",
    description: "Détention container 7 jours",
  },
  {
    id: "3",
    number: "ND-2024-0013",
    client: "Total Energies",
    type: "surestaries",
    factureOrigine: "FAC-2024-0110",
    blNumber: "BL-2024-8899",
    containerNumber: "MSCU5544332",
    dateDebut: "28/11/2024",
    dateFin: "10/12/2024",
    nombreJours: 12,
    tarifJournalier: 100000,
    montantTotal: 1200000,
    status: "paid",
    description: "Surestaries 12 jours - Retard enlèvement",
  },
  {
    id: "4",
    number: "ND-2024-0012",
    client: "Assala Energy",
    type: "magasinage",
    factureOrigine: "FAC-2024-0105",
    blNumber: "BL-2024-7766",
    containerNumber: "HLCU6677889",
    dateDebut: "01/12/2024",
    dateFin: "14/12/2024",
    nombreJours: 14,
    tarifJournalier: 35000,
    montantTotal: 490000,
    status: "pending",
    description: "Magasinage marchandises diverses",
  },
];

const typeConfig = {
  ouverture_port: {
    label: "Ouverture de port",
    icon: Anchor,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  detention: {
    label: "Détention",
    icon: Container,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  surestaries: {
    label: "Surestaries",
    icon: Timer,
    color: "bg-red-100 text-red-700 border-red-200",
  },
  magasinage: {
    label: "Magasinage",
    icon: Warehouse,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

const statusConfig = {
  pending: {
    label: "En attente",
    class: "bg-warning/20 text-warning",
  },
  invoiced: {
    label: "Facturée",
    class: "bg-primary/20 text-primary",
  },
  paid: {
    label: "Payée",
    class: "bg-success/20 text-success",
  },
  cancelled: {
    label: "Annulée",
    class: "bg-muted text-muted-foreground",
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function NotesDebut() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [formStep, setFormStep] = useState<"type" | "form">("type");

  const filteredNotes = mockNotes.filter((note) => {
    const matchesSearch =
      note.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.containerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || note.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const resetDialog = () => {
    setSelectedType("");
    setFormStep("type");
  };

  const stats = [
    { label: "Total notes", value: mockNotes.length, unit: "notes" },
    { label: "En attente", value: mockNotes.filter(n => n.status === "pending").length, unit: "notes" },
    { label: "Montant total", value: formatCurrency(mockNotes.reduce((acc, n) => acc + n.montantTotal, 0)), unit: "FCFA" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Notes de début
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les notes de début (Ouverture de port, Détention, Surestaries, Magasinage)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialog();
          }}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Nouvelle note de début
                </DialogTitle>
                <DialogDescription>
                  {formStep === "type" 
                    ? "Sélectionnez le type de note de début"
                    : `Remplissez les informations pour ${typeConfig[selectedType as keyof typeof typeConfig]?.label}`
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                {formStep === "type" ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(typeConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedType(key);
                            setFormStep("form");
                          }}
                          className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 ${config.color}`}
                        >
                          <Icon className="h-8 w-8 mx-auto mb-3" />
                          <p className="font-semibold">{config.label}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormStep("type")}
                      >
                        ← Retour
                      </Button>
                      <Badge className={typeConfig[selectedType as keyof typeof typeConfig]?.color}>
                        {typeConfig[selectedType as keyof typeof typeConfig]?.label}
                      </Badge>
                    </div>

                    {/* Client et références */}
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
                            <SelectItem value="assala">Assala Energy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Facture d'origine</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Référence facture" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fac-120">FAC-2024-0120</SelectItem>
                            <SelectItem value="fac-115">FAC-2024-0115</SelectItem>
                            <SelectItem value="fac-110">FAC-2024-0110</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Références container/BL */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>N° Connaissement (BL) *</Label>
                        <Input placeholder="BL-2024-XXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label>N° Container *</Label>
                        <Input placeholder="MSKU1234567" />
                      </div>
                    </div>

                    {/* Période */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Période de facturation
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Date début *</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>Date fin *</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>Nombre de jours</Label>
                          <Input type="number" placeholder="0" disabled className="bg-muted" />
                        </div>
                      </div>
                    </div>

                    {/* Tarification */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <h4 className="font-medium mb-3">Tarification</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tarif journalier (FCFA) *</Label>
                          <Input type="number" placeholder="50000" />
                        </div>
                        <div className="space-y-2">
                          <Label>Montant total (FCFA)</Label>
                          <Input 
                            type="text" 
                            disabled 
                            placeholder="0 FCFA" 
                            className="bg-muted font-semibold text-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Champs spécifiques par type */}
                    {selectedType === "surestaries" && (
                      <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                        <h4 className="font-medium mb-3 text-red-700">Informations Surestaries</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Compagnie maritime</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="maersk">Maersk</SelectItem>
                                <SelectItem value="msc">MSC</SelectItem>
                                <SelectItem value="cma">CMA CGM</SelectItem>
                                <SelectItem value="cosco">COSCO</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Jours franchise</Label>
                            <Input type="number" placeholder="7" />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedType === "magasinage" && (
                      <div className="border rounded-lg p-4 border-purple-200 bg-purple-50">
                        <h4 className="font-medium mb-3 text-purple-700">Informations Magasinage</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type de marchandise</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">Marchandises générales</SelectItem>
                                <SelectItem value="dangereux">Marchandises dangereuses</SelectItem>
                                <SelectItem value="refrigere">Produits réfrigérés</SelectItem>
                                <SelectItem value="vrac">Vrac</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Entrepôt</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owendo">Owendo</SelectItem>
                                <SelectItem value="libreville">Libreville Port</SelectItem>
                                <SelectItem value="portgentil">Port-Gentil</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedType === "detention" && (
                      <div className="border rounded-lg p-4 border-amber-200 bg-amber-50">
                        <h4 className="font-medium mb-3 text-amber-700">Informations Détention</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type de container</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="20gp">20' GP</SelectItem>
                                <SelectItem value="40gp">40' GP</SelectItem>
                                <SelectItem value="40hc">40' HC</SelectItem>
                                <SelectItem value="20rf">20' Reefer</SelectItem>
                                <SelectItem value="40rf">40' Reefer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Motif détention</Label>
                            <Input placeholder="Ex: Retard dédouanement" />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedType === "ouverture_port" && (
                      <div className="border rounded-lg p-4 border-blue-200 bg-blue-50">
                        <h4 className="font-medium mb-3 text-blue-700">Informations Ouverture de port</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Port</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owendo">Port d'Owendo</SelectItem>
                                <SelectItem value="libreville">Port de Libreville</SelectItem>
                                <SelectItem value="portgentil">Port de Port-Gentil</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>N° Escale navire</Label>
                            <Input placeholder="ESC-2024-XXX" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Notes / Description</Label>
                      <Textarea placeholder="Informations complémentaires..." />
                    </div>
                  </div>
                )}
              </div>
              {formStep === "form" && (
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
                    Créer la note
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
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
                  <p className="text-2xl font-bold font-heading mt-1">{stat.value}</p>
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
              placeholder="Rechercher par numéro, client ou container..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="ouverture_port">Ouverture de port</SelectItem>
              <SelectItem value="detention">Détention</SelectItem>
              <SelectItem value="surestaries">Surestaries</SelectItem>
              <SelectItem value="magasinage">Magasinage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
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
                  <TableHead>Container</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead className="text-center">Jours</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note, index) => {
                  const typeInfo = typeConfig[note.type];
                  const TypeIcon = typeInfo.icon;
                  const status = statusConfig[note.status];
                  return (
                    <motion.tr
                      key={note.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="font-medium">{note.number}</TableCell>
                      <TableCell>{note.client}</TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} border`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{note.containerNumber}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {note.dateDebut} → {note.dateFin}
                      </TableCell>
                      <TableCell className="text-center font-semibold">{note.nombreJours}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(note.montantTotal)} FCFA
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
