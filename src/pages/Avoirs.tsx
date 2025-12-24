import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileDown,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftRight,
  Banknote,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { DocumentPDFGenerator, type DocumentData } from "@/lib/generateDocumentPDF";
import { CreateAvoirDialog, type InvoiceForAvoir, type ClientForAvoir } from "@/components/CreateAvoirDialog";
import { avoirStore, type Avoir } from "@/lib/avoirStore";

// Mock invoices for creating new credit notes
const mockInvoices: InvoiceForAvoir[] = [
  { id: "1", number: "FAC-2024-0142", client: "COMILOG SA", clientId: "c1", amount: 3250000 },
  { id: "2", number: "FAC-2024-0141", client: "OLAM Gabon", clientId: "c2", amount: 1875000 },
  { id: "3", number: "FAC-2024-0140", client: "Total Energies", clientId: "c3", amount: 5420000 },
  { id: "4", number: "FAC-2024-0139", client: "Assala Energy", clientId: "c4", amount: 2100000 },
  { id: "5", number: "FAC-2024-0138", client: "SEEG", clientId: "c5", amount: 890000 },
];

// Mock clients pour les avoirs libres
const mockClients: ClientForAvoir[] = [
  { id: "c1", name: "COMILOG SA" },
  { id: "c2", name: "OLAM Gabon" },
  { id: "c3", name: "Total Energies" },
  { id: "c4", name: "Assala Energy" },
  { id: "c5", name: "SEEG" },
  { id: "c6", name: "Perenco Gabon" },
  { id: "c7", name: "Gabon Telecom" },
];

