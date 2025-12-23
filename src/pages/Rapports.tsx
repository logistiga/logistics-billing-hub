import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Users,
  FileCheck,
  ClipboardList,
  Receipt,
  Filter,
  Search,
  Building,
  TrendingUp,
  Package,
  Truck,
  Warehouse,
  Settings2,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import {
  generateRapport,
  type RapportFilters,
  type Client,
  type Facture,
  type OrdreTravail,
  type TransactionTresorerie,
  type Devis,
} from "@/lib/generateRapportPDF";

// Mock data - Clients
const mockClients: Client[] = [
  { id: "1", nom: "Total Gabon", ville: "Libreville", telephone: "+241 01 76 00 00", email: "contact@total.ga" },
  { id: "2", nom: "Comilog SA", ville: "Moanda", telephone: "+241 01 66 00 00", email: "info@comilog.com" },
  { id: "3", nom: "Assala Energy", ville: "Port-Gentil", telephone: "+241 01 55 00 00", email: "contact@assala.com" },
  { id: "4", nom: "Perenco Gabon", ville: "Port-Gentil", telephone: "+241 01 56 00 00", email: "info@perenco.com" },
  { id: "5", nom: "Maurel & Prom", ville: "Libreville", telephone: "+241 01 77 00 00", email: "contact@maureletprom.fr" },
  { id: "6", nom: "SEEG", ville: "Libreville", telephone: "+241 01 72 00 00", email: "contact@seeg.ga" },
  { id: "7", nom: "Olam Gabon", ville: "Libreville", telephone: "+241 01 73 00 00", email: "info@olamgroup.com" },
  { id: "8", nom: "GSEZ", ville: "Nkok", telephone: "+241 01 44 00 00", email: "contact@gsez.com" },
];

// Mock data - Factures
const mockFactures: Facture[] = [
  { id: "1", numero: "FAC-2024-0142", client: "Comilog SA", clientId: "2", date: "2024-12-14", dateEcheance: "2025-01-14", montant: 3250000, montantPaye: 3250000, statut: "payee", type: "Transport", sousType: "hors_libreville" },
  { id: "2", numero: "FAC-2024-0141", client: "Olam Gabon", clientId: "7", date: "2024-12-13", dateEcheance: "2025-01-13", montant: 1875000, montantPaye: 0, statut: "en_attente", type: "Manutention" },
  { id: "3", numero: "FAC-2024-0140", client: "Total Gabon", clientId: "1", date: "2024-12-12", dateEcheance: "2025-01-12", montant: 5420000, montantPaye: 5420000, statut: "payee", type: "Transport", sousType: "exportation" },
  { id: "4", numero: "FAC-2024-0139", client: "Assala Energy", clientId: "3", date: "2024-12-10", dateEcheance: "2025-01-10", montant: 2100000, montantPaye: 0, statut: "en_retard", type: "Stockage" },
  { id: "5", numero: "FAC-2024-0138", client: "SEEG", clientId: "6", date: "2024-12-09", dateEcheance: "2025-01-09", montant: 890000, montantPaye: 450000, statut: "partielle", type: "Location" },
  { id: "6", numero: "FAC-2024-0137", client: "Perenco Gabon", clientId: "4", date: "2024-12-08", dateEcheance: "2025-01-08", montant: 4500000, montantPaye: 4500000, statut: "payee", type: "Transport", sousType: "importation" },
  { id: "7", numero: "FAC-2024-0136", client: "GSEZ", clientId: "8", date: "2024-12-05", dateEcheance: "2025-01-05", montant: 2300000, montantPaye: 0, statut: "en_attente", type: "Manutention" },
  { id: "8", numero: "FAC-2024-0135", client: "Maurel & Prom", clientId: "5", date: "2024-12-03", dateEcheance: "2025-01-03", montant: 1650000, montantPaye: 1650000, statut: "payee", type: "Transit" },
];

