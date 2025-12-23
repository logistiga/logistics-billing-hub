import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  FileText,
  ClipboardList,
  Receipt,
  ReceiptText,
  Users,
  Calendar,
  Clock,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Download,
  History,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Types
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: "facture" | "ordre" | "devis" | "avoir" | "rapport" | "notification";
  description: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface ScheduledNotification {
  id: string;
  name: string;
  type: "factures_retard" | "paiements_recus" | "rapport_mensuel" | "rappel_echeance";
  description: string;
  frequency: "quotidien" | "hebdomadaire" | "mensuel";
  hour: string;
  isActive: boolean;
  lastRun: string | null;
  nextRun: string;
  conditions: {
    delayDays?: number;
    includeDetails?: boolean;
  };
}

interface EmailHistory {
  id: string;
  to: string;
  subject: string;
  type: string;
  status: "sent" | "failed" | "pending";
  sentAt: string;
  attachments: string[];
}

interface Client {
  id: string;
  name: string;
  email: string;
}

// Mock data
const mockTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Envoi Facture",
    subject: "Facture N° {numero} - LOGISTIGA SARL",
    type: "facture",
    description: "Modèle pour l'envoi des factures aux clients",
    content: `Cher(e) {client_nom},

Veuillez trouver ci-joint la facture N° {numero} d'un montant de {montant} FCFA.

Date d'échéance : {date_echeance}

Cordialement,
LOGISTIGA SARL`,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Envoi Ordre de Travail",
    subject: "Ordre de Travail N° {numero} - LOGISTIGA SARL",
    type: "ordre",
    description: "Modèle pour l'envoi des ordres de travail",
    content: `Cher(e) {client_nom},

Veuillez trouver ci-joint l'ordre de travail N° {numero}.

Détails de la prestation :
- Service : {service}
- Date : {date}

Cordialement,
LOGISTIGA SARL`,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "Envoi Devis",
    subject: "Devis N° {numero} - LOGISTIGA SARL",
    type: "devis",
    description: "Modèle pour l'envoi des devis",
    content: `Cher(e) {client_nom},

Suite à votre demande, veuillez trouver ci-joint notre devis N° {numero} d'un montant de {montant} FCFA.

Ce devis est valable jusqu'au {date_validite}.

Cordialement,
LOGISTIGA SARL`,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "4",
    name: "Envoi Avoir",
    subject: "Avoir N° {numero} - LOGISTIGA SARL",
    type: "avoir",
    description: "Modèle pour l'envoi des avoirs",
    content: `Cher(e) {client_nom},

Veuillez trouver ci-joint l'avoir N° {numero} d'un montant de {montant} FCFA.

Motif : {motif}

Cordialement,
LOGISTIGA SARL`,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "5",
    name: "Rapport Paiements Client",
    subject: "Rapport de paiements - {periode} - LOGISTIGA SARL",
    type: "rapport",
    description: "Rapport des paiements reçus d'un client sur une période",
    content: `Cher(e) {client_nom},

Veuillez trouver ci-joint le rapport de vos paiements pour la période du {date_debut} au {date_fin}.

Total payé : {total_paye} FCFA

Cordialement,
LOGISTIGA SARL`,
    isActive: true,
    createdAt: "2024-01-20",
  },
  {
    id: "6",
    name: "Rapport Factures Impayées",
    subject: "Relevé de factures impayées - LOGISTIGA SARL",
    type: "rapport",
    description: "Rapport des factures impayées d'un client",
    content: `Cher(e) {client_nom},

Nous vous informons que les factures suivantes restent impayées à ce jour :

{liste_factures}

Montant total dû : {montant_total} FCFA

Nous vous prions de bien vouloir régulariser votre situation.

Cordialement,
LOGISTIGA SARL`,
    isActive: true,
    createdAt: "2024-01-20",
  },
  {
    id: "7",
    name: "Rapport Mensuel",
    subject: "Rapport mensuel - {mois} {annee} - LOGISTIGA SARL",
    type: "rapport",
    description: "Rapport mensuel complet (factures + paiements)",
    content: `Cher(e) {client_nom},

Veuillez trouver ci-joint votre rapport mensuel pour {mois} {annee}.

Résumé :
- Factures émises : {nb_factures}
- Montant facturé : {montant_facture} FCFA
- Paiements reçus : {montant_paye} FCFA
- Solde : {solde} FCFA

Cordialement,
LOGISTIGA SARL`,
    isActive: true,
    createdAt: "2024-01-25",
  },
];

