import { useEffect, useState } from "react";
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
  CheckCircle2,
  Anchor,
  Container,
  Wrench,
  CreditCard,
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
import { toast } from "@/hooks/use-toast";
import { PaymentDialog, type PayableDocument, type Payment } from "@/components/PaymentDialog";
import { PaymentHistory, mockPaymentHistory, type PaymentRecord } from "@/components/PaymentHistory";
import { notesDebutService } from "@/services/api/notes-debut.service";

interface NoteDebut {
  id: string;
  number: string;
  client: string;
  clientId: string;
  type: "ouverture_port" | "detention" | "reparation";
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

const initialNotes: NoteDebut[] = [];

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

// OT data will come from backend
const mockOrdresTravail: { id: string; client: string; clientKey: string; date: string; type: string; containers: { numero: string; description: string }[]; compagnie: string }[] = [];

export default function NotesDebut() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteDebut[]>(initialNotes);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // SEO (title, description, canonical)
  useEffect(() => {
    document.title = "Notes de début | Gestion portuaire";

    const description =
      "Gérez les notes de début : ouverture de port, détention et réparation de conteneur.";

    const ensureMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const ensureLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    ensureMeta("description", description);
    ensureLink("canonical", `${window.location.origin}${window.location.pathname}`);
  }, []);

  // Load notes from API
  useEffect(() => {
    let cancelled = false;

    const toStr = (v: unknown) => (v === null || v === undefined ? "" : String(v));
    const toNum = (v: unknown) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const formatDate = (v: unknown) => {
      const s = toStr(v);
      if (!s) return "";
      return s.includes("T") ? s.split("T")[0] : s;
    };

    const mapApiToNote = (api: any): NoteDebut => {
      const details = api?.details ?? {};
      const firstContainerFromDetails = details?.containers?.[0]?.numero;

      return {
        id: toStr(api?.id),
        number: toStr(api?.number ?? api?.numero),
        client: toStr(api?.client?.name ?? api?.client_name ?? api?.client),
        clientId: toStr(api?.client_id ?? api?.clientId),
        type: (api?.type ?? "ouverture_port") as NoteDebut["type"],
        ordresTravail: (api?.ordres_travail ?? details?.ordre_travail_ids ?? []).map(toStr),
        blNumber: toStr(api?.bl_number ?? details?.bl_number),
        containerNumber: toStr(api?.container_number ?? api?.conteneur ?? firstContainerFromDetails),
        dateDebut: formatDate(api?.date_debut ?? api?.date_arrivee),
        dateFin: formatDate(api?.date_fin ?? api?.date_sortie),
        nombreJours: toNum(api?.nombre_jours ?? api?.jours_detention),
        tarifJournalier: toNum(api?.tarif_journalier ?? details?.tarif_journalier),
        montantTotal: toNum(api?.montant_total ?? api?.montant_detention),
        paid: toNum(api?.paid),
        advance: toNum(api?.advance),
        status: (api?.status ?? "pending") as NoteDebut["status"],
        description: toStr(api?.observations ?? api?.description),
      };
    };

    const loadNotes = async () => {
      setIsLoading(true);
      try {
        const res: any = await notesDebutService.getAll({ per_page: 100 });
        const raw = Array.isArray(res?.data) ? res.data : res?.data?.data ?? [];
        const mapped = raw.map(mapApiToNote);
        if (!cancelled) setNotes(mapped);
      } catch (error: any) {
        if (!cancelled) {
          toast({
            title: "Erreur",
            description: error?.message || "Impossible de charger les notes",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadNotes();
    return () => {
      cancelled = true;
    };
  }, []);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"single" | "group" | "advance">("single");
  const [paymentDocuments, setPaymentDocuments] = useState<PayableDocument[]>([]);
  
  // Payment history states
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedNoteForHistory, setSelectedNoteForHistory] = useState<NoteDebut | null>(null);

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
              Gérez les notes de début (Ouverture de port, Détention, Réparation conteneur)
            </p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/notes-debut/nouvelle")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle note
          </Button>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                      Aucune note de début trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotes.map((note, index) => {
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
                  })
                )}
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
