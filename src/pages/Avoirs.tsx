import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileDown,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftRight,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CreateAvoirDialog, type InvoiceForAvoir } from "@/components/CreateAvoirDialog";
import { avoirStore } from "@/lib/avoirStore";

interface CreditNote {
  id: string;
  number: string;
  invoiceNumber: string;
  invoiceId: string;
  client: string;
  clientId: string;
  date: string;
  amount: number;
  reason: string;
  status: "pending" | "refunded" | "applied" | "cancelled";
  refundMethod?: "virement" | "especes" | "cheque" | "compensation";
  refundDate?: string;
  refundReference?: string;
}

const initialCreditNotes: CreditNote[] = [
  {
    id: "1",
    number: "AV-2024-0012",
    invoiceNumber: "FAC-2024-0142",
    invoiceId: "1",
    client: "COMILOG SA",
    clientId: "c1",
    date: "18/12/2024",
    amount: 250000,
    reason: "Erreur de facturation - quantité incorrecte",
    status: "refunded",
    refundMethod: "virement",
    refundDate: "20/12/2024",
    refundReference: "VIR-2024-0089",
  },
  {
    id: "2",
    number: "AV-2024-0011",
    invoiceNumber: "FAC-2024-0140",
    invoiceId: "3",
    client: "Total Energies",
    clientId: "c3",
    date: "15/12/2024",
    amount: 420000,
    reason: "Annulation partielle de prestation",
    status: "applied",
  },
  {
    id: "3",
    number: "AV-2024-0010",
    invoiceNumber: "FAC-2024-0138",
    invoiceId: "5",
    client: "SEEG",
    clientId: "c5",
    date: "12/12/2024",
    amount: 150000,
    reason: "Retour de matériel",
    status: "pending",
  },
  {
    id: "4",
    number: "AV-2024-0009",
    invoiceNumber: "FAC-2024-0135",
    invoiceId: "8",
    client: "OLAM Gabon",
    clientId: "c2",
    date: "10/12/2024",
    amount: 180000,
    reason: "Double facturation",
    status: "cancelled",
  },
];

// Mock invoices for creating new credit notes
const mockInvoices = [
  { id: "1", number: "FAC-2024-0142", client: "COMILOG SA", clientId: "c1", amount: 3250000 },
  { id: "2", number: "FAC-2024-0141", client: "OLAM Gabon", clientId: "c2", amount: 1875000 },
  { id: "3", number: "FAC-2024-0140", client: "Total Energies", clientId: "c3", amount: 5420000 },
  { id: "4", number: "FAC-2024-0139", client: "Assala Energy", clientId: "c4", amount: 2100000 },
  { id: "5", number: "FAC-2024-0138", client: "SEEG", clientId: "c5", amount: 890000 },
];