const mockNotifications: ScheduledNotification[] = [
  {
    id: "1",
    name: "Factures en retard (+30 jours)",
    type: "factures_retard",
    description: "Notification quotidienne pour les factures impayées depuis plus de 30 jours",
    frequency: "quotidien",
    hour: "08:00",
    isActive: true,
    lastRun: "2024-01-15 08:00",
    nextRun: "2024-01-16 08:00",
    conditions: {
      delayDays: 30,
      includeDetails: true,
    },
  },
  {
    id: "2",
    name: "Rappel échéance proche",
    type: "rappel_echeance",
    description: "Notification pour les factures arrivant à échéance dans 7 jours",
    frequency: "quotidien",
    hour: "09:00",
    isActive: true,
    lastRun: "2024-01-15 09:00",
    nextRun: "2024-01-16 09:00",
    conditions: {
      delayDays: 7,
      includeDetails: true,
    },
  },
  {
    id: "3",
    name: "Récapitulatif paiements hebdo",
    type: "paiements_recus",
    description: "Récapitulatif hebdomadaire des paiements reçus",
    frequency: "hebdomadaire",
    hour: "10:00",
    isActive: false,
    lastRun: "2024-01-08 10:00",
    nextRun: "2024-01-15 10:00",
    conditions: {
      includeDetails: true,
    },
  },
  {
    id: "4",
    name: "Rapport mensuel automatique",
    type: "rapport_mensuel",
    description: "Envoi automatique du rapport mensuel aux clients",
    frequency: "mensuel",
    hour: "08:00",
    isActive: true,
    lastRun: "2024-01-01 08:00",
    nextRun: "2024-02-01 08:00",
    conditions: {
      includeDetails: true,
    },
  },
];

const mockHistory: EmailHistory[] = [
  {
    id: "1",
    to: "contact@comilog.ga",
    subject: "Facture N° FAC-2024-0042 - LOGISTIGA SARL",
    type: "Facture",
    status: "sent",
    sentAt: "2024-01-15 14:30",
    attachments: ["FAC-2024-0042.pdf"],
  },
  {
    id: "2",
    to: "info@olamgabon.com",
    subject: "Ordre de Travail N° OT-2024-0089 - LOGISTIGA SARL",
    type: "Ordre",
    status: "sent",
    sentAt: "2024-01-15 11:20",
    attachments: ["OT-2024-0089.pdf"],
  },
  {
    id: "3",
    to: "gabon@totalenergies.com",
    subject: "Rapport mensuel - Janvier 2024 - LOGISTIGA SARL",
    type: "Rapport",
    status: "sent",
    sentAt: "2024-01-14 08:00",
    attachments: ["Rapport_Janvier_2024.pdf"],
  },
  {
    id: "4",
    to: "contact@assalaenergy.com",
    subject: "Devis N° DEV-2024-0015 - LOGISTIGA SARL",
    type: "Devis",
    status: "failed",
    sentAt: "2024-01-13 16:45",
    attachments: ["DEV-2024-0015.pdf"],
  },
];

const mockClients: Client[] = [
  { id: "1", name: "COMILOG SA", email: "contact@comilog.ga" },
  { id: "2", name: "OLAM Gabon", email: "info@olamgabon.com" },
  { id: "3", name: "Total Energies Gabon", email: "gabon@totalenergies.com" },
  { id: "4", name: "Assala Energy", email: "contact@assalaenergy.com" },
];

const documentTypes = [
  { value: "facture", label: "Facture", icon: FileText },
  { value: "ordre", label: "Ordre de travail", icon: ClipboardList },
  { value: "devis", label: "Devis", icon: Receipt },
  { value: "avoir", label: "Avoir", icon: ReceiptText },
];

const reportTypes = [
  { value: "paiements", label: "Rapport de paiements" },
  { value: "impayes", label: "Factures impayées" },
  { value: "mensuel", label: "Rapport mensuel complet" },
];

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

