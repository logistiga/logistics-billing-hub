import { useState } from "react";
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
  Anchor,
  Container,
  Wrench,
  CreditCard,
  Warehouse,
  TreeDeciduous,
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
import { toast } from "@/hooks/use-toast";
import { PaymentDialog, type PayableDocument, type Payment } from "@/components/PaymentDialog";
import { PaymentHistory, mockPaymentHistory, type PaymentRecord } from "@/components/PaymentHistory";

interface NoteDebut {
  id: string;
  number: string;
  client: string;
  clientId: string;
  type: "ouverture_port" | "detention" | "surestaries" | "magasinage";
  ordresTravail: string[];
  blNumber: string;
  containerNumber: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  tarifJournalier: number;
  montantTotal: number;
  paid: number;
  advance: number;
  status: "pending" | "invoiced" | "paid" | "cancelled" | "partial";
  description: string;
}

const initialNotes: NoteDebut[] = [
  {
    id: "1",
    number: "ND-2024-0015",
    client: "COMILOG SA",
    clientId: "c1",
    type: "ouverture_port",
    ordresTravail: ["OT-2024-0045", "OT-2024-0046"],
    blNumber: "BL-2024-5678",
    containerNumber: "MSKU1234567",
    dateDebut: "01/12/2024",
    dateFin: "15/12/2024",
    nombreJours: 15,
    tarifJournalier: 50000,
    montantTotal: 750000,
    paid: 0,
    advance: 0,
    status: "pending",
    description: "Ouverture de port pour container MSKU1234567",
  },
  {
    id: "2",
    number: "ND-2024-0014",
    client: "OLAM Gabon",
    clientId: "c2",
    type: "detention",
    ordresTravail: ["OT-2024-0042"],
    blNumber: "BL-2024-4321",
    containerNumber: "TCLU9876543",
    dateDebut: "05/12/2024",
    dateFin: "12/12/2024",
    nombreJours: 7,
    tarifJournalier: 75000,
    montantTotal: 525000,
    paid: 0,
    advance: 200000,
    status: "pending",
    description: "Détention container 7 jours",
  },
  {
    id: "3",
    number: "ND-2024-0013",
    client: "Total Energies",
    clientId: "c3",
    type: "surestaries",
    ordresTravail: ["OT-2024-0038", "OT-2024-0039"],
    blNumber: "BL-2024-8899",
    containerNumber: "MSCU5544332",
    dateDebut: "28/11/2024",
    dateFin: "10/12/2024",
    nombreJours: 12,
    tarifJournalier: 100000,
    montantTotal: 1200000,
    paid: 1200000,
    advance: 0,
    status: "paid",
    description: "Surestaries 12 jours - Retard enlèvement",
  },
  {
    id: "4",
    number: "ND-2024-0012",
    client: "Assala Energy",
    clientId: "c4",
    type: "magasinage",
    ordresTravail: ["OT-2024-0035"],
    blNumber: "BL-2024-7766",
    containerNumber: "HLCU6677889",
    dateDebut: "01/12/2024",
    dateFin: "14/12/2024",
    nombreJours: 14,
    tarifJournalier: 35000,
    montantTotal: 490000,
    paid: 0,
    advance: 0,
    status: "pending",
    description: "Magasinage marchandises diverses",
  },
  {
    id: "5",
    number: "ND-2024-0011",
    client: "COMILOG SA",
    clientId: "c1",
    type: "detention",
    ordresTravail: ["OT-2024-0030", "OT-2024-0031", "OT-2024-0032"],
    blNumber: "BL-2024-1234",
    containerNumber: "MSKU7654321",
    dateDebut: "01/12/2024",
    dateFin: "08/12/2024",
    nombreJours: 7,
    tarifJournalier: 75000,
    montantTotal: 525000,
    paid: 0,
    advance: 0,
    status: "pending",
    description: "Détention container COMILOG",
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
  reparation: {
    label: "Réparation conteneur",
    icon: Wrench,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  stockage: {
    label: "Stockage de conteneur",
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
  partial: {
    label: "Partielle",
    class: "bg-cyan-500/20 text-cyan-600",
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// Mock data for OTs with containers
const mockOrdresTravail = [
  { id: "OT-2024-0045", containers: ["MSKU1234567", "TCLU9876543", "MSCU5544332"], compagnie: "Maersk" },
  { id: "OT-2024-0046", containers: ["HLCU6677889", "MSKU7654321"], compagnie: "MSC" },
  { id: "OT-2024-0042", containers: ["TCLU9876543"], compagnie: "CMA CGM" },
  { id: "OT-2024-0038", containers: ["MSCU5544332", "HLCU6677889"], compagnie: "COSCO" },
  { id: "OT-2024-0039", containers: ["MSKU1234567"], compagnie: "Maersk" },
  { id: "OT-2024-0035", containers: ["HLCU6677889", "TCLU9876543", "MSKU7654321"], compagnie: "MSC" },
  { id: "OT-2024-0030", containers: ["MSKU7654321"], compagnie: "CMA CGM" },
  { id: "OT-2024-0031", containers: ["TCLU9876543", "MSCU5544332"], compagnie: "Maersk" },
  { id: "OT-2024-0032", containers: ["HLCU6677889"], compagnie: "COSCO" },
];

export default function NotesDebut() {
  const [notes, setNotes] = useState<NoteDebut[]>(initialNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [formStep, setFormStep] = useState<"type" | "form">("type");

  // Form states
  const [selectedOT, setSelectedOT] = useState<string>("");
  const [availableContainers, setAvailableContainers] = useState<string[]>([]);
  const [selectedCompagnie, setSelectedCompagnie] = useState<string>("");

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"single" | "group" | "advance">("single");
  const [paymentDocuments, setPaymentDocuments] = useState<PayableDocument[]>([]);
  
  // Payment history states
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedNoteForHistory, setSelectedNoteForHistory] = useState<NoteDebut | null>(null);

  // Handle OT selection - load containers and shipping company
  const handleOTChange = (otId: string) => {
    setSelectedOT(otId);
    const ot = mockOrdresTravail.find(o => o.id === otId);
    if (ot) {
      setAvailableContainers(ot.containers);
      setSelectedCompagnie(ot.compagnie);
    } else {
      setAvailableContainers([]);
      setSelectedCompagnie("");
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.containerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || note.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotes.map((n) => n.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = selectedIds.length === filteredNotes.length && filteredNotes.length > 0;
  const isSomeSelected = selectedIds.length > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const resetDialog = () => {
    setSelectedType("");
    setFormStep("type");
    setSelectedOT("");
    setAvailableContainers([]);
    setSelectedCompagnie("");
  };

  // Payment handlers
  const toPayableDocument = (note: NoteDebut): PayableDocument => ({
    id: note.id,
    number: note.number,
    client: note.client,
    clientId: note.clientId,
    date: note.dateDebut,
    amount: note.montantTotal,
    paid: note.paid + note.advance,
    type: "facture",
    documentType: typeConfig[note.type].label,
  });

  const handleSinglePayment = (note: NoteDebut) => {
    setPaymentDocuments([toPayableDocument(note)]);
    setPaymentMode("single");
    setPaymentDialogOpen(true);
  };

  const handleAdvancePayment = (note: NoteDebut) => {
    setPaymentDocuments([toPayableDocument(note)]);
    setPaymentMode("advance");
    setPaymentDialogOpen(true);
  };

  const handleGroupPayment = () => {
    const selectedNotes = notes.filter((n) => selectedIds.includes(n.id));
    if (selectedNotes.length < 2) {
      toast({
        title: "Sélection insuffisante",
        description: "Sélectionnez au moins 2 notes pour un paiement groupé",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier que toutes les notes sont du même client
    const clientIds = new Set(selectedNotes.map((n) => n.clientId));
    if (clientIds.size > 1) {
      toast({
        title: "Clients différents",
        description: "Le paiement groupé n'est possible que pour un seul client. Sélectionnez des notes du même client.",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentDocuments(selectedNotes.map(toPayableDocument));
    setPaymentMode("group");
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = (payment: Payment, updatedDocs: PayableDocument[]) => {
    setNotes((prev) =>
      prev.map((note) => {
        const updatedDoc = updatedDocs.find((d) => d.id === note.id);
        if (!updatedDoc) return note;

        const newPaid = updatedDoc.paid;
        const remaining = note.montantTotal - newPaid;
        
        let newStatus: NoteDebut["status"];
        if (payment.isAdvance) {
          return { ...note, advance: note.advance + payment.amount };
        } else if (remaining <= 0) {
          newStatus = "paid";
        } else if (newPaid > 0) {
          newStatus = "partial";
        } else {
          newStatus = note.status;
        }

        return { ...note, paid: newPaid, status: newStatus };
      })
    );
    setSelectedIds([]);
  };

  const handleViewHistory = (note: NoteDebut) => {
    setSelectedNoteForHistory(note);
    setHistoryDialogOpen(true);
  };

  const getPaymentHistory = (noteNumber: string): PaymentRecord[] => {
    return mockPaymentHistory[noteNumber] || [];
  };

  const stats = [
    { label: "Total notes", value: notes.length, unit: "notes" },
    { label: "En attente", value: notes.filter(n => n.status === "pending").length, unit: "notes" },
    { label: "Montant total", value: formatCurrency(notes.reduce((acc, n) => acc + n.montantTotal, 0)), unit: "FCFA" },
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
                        <Label>N° OT (Ordre de Travail) *</Label>
                        <Select value={selectedOT} onValueChange={handleOTChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un OT" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockOrdresTravail.map((ot) => (
                              <SelectItem key={ot.id} value={ot.id}>
                                {ot.id} ({ot.containers.length} container{ot.containers.length > 1 ? 's' : ''})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Compagnie maritime et Container */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Compagnie maritime</Label>
                        <Input 
                          value={selectedCompagnie} 
                          disabled 
                          placeholder="Sélectionnez un OT" 
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>N° Container *</Label>
                        <Select disabled={availableContainers.length === 0}>
                          <SelectTrigger>
                            <SelectValue placeholder={availableContainers.length === 0 ? "Sélectionnez un OT d'abord" : "Sélectionner un container"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableContainers.map((container) => (
                              <SelectItem key={container} value={container}>
                                {container}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* N° BL */}
                    <div className="space-y-2">
                      <Label>N° Connaissement (BL) *</Label>
                      <Input placeholder="BL-2024-XXXX" />
                    </div>

                    {/* Période */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
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
                    {selectedType === "reparation" && (
                      <div className="border rounded-lg p-4 border-green-200 bg-green-50">
                        <h4 className="font-medium mb-3 text-green-700">Informations Réparation</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type de réparation *</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="structural">Réparation structurelle</SelectItem>
                                <SelectItem value="plancher">Remplacement plancher</SelectItem>
                                <SelectItem value="porte">Réparation porte</SelectItem>
                                <SelectItem value="toit">Réparation toit</SelectItem>
                                <SelectItem value="parois">Réparation parois</SelectItem>
                                <SelectItem value="peinture">Peinture / Nettoyage</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Niveau d'urgence</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="tres_urgent">Très urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label>Équipe assignée</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner l'équipe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equipe_a">Équipe A - Owendo</SelectItem>
                                <SelectItem value="equipe_b">Équipe B - Libreville</SelectItem>
                                <SelectItem value="equipe_c">Équipe C - Port-Gentil</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>État du container</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="leger">Dommages légers</SelectItem>
                                <SelectItem value="modere">Dommages modérés</SelectItem>
                                <SelectItem value="grave">Dommages graves</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label>Description des dommages</Label>
                          <Textarea placeholder="Décrivez les dommages constatés et les réparations à effectuer..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label>Coût estimé main d'œuvre (FCFA)</Label>
                            <Input type="number" placeholder="150000" />
                          </div>
                          <div className="space-y-2">
                            <Label>Coût estimé pièces (FCFA)</Label>
                            <Input type="number" placeholder="50000" />
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
                      </div>
                    )}

                    {selectedType === "stockage" && (
                      <div className="border rounded-lg p-4 border-purple-200 bg-purple-50">
                        <h4 className="font-medium mb-3 text-purple-700">Type de stockage</h4>
                        <p className="text-sm text-muted-foreground mb-4">Quel type de stockage souhaitez-vous créer ?</p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            className="p-6 rounded-xl border-2 border-dashed border-purple-300 transition-all hover:border-purple-500 hover:bg-purple-100 bg-white"
                          >
                            <Warehouse className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                            <p className="font-semibold text-purple-700">Entrepôt sécurisé</p>
                          </button>
                          <button
                            type="button"
                            className="p-6 rounded-xl border-2 border-dashed border-purple-300 transition-all hover:border-purple-500 hover:bg-purple-100 bg-white"
                          >
                            <TreeDeciduous className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                            <p className="font-semibold text-purple-700">Stockage plein air</p>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label>Emplacement *</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="zone_a">Zone A - Owendo</SelectItem>
                                <SelectItem value="zone_b">Zone B - Owendo</SelectItem>
                                <SelectItem value="zone_c">Zone C - Port-Gentil</SelectItem>
                                <SelectItem value="zone_d">Zone D - Libreville</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Durée prévue (jours)</Label>
                            <Input type="number" placeholder="30" />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label>Conditions particulières</Label>
                          <Textarea placeholder="Ex: Marchandises fragiles, surveillance 24h, accès restreint..." />
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
              <SelectItem value="reparation">Réparation conteneur</SelectItem>
              <SelectItem value="stockage">Stockage de conteneur</SelectItem>
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
                {selectedIds.length} note(s) sélectionnée(s)
              </span>
              <span className="text-sm text-muted-foreground">
                - Total:{" "}
                {formatCurrency(
                  notes
                    .filter((n) => selectedIds.includes(n.id))
                    .reduce((sum, n) => sum + (n.montantTotal - n.paid - n.advance), 0)
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
                  <TableHead>Container</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead className="text-center">Jours</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Payé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note, index) => {
                  const typeInfo = typeConfig[note.type];
                  const TypeIcon = typeInfo.icon;
                  const status = statusConfig[note.status];
                  const isSelected = selectedIds.includes(note.id);
                  const remaining = note.montantTotal - note.paid - note.advance;
                  return (
                    <motion.tr
                      key={note.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className={`group hover:bg-muted/50 cursor-pointer ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectOne(note.id)}
                        />
                      </TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          {note.paid > 0 && (
                            <span className="text-success text-sm">
                              {formatCurrency(note.paid)}
                            </span>
                          )}
                          {note.advance > 0 && (
                            <span className="text-cyan-600 text-xs">
                              +{formatCurrency(note.advance)} avance
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" title="Voir détails & historique" onClick={() => handleViewHistory(note)}>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-700" title="Enregistrer paiement / avance" onClick={() => handleSinglePayment(note)}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          {/* Note de début ne se convertit pas en facture */}
                          {/* Ne pas supprimer si paiement existant */}
                          {note.paid === 0 && note.advance === 0 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        documents={paymentDocuments}
        onPaymentComplete={handlePaymentComplete}
        mode={paymentMode}
      />

      {/* Payment History Dialog */}
      {selectedNoteForHistory && (
        <PaymentHistory
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          documentNumber={selectedNoteForHistory.number}
          documentType="facture"
          client={selectedNoteForHistory.client}
          totalAmount={selectedNoteForHistory.montantTotal}
          payments={getPaymentHistory(selectedNoteForHistory.number)}
        />
      )}
    </PageTransition>
  );
}