// Mock data - Ordres de travail
const mockOrdres: OrdreTravail[] = [
  { id: "1", numero: "OT-2024-0089", client: "Comilog SA", clientId: "2", date: "2024-12-14", type: "Transport", sousType: "hors_libreville", statut: "termine", montant: 3250000 },
  { id: "2", numero: "OT-2024-0088", client: "Total Gabon", clientId: "1", date: "2024-12-13", type: "Manutention", statut: "en_cours", montant: 1500000 },
  { id: "3", numero: "OT-2024-0087", client: "Olam Gabon", clientId: "7", date: "2024-12-12", type: "Stockage", statut: "termine", montant: 850000 },
  { id: "4", numero: "OT-2024-0086", client: "Assala Energy", clientId: "3", date: "2024-12-11", type: "Transport", sousType: "exportation", statut: "planifie", montant: 2800000 },
  { id: "5", numero: "OT-2024-0085", client: "SEEG", clientId: "6", date: "2024-12-10", type: "Manutention", statut: "termine", montant: 920000 },
  { id: "6", numero: "OT-2024-0084", client: "Perenco Gabon", clientId: "4", date: "2024-12-09", type: "Transport", sousType: "importation", statut: "en_cours", montant: 4200000 },
];

// Mock data - Transactions trésorerie
const mockTransactions: TransactionTresorerie[] = [
  { id: "1", date: "2024-12-14", reference: "CAI-001", description: "Paiement client Comilog", type: "entree", montant: 3250000, categorie: "Règlement client", source: "caisse" },
  { id: "2", date: "2024-12-13", reference: "BNK-045", description: "Virement Total Gabon", type: "entree", montant: 5420000, categorie: "Règlement client", source: "banque", banque: "BGFI Bank" },
  { id: "3", date: "2024-12-12", reference: "CAI-002", description: "Achat carburant véhicules", type: "sortie", montant: 850000, categorie: "Carburant", source: "caisse" },
  { id: "4", date: "2024-12-11", reference: "BNK-046", description: "Salaires décembre", type: "sortie", montant: 4500000, categorie: "Salaires", source: "banque", banque: "UGB" },
  { id: "5", date: "2024-12-10", reference: "CAI-003", description: "Paiement client SEEG", type: "entree", montant: 450000, categorie: "Règlement client", source: "caisse" },
  { id: "6", date: "2024-12-09", reference: "BNK-047", description: "Virement Perenco", type: "entree", montant: 4500000, categorie: "Règlement client", source: "banque", banque: "BGFI Bank" },
  { id: "7", date: "2024-12-08", reference: "CAI-004", description: "Fournitures bureau", type: "sortie", montant: 125000, categorie: "Fournitures", source: "caisse" },
  { id: "8", date: "2024-12-07", reference: "BNK-048", description: "Maintenance véhicules", type: "sortie", montant: 750000, categorie: "Entretien", source: "banque", banque: "BGFI Bank" },
];

// Mock data - Devis
const mockDevis: Devis[] = [
  { id: "1", numero: "DEV-2024-0056", client: "Comilog SA", clientId: "2", date: "2024-12-10", validite: "2025-01-10", montant: 4500000, statut: "accepte", type: "Transport" },
  { id: "2", numero: "DEV-2024-0055", client: "Total Gabon", clientId: "1", date: "2024-12-08", validite: "2025-01-08", montant: 3200000, statut: "en_attente", type: "Manutention" },
  { id: "3", numero: "DEV-2024-0054", client: "GSEZ", clientId: "8", date: "2024-12-05", validite: "2025-01-05", montant: 2100000, statut: "accepte", type: "Stockage" },
  { id: "4", numero: "DEV-2024-0053", client: "Olam Gabon", clientId: "7", date: "2024-12-03", validite: "2025-01-03", montant: 1800000, statut: "refuse", type: "Transport" },
  { id: "5", numero: "DEV-2024-0052", client: "Assala Energy", clientId: "3", date: "2024-12-01", validite: "2025-01-01", montant: 5500000, statut: "expire", type: "Transit" },
];