export default function Emails() {
  const [activeTab, setActiveTab] = useState("envoyer");
  const [templates, setTemplates] = useState(mockTemplates);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Send document state
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [includePdf, setIncludePdf] = useState(true);
  
  // Send report state
  const [selectedReportType, setSelectedReportType] = useState("");
  const [reportClient, setReportClient] = useState("");
  const [reportPeriodStart, setReportPeriodStart] = useState("");
  const [reportPeriodEnd, setReportPeriodEnd] = useState("");
  
  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  
  // Notification dialog
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<ScheduledNotification | null>(null);

  // Mock documents
  const mockDocuments: Record<string, { number: string; client: string; amount: number }[]> = {
    facture: [
      { number: "FAC-2024-0042", client: "COMILOG SA", amount: 2500000 },
      { number: "FAC-2024-0041", client: "OLAM Gabon", amount: 1800000 },
      { number: "FAC-2024-0040", client: "Total Energies Gabon", amount: 5200000 },
    ],
    ordre: [
      { number: "OT-2024-0089", client: "COMILOG SA", amount: 850000 },
      { number: "OT-2024-0088", client: "Assala Energy", amount: 1200000 },
    ],
    devis: [
      { number: "DEV-2024-0015", client: "OLAM Gabon", amount: 3500000 },
      { number: "DEV-2024-0014", client: "Total Energies Gabon", amount: 2100000 },
    ],
    avoir: [
      { number: "AV-2024-0005", client: "COMILOG SA", amount: 450000 },
    ],
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    const client = mockClients.find((c) => c.id === clientId);
    if (client) {
      setEmailTo(client.email);
    }
  };

  const handleReportClientSelect = (clientId: string) => {
    setReportClient(clientId);
  };

  const handleSendDocument = () => {
    if (!selectedDocType || !selectedDocument || !emailTo) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    toast.success(`Email envoyé avec succès à ${emailTo}`);
    // Reset form
    setSelectedDocType("");
    setSelectedDocument("");
    setSelectedClient("");
    setEmailTo("");
    setEmailSubject("");
    setEmailMessage("");
  };

  const handleSendReport = () => {
    if (!selectedReportType || !reportClient || !reportPeriodStart || !reportPeriodEnd) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    const client = mockClients.find((c) => c.id === reportClient);
    toast.success(`Rapport envoyé avec succès à ${client?.email}`);
    // Reset form
    setSelectedReportType("");
    setReportClient("");
    setReportPeriodStart("");
    setReportPeriodEnd("");
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n))
    );
    const notification = notifications.find((n) => n.id === id);
    toast.success(
      notification?.isActive
        ? "Notification désactivée"
        : "Notification activée"
    );
  };

  const handleSaveTemplate = () => {
    toast.success("Modèle enregistré avec succès");
    setTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveNotification = () => {
    toast.success("Notification enregistrée avec succès");
    setNotificationDialogOpen(false);
    setEditingNotification(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value) + " FCFA";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-emerald-500/10 text-emerald-500">Envoyé</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive">Échec</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500">En attente</Badge>;
      default:
        return null;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "quotidien":
        return "Tous les jours";
      case "hebdomadaire":
        return "Chaque semaine";
      case "mensuel":
        return "Chaque mois";
      default:
        return frequency;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Gestion des Emails
            </h1>
            <p className="text-muted-foreground mt-1">
              Envoyez des documents, rapports et gérez les notifications automatiques
            </p>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-muted-foreground">Emails envoyés ce mois</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">98%</p>
                    <p className="text-xs text-muted-foreground">Taux de livraison</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">4</p>
                    <p className="text-xs text-muted-foreground">Notifications actives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">7</p>
                    <p className="text-xs text-muted-foreground">Modèles disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="envoyer" className="gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Envoyer Document</span>
              <span className="sm:hidden">Doc</span>
            </TabsTrigger>
            <TabsTrigger value="rapports" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Rapports Client</span>
              <span className="sm:hidden">Rapports</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications Auto</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="modeles" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Modèles</span>
              <span className="sm:hidden">Modèles</span>
            </TabsTrigger>
            <TabsTrigger value="historique" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historique</span>
              <span className="sm:hidden">Hist</span>
            </TabsTrigger>
          </TabsList>

          {/* Envoyer Document Tab */}
          <TabsContent value="envoyer" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Envoyer un Document par Email
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez un document et envoyez-le avec son PDF en pièce jointe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type de document *</Label>
                    <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDocType && (
                    <div className="space-y-2">
                      <Label>Document *</Label>
                      <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le document" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockDocuments[selectedDocType]?.map((doc) => (
                            <SelectItem key={doc.number} value={doc.number}>
                              <div className="flex flex-col">
                                <span className="font-medium">{doc.number}</span>
                                <span className="text-xs text-muted-foreground">
                                  {doc.client} - {formatCurrency(doc.amount)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Client *</Label>
                    <Select value={selectedClient} onValueChange={handleClientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le client" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{client.name}</span>
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Email destinataire *</Label>
                    <Input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="email@entreprise.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Objet (optionnel)</Label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="L'objet sera généré automatiquement si vide"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message personnalisé (optionnel)</Label>
                    <Textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Message additionnel..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Inclure le PDF en pièce jointe</span>
                    </div>
                    <Switch checked={includePdf} onCheckedChange={setIncludePdf} />
                  </div>

                  <Button onClick={handleSendDocument} className="w-full" variant="gradient">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer l'email
                  </Button>
                </CardContent>
              </Card>

              {/* Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Aperçu de l'email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-muted/30 min-h-[400px]">
                    {selectedDocument ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">De:</p>
                          <p className="text-sm">noreply@logistiga.com</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">À:</p>
                          <p className="text-sm">{emailTo || "..."}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Objet:</p>
                          <p className="text-sm font-medium">
                            {emailSubject || `${documentTypes.find((t) => t.value === selectedDocType)?.label} N° ${selectedDocument} - LOGISTIGA SARL`}
                          </p>
                        </div>
                        <div className="border-t pt-4">
                          <p className="text-sm whitespace-pre-line">
                            {emailMessage || templates.find((t) => t.type === selectedDocType)?.content}
                          </p>
                        </div>
                        {includePdf && (
                          <div className="border-t pt-4">
                            <p className="text-xs text-muted-foreground mb-2">Pièce jointe:</p>
                            <div className="flex items-center gap-2 p-2 rounded bg-background border">
                              <FileText className="h-4 w-4 text-red-500" />
                              <span className="text-sm">{selectedDocument}.pdf</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Sélectionnez un document pour voir l'aperçu</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rapports Client Tab */}
          <TabsContent value="rapports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Envoyer un Rapport Client
                  </CardTitle>
                  <CardDescription>
                    Générez et envoyez des rapports personnalisés à vos clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type de rapport *</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type de rapport" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Client *</Label>
                    <Select value={reportClient} onValueChange={handleReportClientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le client" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{client.name}</span>
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date début *</Label>
                      <Input
                        type="date"
                        value={reportPeriodStart}
                        onChange={(e) => setReportPeriodStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date fin *</Label>
                      <Input
                        type="date"
                        value={reportPeriodEnd}
                        onChange={(e) => setReportPeriodEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <h4 className="font-medium text-sm">Options du rapport</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inclure les détails des factures</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inclure les paiements</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inclure graphiques</span>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSendReport} className="w-full" variant="gradient">
                    <Send className="h-4 w-4 mr-2" />
                    Générer et envoyer le rapport
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Envoyer rappel à tous les clients avec impayés
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                      Envoyer rapport mensuel à tous les clients
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      Planifier envoi rapport trimestriel
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aperçu du rapport</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReportType && reportClient ? (
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span className="font-medium">
                            {mockClients.find((c) => c.id === reportClient)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{reportTypes.find((t) => t.value === selectedReportType)?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Période:</span>
                          <span>
                            {reportPeriodStart && reportPeriodEnd
                              ? `${reportPeriodStart} - ${reportPeriodEnd}`
                              : "Non définie"}
                          </span>
                        </div>
                        <div className="border-t pt-3 mt-3">
                          <p className="text-muted-foreground">Contenu estimé:</p>
                          <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                            <li>12 factures émises</li>
                            <li>8 paiements reçus</li>
                            <li>Montant total: 15,500,000 FCFA</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Sélectionnez un type de rapport et un client
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Automatiques Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications Automatiques
                  </CardTitle>
                  <CardDescription>
                    Configurez les emails automatiques envoyés selon des conditions
                  </CardDescription>
                </div>
                <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingNotification ? "Modifier la notification" : "Nouvelle notification"}
                      </DialogTitle>
                      <DialogDescription>
                        Configurez une notification automatique
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nom de la notification *</Label>
                        <Input placeholder="Ex: Factures en retard" />
                      </div>
                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="factures_retard">Factures en retard</SelectItem>
                            <SelectItem value="rappel_echeance">Rappel échéance proche</SelectItem>
                            <SelectItem value="paiements_recus">Récapitulatif paiements</SelectItem>
                            <SelectItem value="rapport_mensuel">Rapport mensuel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fréquence *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la fréquence" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quotidien">Quotidien</SelectItem>
                            <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                            <SelectItem value="mensuel">Mensuel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Heure d'envoi *</Label>
                        <Input type="time" defaultValue="08:00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Délai en jours (pour retards)</Label>
                        <Input type="number" placeholder="30" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Description de la notification..." rows={2} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button variant="gradient" onClick={handleSaveNotification}>
                        Enregistrer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={itemVariants}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            notification.isActive
                              ? "bg-emerald-500/10"
                              : "bg-muted"
                          )}
                        >
                          {notification.isActive ? (
                            <Play className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Pause className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getFrequencyLabel(notification.frequency)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notification.hour}
                            </span>
                            {notification.conditions.delayDays && (
                              <span>Délai: {notification.conditions.delayDays} jours</span>
                            )}
                            {notification.lastRun && (
                              <span>Dernier envoi: {notification.lastRun}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={notification.isActive}
                          onCheckedChange={() => toggleNotification(notification.id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingNotification(notification);
                                setNotificationDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Exécuter maintenant
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modèles Tab */}
          <TabsContent value="modeles" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Modèles d'emails
                  </CardTitle>
                  <CardDescription>
                    Gérez les modèles utilisés pour les différents types d'emails
                  </CardDescription>
                </div>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau modèle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTemplate ? "Modifier le modèle" : "Nouveau modèle"}
                      </DialogTitle>
                      <DialogDescription>
                        Utilisez les variables entre accolades pour personnaliser: {"{client_nom}"}, {"{numero}"}, {"{montant}"}...
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom du modèle *</Label>
                          <Input
                            placeholder="Ex: Envoi Facture"
                            defaultValue={editingTemplate?.name}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type *</Label>
                          <Select defaultValue={editingTemplate?.type}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="facture">Facture</SelectItem>
                              <SelectItem value="ordre">Ordre de travail</SelectItem>
                              <SelectItem value="devis">Devis</SelectItem>
                              <SelectItem value="avoir">Avoir</SelectItem>
                              <SelectItem value="rapport">Rapport</SelectItem>
                              <SelectItem value="notification">Notification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Objet de l'email *</Label>
                        <Input
                          placeholder="Ex: Facture N° {numero} - LOGISTIGA SARL"
                          defaultValue={editingTemplate?.subject}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Description du modèle"
                          defaultValue={editingTemplate?.description}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contenu de l'email *</Label>
                        <Textarea
                          placeholder="Contenu du message..."
                          rows={10}
                          defaultValue={editingTemplate?.content}
                        />
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Variables disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                          {["{client_nom}", "{numero}", "{montant}", "{date}", "{date_echeance}", "{date_validite}", "{service}", "{motif}", "{periode}"].map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button variant="gradient" onClick={handleSaveTemplate}>
                        Enregistrer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      variants={itemVariants}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {template.type}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingTemplate(template);
                                setTemplateDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Prévisualiser
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        "{template.subject}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historique Tab */}
          <TabsContent value="historique" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Historique des emails
                    </CardTitle>
                    <CardDescription>
                      Consultez tous les emails envoyés depuis l'application
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destinataire</TableHead>
                      <TableHead>Objet</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Pièces jointes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHistory.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="font-medium">{email.to}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{email.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{email.type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(email.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{email.sentAt}</TableCell>
                        <TableCell>
                          {email.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {email.attachments.length}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Renvoyer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
