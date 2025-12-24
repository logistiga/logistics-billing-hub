import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  Anchor,
  Container,
  Wrench,
  Save,
  X,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

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

// Mock data for OTs with containers
const mockOrdresTravail = [
  { id: "OT-2024-0089", client: "COMILOG SA", clientKey: "comilog", date: "15/12/2024", type: "Transport", containers: [
    { numero: "MSKU1234567", description: "Transport minerai" },
    { numero: "TCLU9876543", description: "Transport équipements" },
  ], compagnie: "Maersk" },
  { id: "OT-2024-0088", client: "OLAM Gabon", clientKey: "olam", date: "14/12/2024", type: "Manutention", containers: [
    { numero: "MSCU5544332", description: "Manutention containers" },
  ], compagnie: "MSC" },
  { id: "OT-2024-0087", client: "Total Energies", clientKey: "total", date: "14/12/2024", type: "Transport", containers: [
    { numero: "HLCU6677889", description: "Équipements pétroliers" },
    { numero: "MSKU7654321", description: "Matériel forage" },
  ], compagnie: "CMA CGM" },
  { id: "OT-2024-0086", client: "Assala Energy", clientKey: "assala", date: "13/12/2024", type: "Transport", containers: [
    { numero: "TCNU4455667", description: "Convoi exceptionnel" },
  ], compagnie: "Hapag-Lloyd" },
  { id: "OT-2024-0085", client: "SEEG", clientKey: "seeg", date: "12/12/2024", type: "Transport", containers: [
    { numero: "MSKU8899001", description: "Transport matériel" },
    { numero: "HLCU2233445", description: "Transport câbles" },
  ], compagnie: "COSCO" },
];

interface SelectedOT {
  id: string;
  otId: string;
  containers: string[];
}

interface ContainerLine {
  id: string;
  numero: string;
  otId: string;
  description: string;
}