const typesRapport = [
  { id: "clients", titre: "Rapport Clients", description: "Historique et statistiques par client", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "factures", titre: "Rapport Factures", description: "Liste des factures par période et statut", icon: FileCheck, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: "ordres", titre: "Rapport Ordres de Travail", description: "Ordres par type d'opération", icon: ClipboardList, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "tresorerie", titre: "Rapport Trésorerie", description: "Mouvements caisse et banque", icon: TrendingUp, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  { id: "devis", titre: "Rapport Devis", description: "Devis émis et taux de conversion", icon: Receipt, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
];

const typesOperation = [
  { id: "Manutention", label: "Manutention", icon: Package },
  { id: "Transport", label: "Transport", icon: Truck },
  { id: "Stockage", label: "Stockage", icon: Warehouse },
  { id: "Transit", label: "Transit", icon: Building },
];

const sousTypesTransport = [
  { id: "libreville", label: "Libreville" },
  { id: "hors_libreville", label: "Hors Libreville" },
  { id: "importation", label: "Importation" },
  { id: "exportation", label: "Exportation" },
];

const statutsFacture = [
  { id: "payee", label: "Payée", color: "bg-emerald-500" },
  { id: "en_attente", label: "En attente", color: "bg-amber-500" },
  { id: "en_retard", label: "En retard", color: "bg-destructive" },
  { id: "annulee", label: "Annulée", color: "bg-gray-500" },
];

const formatsPeriode = [
  { id: "jour", label: "Aujourd'hui" },
  { id: "semaine", label: "Cette semaine" },
  { id: "mois", label: "Ce mois" },
  { id: "trimestre", label: "Ce trimestre" },
  { id: "annee", label: "Cette année" },
  { id: "personnalise", label: "Personnalisé" },
];

export default function Rapports() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectAllClients, setSelectAllClients] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [selectedSousTypes, setSelectedSousTypes] = useState<string[]>([]);
  const [selectedStatuts, setSelectedStatuts] = useState<string[]>([]);
  const [periodeType, setPeriodeType] = useState("mois");
  const [dateDebut, setDateDebut] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [dateFin, setDateFin] = useState(() => new Date().toISOString().split("T")[0]);
  const [formatExport, setFormatExport] = useState<"pdf" | "excel">("pdf");
  const [searchClient, setSearchClient] = useState("");
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeGraphiques, setIncludeGraphiques] = useState(false);
  const [groupBy, setGroupBy] = useState<"date" | "client" | "type" | "statut">("date");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredClients = mockClients.filter((c) =>
    c.nom.toLowerCase().includes(searchClient.toLowerCase())
  );

  const handleSelectAllClients = (checked: boolean) => {
    setSelectAllClients(checked);
    if (checked) {
      setSelectedClients(mockClients.map((c) => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleClientToggle = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleOperationToggle = (opId: string) => {
    setSelectedOperations((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    );
  };

  const handleSousTypeToggle = (stId: string) => {
    setSelectedSousTypes((prev) =>
      prev.includes(stId) ? prev.filter((id) => id !== stId) : [...prev, stId]
    );
  };

  const handleStatutToggle = (statutId: string) => {
    setSelectedStatuts((prev) =>
      prev.includes(statutId) ? prev.filter((id) => id !== statutId) : [...prev, statutId]
    );
  };

  const handlePeriodeChange = (value: string) => {
    setPeriodeType(value);
    const today = new Date();
    let start = new Date();

    switch (value) {
      case "jour":
        start = today;
        break;
      case "semaine":
        start.setDate(today.getDate() - 7);
        break;
      case "mois":
        start.setDate(1);
        break;
      case "trimestre":
        start.setMonth(today.getMonth() - 3);
        start.setDate(1);
        break;
      case "annee":
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    if (value !== "personnalise") {
      setDateDebut(start.toISOString().split("T")[0]);
      setDateFin(today.toISOString().split("T")[0]);
    }
  };

  const filterData = () => {
    // Filter factures
    let filteredFactures = mockFactures.filter((f) => {
      const dateOk = f.date >= dateDebut && f.date <= dateFin;
      const clientOk = selectedClients.length === 0 || selectedClients.includes(f.clientId);
      const typeOk = selectedOperations.length === 0 || selectedOperations.includes(f.type);
      const statutOk = selectedStatuts.length === 0 || selectedStatuts.includes(f.statut);
      return dateOk && clientOk && typeOk && statutOk;
    });

    // Filter ordres
    let filteredOrdres = mockOrdres.filter((o) => {
      const dateOk = o.date >= dateDebut && o.date <= dateFin;
      const clientOk = selectedClients.length === 0 || selectedClients.includes(o.clientId);
      const typeOk = selectedOperations.length === 0 || selectedOperations.includes(o.type);
      return dateOk && clientOk && typeOk;
    });

    // Filter transactions
    let filteredTransactions = mockTransactions.filter((t) => {
      return t.date >= dateDebut && t.date <= dateFin;
    });

    // Filter devis
    let filteredDevis = mockDevis.filter((d) => {
      const dateOk = d.date >= dateDebut && d.date <= dateFin;
      const clientOk = selectedClients.length === 0 || selectedClients.includes(d.clientId);
      return dateOk && clientOk;
    });

    return {
      factures: filteredFactures,
      ordres: filteredOrdres,
      transactions: filteredTransactions,
      devis: filteredDevis,
      clients: mockClients,
    };
  };

  const handleGenerateReport = async () => {
    if (!selectedType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de rapport",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const filters: RapportFilters = {
        typeRapport: selectedType as RapportFilters["typeRapport"],
        dateDebut,
        dateFin,
        clientsIds: selectedClients,
        typesOperation: selectedOperations,
        sousTypesTransport: selectedSousTypes,
        statutsFacture: selectedStatuts,
        includeDetails,
        includeGraphiques,
        groupBy,
      };

      const data = filterData();

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      generateRapport(filters, data, formatExport);

      toast({
        title: "Rapport généré avec succès",
        description: `Le fichier ${formatExport.toUpperCase()} a été téléchargé`,
      });
    } catch (error) {
      console.error("Erreur génération rapport:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du rapport",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!selectedType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de rapport",
        variant: "destructive",
      });
      return;
    }

    // For preview, we generate PDF and it opens in new tab
    handleGenerateReport();
  };

  const getSelectedCount = () => {
    let count = 0;
    if (selectedClients.length > 0) count++;
    if (selectedOperations.length > 0) count++;
    if (selectedStatuts.length > 0) count++;
    return count;
  };

  const getDataSummary = () => {
    const data = filterData();
    switch (selectedType) {
      case "factures":
        return `${data.factures.length} facture(s) trouvée(s)`;
      case "ordres":
        return `${data.ordres.length} ordre(s) de travail trouvé(s)`;
      case "tresorerie":
        return `${data.transactions.length} transaction(s) trouvée(s)`;
      case "devis":
        return `${data.devis.length} devis trouvé(s)`;
      case "clients":
        return `${selectedClients.length || mockClients.length} client(s) à analyser`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
              <p className="text-muted-foreground">
                Générez et exportez des rapports personnalisés
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Report Type Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Type de rapport
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {typesRapport.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <button
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.bgColor}`}>
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{type.titre}</p>
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                      {selectedType === type.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Format Export */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Format d'export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={formatExport === "pdf" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setFormatExport("pdf")}
                >
                  <FileText className="h-4 w-4 mr-2 text-destructive" />
                  PDF
                </Button>
                <Button
                  variant={formatExport === "excel" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setFormatExport("excel")}
                >
                  <FileCheck className="h-4 w-4 mr-2 text-emerald-500" />
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-primary">{getDataSummary()}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Panel - Filters and Options */}
        <div className="lg:col-span-2 space-y-4">
          {/* Period Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Période
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                {formatsPeriode.map((p) => (
                  <Button
                    key={p.id}
                    variant={periodeType === p.id ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handlePeriodeChange(p.id)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => {
                      setDateDebut(e.target.value);
                      setPeriodeType("personnalise");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={dateFin}
                    onChange={(e) => {
                      setDateFin(e.target.value);
                      setPeriodeType("personnalise");
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters Accordion */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filtres
                </CardTitle>
                {getSelectedCount() > 0 && (
                  <Badge variant="secondary">
                    {getSelectedCount()} filtre(s) actif(s)
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion type="multiple" className="w-full">
                {/* Clients Filter */}
                <AccordionItem value="clients">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Clients</span>
                      {selectedClients.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedClients.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher un client..."
                            value={searchClient}
                            onChange={(e) => setSearchClient(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Checkbox
                          id="all-clients"
                          checked={selectAllClients}
                          onCheckedChange={handleSelectAllClients}
                        />
                        <Label htmlFor="all-clients" className="font-medium">
                          Sélectionner tous les clients
                        </Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-muted"
                          >
                            <Checkbox
                              id={`client-${client.id}`}
                              checked={selectedClients.includes(client.id)}
                              onCheckedChange={() => handleClientToggle(client.id)}
                            />
                            <Label
                              htmlFor={`client-${client.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium">{client.nom}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({client.ville})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Operations Filter */}
                <AccordionItem value="operations">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-purple-500" />
                      <span>Types d'opération</span>
                      {selectedOperations.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedOperations.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {typesOperation.map((op) => (
                          <div
                            key={op.id}
                            onClick={() => handleOperationToggle(op.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedOperations.includes(op.id)
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-muted-foreground/30"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2 text-center">
                              <op.icon className={`h-5 w-5 ${selectedOperations.includes(op.id) ? "text-primary" : "text-muted-foreground"}`} />
                              <span className="text-xs font-medium">{op.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedOperations.includes("Transport") && (
                        <div className="pt-2 border-t">
                          <Label className="text-sm mb-2 block">Sous-types Transport</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {sousTypesTransport.map((st) => (
                              <div
                                key={st.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`st-${st.id}`}
                                  checked={selectedSousTypes.includes(st.id)}
                                  onCheckedChange={() => handleSousTypeToggle(st.id)}
                                />
                                <Label htmlFor={`st-${st.id}`} className="text-sm cursor-pointer">
                                  {st.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Invoice Status Filter */}
                <AccordionItem value="statuts">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-emerald-500" />
                      <span>Statut des factures</span>
                      {selectedStatuts.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedStatuts.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                      {statutsFacture.map((statut) => (
                        <div
                          key={statut.id}
                          onClick={() => handleStatutToggle(statut.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedStatuts.includes(statut.id)
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${statut.color}`} />
                            <span className="text-sm font-medium">{statut.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Options supplémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-details"
                      checked={includeDetails}
                      onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                    />
                    <Label htmlFor="include-details">Inclure les détails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-graphs"
                      checked={includeGraphiques}
                      onCheckedChange={(checked) => setIncludeGraphiques(checked as boolean)}
                    />
                    <Label htmlFor="include-graphs">Inclure les graphiques</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Regrouper par</Label>
                  <Select value={groupBy} onValueChange={(value) => setGroupBy(value as typeof groupBy)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="type">Type d'opération</SelectItem>
                      <SelectItem value="statut">Statut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handlePreview}
              disabled={isGenerating}
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button
              className="flex-1"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Génération..." : "Générer et télécharger"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                handleGenerateReport();
              }}
              disabled={isGenerating}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>

          {/* Summary */}
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium">Résumé :</span>
                    <Badge variant="outline">
                      {typesRapport.find((t) => t.id === selectedType)?.titre}
                    </Badge>
                    <Badge variant="secondary">
                      {periodeType === "personnalise"
                        ? `${dateDebut} → ${dateFin}`
                        : formatsPeriode.find((p) => p.id === periodeType)?.label}
                    </Badge>
                    {selectedClients.length > 0 && (
                      <Badge variant="secondary">
                        {selectedClients.length} client(s)
                      </Badge>
                    )}
                    {selectedOperations.length > 0 && (
                      <Badge variant="secondary">
                        {selectedOperations.length} type(s) d'opération
                      </Badge>
                    )}
                    {selectedStatuts.length > 0 && (
                      <Badge variant="secondary">
                        {selectedStatuts.length} statut(s)
                      </Badge>
                    )}
                    <Badge className="ml-auto">
                      Format: {formatExport.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