const statusConfig = {
  disponible: {
    label: "Disponible",
    class: "bg-success/20 text-success border-success/30",
    icon: CheckCircle,
  },
  partiellement_utilise: {
    label: "Partiellement utilisé",
    class: "bg-warning/20 text-warning border-warning/30",
    icon: Clock,
  },
  utilise: {
    label: "Compensé",
    class: "bg-primary/20 text-primary border-primary/30",
    icon: ArrowLeftRight,
  },
  annule: {
    label: "Annulé",
    class: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
  rembourse: {
    label: "Remboursé",
    class: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    icon: Banknote,
  },
};

const refundMethods = [
  { value: "virement", label: "Virement bancaire" },
  { value: "especes", label: "Espèces" },
  { value: "cheque", label: "Chèque" },
];

export default function Avoirs() {
  // Utiliser le store pour les avoirs
  const avoirs = useSyncExternalStore(
    avoirStore.subscribe,
    avoirStore.getAll,
    avoirStore.getAll
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedAvoir, setSelectedAvoir] = useState<Avoir | null>(null);

  const [refundForm, setRefundForm] = useState({
    method: "" as "virement" | "especes" | "cheque" | "",
    reference: "",
  });

  const filteredAvoirs = avoirs.filter((avoir) => {
    const matchesSearch =
      avoir.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avoir.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (avoir.linkedInvoice?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || avoir.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR");
  };

  // Callback quand un avoir est créé via le store
  const handleAvoirCreated = () => {
    setCreateDialogOpen(false);
  };

  // Process refund
  const handleProcessRefund = () => {
    if (!selectedAvoir || !refundForm.method) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un mode de remboursement",
        variant: "destructive",
      });
      return;
    }

    const result = avoirStore.processRefund(
      selectedAvoir.id,
      refundForm.method,
      refundForm.reference || undefined
    );

    if (result.success) {
      toast({
        title: "Remboursement effectué",
        description: `L'avoir ${selectedAvoir.number} a été remboursé par ${
          refundMethods.find((m) => m.value === refundForm.method)?.label
        }`,
      });
      setRefundDialogOpen(false);
      setSelectedAvoir(null);
      setRefundForm({ method: "", reference: "" });
    } else {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  // Cancel avoir
  const handleCancel = (avoir: Avoir) => {
    const result = avoirStore.cancel(avoir.id);
    if (result.success) {
      toast({
        title: "Avoir annulé",
        description: `L'avoir ${avoir.number} a été annulé`,
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  // Download PDF
  const handleDownloadPDF = (avoir: Avoir) => {
    const documentData: DocumentData = {
      type: "avoir",
      numero: avoir.number,
      date: avoir.date,
      client: {
        nom: avoir.clientName,
      },
      lignes: [
        {
          description: avoir.linkedInvoice
            ? `Avoir sur facture ${avoir.linkedInvoice}\nMotif: ${avoir.reason}`
            : `Avoir libre\nMotif: ${avoir.reason}`,
          quantite: 1,
          prixUnitaire: -avoir.originalAmount,
        },
      ],
      tauxTVA: 18,
      notes: avoir.linkedInvoice
        ? `Facture d'origine: ${avoir.linkedInvoice}`
        : "Avoir libre (non lié à une facture)",
    };

    const generator = new DocumentPDFGenerator();
    generator.generateAndDownload(documentData);
    toast({
      title: "PDF généré",
      description: `L'avoir ${avoir.number} a été téléchargé`,
    });
  };

  // Calculate stats
  const stats = [
    {
      label: "Total avoirs disponibles",
      value: formatCurrency(
        avoirs
          .filter((a) => a.status === "disponible" || a.status === "partiellement_utilise")
          .reduce((sum, a) => sum + a.remainingAmount, 0)
      ),
      unit: "FCFA",
    },
    {
      label: "En attente",
      value: formatCurrency(
        avoirs.filter((a) => a.status === "disponible").reduce((sum, a) => sum + a.remainingAmount, 0)
      ),
      unit: "FCFA",
      count: avoirs.filter((a) => a.status === "disponible").length,
    },
    {
      label: "Remboursés",
      value: formatCurrency(
        avoirs.filter((a) => a.status === "rembourse").reduce((sum, a) => sum + a.originalAmount, 0)
      ),
      unit: "FCFA",
    },
    {
      label: "Compensés",
      value: formatCurrency(
        avoirs.filter((a) => a.status === "utilise").reduce((sum, a) => sum + a.originalAmount, 0)
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
              Avoirs & Remboursements
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les avoirs et suivez les remboursements
            </p>
          </div>
          <Button variant="gradient" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel avoir
          </Button>
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
                  <p className="text-2xl font-bold font-heading mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.unit}
                    {"count" in stat && ` (${stat.count} avoir${(stat.count as number) > 1 ? "s" : ""})`}
                  </p>
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
              placeholder="Rechercher par numéro, client ou facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="partiellement_utilise">Partiellement utilisé</SelectItem>
              <SelectItem value="utilise">Compensé</SelectItem>
              <SelectItem value="rembourse">Remboursé</SelectItem>
              <SelectItem value="annule">Annulé</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Plus de filtres
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>N° Avoir</TableHead>
                  <TableHead>Facture liée</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAvoirs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun avoir trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAvoirs.map((avoir) => {
                    const StatusIcon = statusConfig[avoir.status].icon;
                    return (
                      <TableRow key={avoir.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{avoir.number}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {avoir.linkedInvoice || (
                            <span className="italic text-xs">Avoir libre</span>
                          )}
                        </TableCell>
                        <TableCell>{avoir.clientName}</TableCell>
                        <TableCell>{formatDate(avoir.date)}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          -{formatCurrency(avoir.originalAmount)} FCFA
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {avoir.remainingAmount > 0 ? (
                            <span className="text-success">
                              {formatCurrency(avoir.remainingAmount)} FCFA
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0 FCFA</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={avoir.reason}>
                          {avoir.reason}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig[avoir.status].class}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[avoir.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                •••
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownloadPDF(avoir)}>
                                <FileDown className="h-4 w-4 mr-2" />
                                Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              {(avoir.status === "disponible" ||
                                avoir.status === "partiellement_utilise") && (
                                <>
                                  <DropdownMenuSeparator />
                                  {avoir.status === "disponible" && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedAvoir(avoir);
                                        setRefundDialogOpen(true);
                                      }}
                                    >
                                      <Banknote className="h-4 w-4 mr-2" />
                                      Rembourser le client
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleCancel(avoir)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Annuler l'avoir
                                  </DropdownMenuItem>
                                </>
                              )}
                              {avoir.status === "rembourse" && avoir.refundMethod && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem disabled className="text-muted-foreground">
                                    <Banknote className="h-4 w-4 mr-2" />
                                    Remboursé par{" "}
                                    {refundMethods.find((m) => m.value === avoir.refundMethod)?.label}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Credit Note Dialog */}
        <CreateAvoirDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          invoices={mockInvoices}
          clients={mockClients}
          onAvoirCreated={handleAvoirCreated}
        />

        {/* Refund Dialog */}
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Rembourser le client
              </DialogTitle>
              <DialogDescription>
                {selectedAvoir && (
                  <>
                    Avoir {selectedAvoir.number} - {formatCurrency(selectedAvoir.remainingAmount)}{" "}
                    FCFA à rembourser
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedAvoir && (
                <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Client:</span>{" "}
                    <span className="font-medium">{selectedAvoir.clientName}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Motif:</span>{" "}
                    <span>{selectedAvoir.reason}</span>
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Mode de remboursement *</Label>
                <Select
                  value={refundForm.method}
                  onValueChange={(value: "virement" | "especes" | "cheque") =>
                    setRefundForm((prev) => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {refundMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence (optionnel)</Label>
                <Input
                  id="reference"
                  placeholder="Ex: VIR-2024-0089, Chèque n°..."
                  value={refundForm.reference}
                  onChange={(e) =>
                    setRefundForm((prev) => ({ ...prev, reference: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleProcessRefund} disabled={!refundForm.method}>
                Confirmer le remboursement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}