export default function NouvelleNoteDebut() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>("");
  const [formStep, setFormStep] = useState<"type" | "form">("type");
  
  // Multi OT/Container support
  const [selectedOTs, setSelectedOTs] = useState<SelectedOT[]>([]);
  const [containerLines, setContainerLines] = useState<ContainerLine[]>([]);
  
  // Current selection for adding
  const [currentOT, setCurrentOT] = useState<string>("");
  const [currentContainers, setCurrentContainers] = useState<string[]>([]);
  const [availableContainers, setAvailableContainers] = useState<{ numero: string; description: string }[]>([]);
  
  // Common fields
  const [blNumber, setBlNumber] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [tarifJournalier, setTarifJournalier] = useState("");
  const [description, setDescription] = useState("");
  const [reparationType, setReparationType] = useState("");
  const [urgenceLevel, setUrgenceLevel] = useState("");
  const [equipe, setEquipe] = useState("");
  const [montantReparation, setMontantReparation] = useState("");
  
  // Derived values
  const getClient = () => {
    if (containerLines.length > 0) {
      const firstOT = mockOrdresTravail.find(ot => ot.id === containerLines[0].otId);
      return firstOT?.client || "";
    }
    return "";
  };

  const getCompagnie = () => {
    if (containerLines.length > 0) {
      const firstOT = mockOrdresTravail.find(ot => ot.id === containerLines[0].otId);
      return firstOT?.compagnie || "";
    }
    return "";
  };

  const nombreJours = () => {
    if (dateDebut && dateFin) {
      const start = new Date(dateDebut);
      const end = new Date(dateFin);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const montantTotal = () => {
    if (selectedType === "reparation") {
      return parseFloat(montantReparation) || 0;
    }
    const jours = nombreJours();
    const tarif = parseFloat(tarifJournalier) || 0;
    return jours * tarif * containerLines.length;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Handle OT selection
  const handleOTChange = (otId: string) => {
    setCurrentOT(otId);
    setCurrentContainers([]);
    const ot = mockOrdresTravail.find(o => o.id === otId);
    if (ot) {
      // Filter out containers already added
      const usedContainers = containerLines.map(c => c.numero);
      const available = ot.containers.filter(c => !usedContainers.includes(c.numero));
      setAvailableContainers(available);
    } else {
      setAvailableContainers([]);
    }
  };

  // Toggle container selection
  const toggleContainerSelection = (containerNumero: string) => {
    setCurrentContainers(prev => 
      prev.includes(containerNumero) 
        ? prev.filter(c => c !== containerNumero)
        : [...prev, containerNumero]
    );
  };

  // Add selected containers to the list
  const handleAddContainers = () => {
    if (!currentOT || currentContainers.length === 0) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner un OT et au moins un conteneur",
        variant: "destructive",
      });
      return;
    }

    const ot = mockOrdresTravail.find(o => o.id === currentOT);
    if (!ot) return;

    // Check if client matches (if we already have containers)
    if (containerLines.length > 0) {
      const existingOT = mockOrdresTravail.find(o => o.id === containerLines[0].otId);
      if (existingOT && existingOT.clientKey !== ot.clientKey) {
        toast({
          title: "Client différent",
          description: "Tous les OT doivent appartenir au même client",
          variant: "destructive",
        });
        return;
      }
    }

    const newLines: ContainerLine[] = currentContainers.map(containerNumero => {
      const container = ot.containers.find(c => c.numero === containerNumero);
      return {
        id: `${currentOT}-${containerNumero}`,
        numero: containerNumero,
        otId: currentOT,
        description: container?.description || "",
      };
    });

    setContainerLines(prev => [...prev, ...newLines]);
    setCurrentOT("");
    setCurrentContainers([]);
    setAvailableContainers([]);

    toast({
      title: "Conteneurs ajoutés",
      description: `${newLines.length} conteneur(s) ajouté(s) à la note`,
    });
  };

  // Remove a container line
  const handleRemoveContainer = (lineId: string) => {
    setContainerLines(prev => prev.filter(c => c.id !== lineId));
  };

  // Submit form
  const handleSubmit = () => {
    if (containerLines.length === 0) {
      toast({
        title: "Aucun conteneur",
        description: "Veuillez ajouter au moins un conteneur",
        variant: "destructive",
      });
      return;
    }

    if (!blNumber) {
      toast({
        title: "N° BL requis",
        description: "Veuillez saisir le numéro de connaissement",
        variant: "destructive",
      });
      return;
    }

    if ((selectedType === "ouverture_port" || selectedType === "detention") && (!dateDebut || !dateFin || !tarifJournalier)) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir les dates et le tarif journalier",
        variant: "destructive",
      });
      return;
    }

    if (selectedType === "reparation" && !montantReparation) {
      toast({
        title: "Montant requis",
        description: "Veuillez saisir le montant de la réparation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Note créée",
      description: `La note de début a été créée avec ${containerLines.length} conteneur(s)`,
    });
    navigate("/notes-debut");
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/notes-debut")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Nouvelle note de début
            </h1>
            <p className="text-muted-foreground mt-1">
              Créez une note avec plusieurs ordres de travail et conteneurs
            </p>
          </div>
        </div>

        {formStep === "type" ? (
          <Card>
            <CardHeader>
              <CardTitle>Sélectionnez le type de note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(typeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedType(key);
                        setFormStep("form");
                      }}
                      className={`p-8 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 ${config.color}`}
                    >
                      <Icon className="h-12 w-12 mx-auto mb-4" />
                      <p className="font-semibold text-lg">{config.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Add containers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Type badge and back button */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setFormStep("type")}>
                  ← Retour au choix du type
                </Button>
                <Badge className={typeConfig[selectedType as keyof typeof typeConfig]?.color}>
                  {typeConfig[selectedType as keyof typeof typeConfig]?.label}
                </Badge>
              </div>

              {/* Add OT and containers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Ajouter des conteneurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ordre de travail</Label>
                      <Select value={currentOT} onValueChange={handleOTChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un OT" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockOrdresTravail.map((ot) => (
                            <SelectItem key={ot.id} value={ot.id}>
                              {ot.id} - {ot.client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Conteneurs disponibles</Label>
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
                        {availableContainers.length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            {currentOT ? "Tous les conteneurs sont déjà ajoutés" : "Sélectionnez un OT"}
                          </span>
                        ) : (
                          availableContainers.map((container) => (
                            <Badge
                              key={container.numero}
                              variant={currentContainers.includes(container.numero) ? "default" : "outline"}
                              className="cursor-pointer transition-all"
                              onClick={() => toggleContainerSelection(container.numero)}
                            >
                              {container.numero}
                              {currentContainers.includes(container.numero) && (
                                <span className="ml-1">✓</span>
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddContainers} 
                    disabled={!currentOT || currentContainers.length === 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter {currentContainers.length > 0 ? `${currentContainers.length} conteneur(s)` : "les conteneurs sélectionnés"}
                  </Button>
                </CardContent>
              </Card>

              {/* Container list */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Container className="h-5 w-5" />
                      Conteneurs ajoutés ({containerLines.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {containerLines.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Container className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Aucun conteneur ajouté</p>
                      <p className="text-sm">Sélectionnez un OT et des conteneurs ci-dessus</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N° Conteneur</TableHead>
                          <TableHead>OT</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {containerLines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="font-mono font-medium">{line.numero}</TableCell>
                            <TableCell>{line.otId}</TableCell>
                            <TableCell className="text-muted-foreground">{line.description}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveContainer(line.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - Form details */}
            <div className="space-y-6">
              {/* Client info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Input 
                      value={getClient()} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compagnie maritime</Label>
                    <Input 
                      value={getCompagnie()} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>N° Connaissement (BL) *</Label>
                    <Input 
                      placeholder="BL-2024-XXXX" 
                      value={blNumber}
                      onChange={(e) => setBlNumber(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Period and pricing for detention/ouverture */}
              {(selectedType === "ouverture_port" || selectedType === "detention") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Période et tarification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date début *</Label>
                        <Input 
                          type="date" 
                          value={dateDebut}
                          onChange={(e) => setDateDebut(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date fin *</Label>
                        <Input 
                          type="date" 
                          value={dateFin}
                          onChange={(e) => setDateFin(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre de jours</Label>
                      <Input 
                        type="number" 
                        value={nombreJours()} 
                        disabled 
                        className="bg-muted"
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Tarif journalier (FCFA) *</Label>
                      <Input 
                        type="number" 
                        placeholder="50000"
                        value={tarifJournalier}
                        onChange={(e) => setTarifJournalier(e.target.value)}
                      />
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {nombreJours()} jours × {formatCurrency(parseFloat(tarifJournalier) || 0)} FCFA × {containerLines.length} conteneur(s)
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-primary mt-1">
                        {formatCurrency(montantTotal())} FCFA
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Repair specific fields */}
              {selectedType === "reparation" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Informations réparation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type de réparation *</Label>
                      <Select value={reparationType} onValueChange={setReparationType}>
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
                      <Select value={urgenceLevel} onValueChange={setUrgenceLevel}>
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
                    <div className="space-y-2">
                      <Label>Équipe assignée</Label>
                      <Select value={equipe} onValueChange={setEquipe}>
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
                    <Separator />
                    <div className="space-y-2">
                      <Label>Montant réparation (FCFA) *</Label>
                      <Input 
                        type="number" 
                        placeholder="100000"
                        value={montantReparation}
                        onChange={(e) => setMontantReparation(e.target.value)}
                      />
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(montantTotal())} FCFA
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Description ou notes supplémentaires..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate("/notes-debut")}
                >
                  Annuler
                </Button>
                <Button 
                  variant="gradient" 
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={containerLines.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Créer la note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
