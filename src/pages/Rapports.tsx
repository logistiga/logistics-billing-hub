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
  ChevronDown,
  Building,
  TrendingUp,
  Banknote,
  Landmark,
  Package,
  Truck,
  Warehouse,
  Settings2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Mock data
const clients = [
  { id: "1", nom: "Total Gabon", ville: "Libreville" },
  { id: "2", nom: "Comilog", ville: "Moanda" },
  { id: "3", nom: "Assala Energy", ville: "Port-Gentil" },
  { id: "4", nom: "Perenco", ville: "Port-Gentil" },
  { id: "5", nom: "Maurel & Prom", ville: "Libreville" },
  { id: "6", nom: "SEEG", ville: "Libreville" },
  { id: "7", nom: "Olam Gabon", ville: "Libreville" },
];

const typesRapport = [
  {
    id: "clients",
    titre: "Rapport Clients",
    description: "Historique et statistiques par client",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "factures",
    titre: "Rapport Factures",
    description: "Liste des factures par période et statut",
    icon: FileCheck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "ordres",
    titre: "Rapport Ordres de Travail",
    description: "Ordres par type d'opération",
    icon: ClipboardList,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "tresorerie",
    titre: "Rapport Trésorerie",
    description: "Mouvements caisse et banque",
    icon: TrendingUp,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "devis",
    titre: "Rapport Devis",
    description: "Devis émis et taux de conversion",
    icon: Receipt,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

const typesOperation = [
  { id: "manutention", label: "Manutention", icon: Package },
  { id: "transport", label: "Transport", icon: Truck },
  { id: "stockage", label: "Stockage", icon: Warehouse },
  { id: "transit", label: "Transit", icon: Building },
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
  const [groupBy, setGroupBy] = useState("date");

  const filteredClients = clients.filter((c) =>
    c.nom.toLowerCase().includes(searchClient.toLowerCase())
  );

  const handleSelectAllClients = (checked: boolean) => {
    setSelectAllClients(checked);
    if (checked) {
      setSelectedClients(clients.map((c) => c.id));
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

  const handleGenerateReport = () => {
    if (!selectedType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de rapport",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Génération en cours",
      description: `Le rapport ${formatExport.toUpperCase()} est en cours de génération...`,
    });

    // Simulation de génération
    setTimeout(() => {
      toast({
        title: "Rapport généré",
        description: "Le téléchargement va commencer automatiquement",
      });
    }, 1500);
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

    toast({
      title: "Aperçu",
      description: "Ouverture de l'aperçu du rapport...",
    });
  };

  const getSelectedCount = () => {
    let count = 0;
    if (selectedClients.length > 0) count++;
    if (selectedOperations.length > 0) count++;
    if (selectedStatuts.length > 0) count++;
    return count;
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

                      {selectedOperations.includes("transport") && (
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
                  <Select value={groupBy} onValueChange={setGroupBy}>
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
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button
              className="flex-1"
              onClick={handleGenerateReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Générer et télécharger
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                handleGenerateReport();
                setTimeout(() => window.print(), 2000);
              }}
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