const statusConfig = {
  pending: {
    label: "En attente",
    class: "bg-warning/20 text-warning border-warning/30",
    icon: Clock,
  },
  refunded: {
    label: "Remboursé",
    class: "bg-success text-success-foreground",
    icon: CheckCircle,
  },
  applied: {
    label: "Compensé",
    class: "bg-primary/20 text-primary border-primary/30",
    icon: ArrowLeftRight,
  },
  cancelled: {
    label: "Annulé",
    class: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
};

const refundMethods = [
  { value: "virement", label: "Virement bancaire" },
  { value: "especes", label: "Espèces" },
  { value: "cheque", label: "Chèque" },
  { value: "compensation", label: "Compensation facture" },
];

export default function Avoirs() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(initialCreditNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null);

  const [refundForm, setRefundForm] = useState({
    method: "" as CreditNote["refundMethod"],
    reference: "",
  });

  const filteredCreditNotes = creditNotes.filter((cn) => {
    const matchesSearch =
      cn.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cn.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Récupérer les factures pour le formulaire de création
  const invoicesForAvoir: InvoiceForAvoir[] = mockInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    client: inv.client,
    clientId: inv.clientId,
    amount: inv.amount,
  }));

  // Callback quand un avoir est créé via le store
  const handleAvoirCreated = () => {
    // Rafraîchir la liste locale (dans une vraie app, ceci viendrait du store)
    setCreateDialogOpen(false);
    toast({
      title: "Avoir créé avec succès",
      description: "L'avoir a été ajouté et est disponible pour compensation",
    });
  };

  // Process refund
  const handleProcessRefund = () => {
    if (!selectedCreditNote || !refundForm.method) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un mode de remboursement",
        variant: "destructive",
      });
      return;
    }

    setCreditNotes((prev) =>
      prev.map((cn) =>
        cn.id === selectedCreditNote.id
          ? {
              ...cn,
              status: refundForm.method === "compensation" ? "applied" : "refunded",
              refundMethod: refundForm.method,
              refundDate: new Date().toLocaleDateString("fr-FR"),
              refundReference: refundForm.reference || undefined,
            }
          : cn
      )
    );

    setRefundDialogOpen(false);
    setSelectedCreditNote(null);
    setRefundForm({ method: undefined, reference: "" });

    toast({
      title: refundForm.method === "compensation" ? "Avoir compensé" : "Remboursement effectué",
      description: `L'avoir ${selectedCreditNote.number} a été traité`,
    });
  };

  // Cancel credit note
  const handleCancel = (creditNote: CreditNote) => {
    setCreditNotes((prev) =>
      prev.map((cn) =>
        cn.id === creditNote.id ? { ...cn, status: "cancelled" } : cn
      )
    );
    toast({
      title: "Avoir annulé",
      description: `L'avoir ${creditNote.number} a été annulé`,
    });
  };

  // Download PDF
  const handleDownloadPDF = (creditNote: CreditNote) => {
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    };

    const documentData: DocumentData = {
      type: "avoir",
      numero: creditNote.number,
      date: parseDate(creditNote.date),
      client: {
        nom: creditNote.client,
      },
      lignes: [
        {
          description: `Avoir sur facture ${creditNote.invoiceNumber}\nMotif: ${creditNote.reason}`,
          quantite: 1,
          prixUnitaire: -creditNote.amount,
        },
      ],
      tauxTVA: 18,
      notes: `Facture d'origine: ${creditNote.invoiceNumber}${
        creditNote.refundMethod
          ? `\nMode de remboursement: ${refundMethods.find((m) => m.value === creditNote.refundMethod)?.label}`
          : ""
      }${creditNote.refundReference ? `\nRéférence: ${creditNote.refundReference}` : ""}`,
    };

    const generator = new DocumentPDFGenerator();
    generator.generateAndDownload(documentData);
    toast({
      title: "PDF généré",
      description: `L'avoir ${creditNote.number} a été téléchargé`,
    });
  };

  // Calculate stats
  const stats = [
    {
      label: "Total avoirs",
      value: formatCurrency(creditNotes.filter((cn) => cn.status !== "cancelled").reduce((sum, cn) => sum + cn.amount, 0)),
      unit: "FCFA",
    },
    {
      label: "En attente",
      value: formatCurrency(creditNotes.filter((cn) => cn.status === "pending").reduce((sum, cn) => sum + cn.amount, 0)),
      unit: "FCFA",
      count: creditNotes.filter((cn) => cn.status === "pending").length,
    },
    {
      label: "Remboursés",
      value: formatCurrency(creditNotes.filter((cn) => cn.status === "refunded").reduce((sum, cn) => sum + cn.amount, 0)),
      unit: "FCFA",
    },
    {
      label: "Compensés",
      value: formatCurrency(creditNotes.filter((cn) => cn.status === "applied").reduce((sum, cn) => sum + cn.amount, 0)),
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
                  <p className="text-2xl font-bold font-heading mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.unit}
                    {"count" in stat && ` (${stat.count} avoir${stat.count > 1 ? "s" : ""})`}
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="refunded">Remboursés</SelectItem>
              <SelectItem value="applied">Compensés</SelectItem>
              <SelectItem value="cancelled">Annulés</SelectItem>
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
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreditNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun avoir trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCreditNotes.map((creditNote) => {
                    const StatusIcon = statusConfig[creditNote.status].icon;
                    return (
                      <TableRow key={creditNote.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{creditNote.number}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {creditNote.invoiceNumber}
                        </TableCell>
                        <TableCell>{creditNote.client}</TableCell>
                        <TableCell>{creditNote.date}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          -{formatCurrency(creditNote.amount)} FCFA
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={creditNote.reason}>
                          {creditNote.reason}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig[creditNote.status].class}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[creditNote.status].label}
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
                              <DropdownMenuItem onClick={() => handleDownloadPDF(creditNote)}>
                                <FileDown className="h-4 w-4 mr-2" />
                                Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              {creditNote.status === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedCreditNote(creditNote);
                                      setRefundDialogOpen(true);
                                    }}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Traiter le remboursement
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleCancel(creditNote)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Annuler l'avoir
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
          invoices={invoicesForAvoir}
          onAvoirCreated={handleAvoirCreated}
        />

        {/* Refund Dialog */}
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Traiter le remboursement</DialogTitle>
              <DialogDescription>
                {selectedCreditNote && (
                  <>
                    Avoir {selectedCreditNote.number} - {formatCurrency(selectedCreditNote.amount)}{" "}
                    FCFA
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Mode de remboursement</Label>
                <Select
                  value={refundForm.method}
                  onValueChange={(value: CreditNote["refundMethod"]) =>
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
              {refundForm.method === "compensation" && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Le montant de l'avoir sera déduit des prochaines factures du client.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleProcessRefund}>Confirmer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
