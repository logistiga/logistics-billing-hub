import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Check,
  X,
  RefreshCw,
  FileText,
  Landmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseBankStatement, TransactionReleve } from "@/lib/pdfParser";

interface TransactionApp {
  id: string;
  date: string;
  description: string;
  montant: number;
  type: "entree" | "sortie";
  reference: string;
  client?: string;
  statut: string;
}

interface Rapprochement {
  releveItem: TransactionReleve;
  matchedItem: TransactionApp | null;
  confidence: number; // 0-100
  status: "matched" | "partial" | "unmatched" | "validated" | "rejected";
}

interface Banque {
  id: string;
  nom: string;
  compte: string;
}

interface RapprochementBancaireProps {
  banques: Banque[];
  transactions: TransactionApp[];
  onValidateRapprochement: (rapprochements: Rapprochement[]) => void;
}

// Algorithme de matching
const matchTransactions = (
  releveItems: TransactionReleve[],
  appTransactions: TransactionApp[]
): Rapprochement[] => {
  return releveItems.map((releveItem) => {
    let bestMatch: TransactionApp | null = null;
    let bestConfidence = 0;

    for (const appTxn of appTransactions) {
      let confidence = 0;

      // Type match (crédit = entrée, débit = sortie)
      const typeMatch =
        (releveItem.type === "credit" && appTxn.type === "entree") ||
        (releveItem.type === "debit" && appTxn.type === "sortie");
      if (!typeMatch) continue;

      // Montant exact = +50 points
      if (releveItem.montant === appTxn.montant) {
        confidence += 50;
      } else {
        // Montant proche (+/- 1%) = +20 points
        const diff = Math.abs(releveItem.montant - appTxn.montant);
        if (diff <= releveItem.montant * 0.01) {
          confidence += 20;
        }
      }

      // Date exacte = +25 points
      if (releveItem.date === appTxn.date) {
        confidence += 25;
      } else {
        // Date proche (+/- 2 jours) = +10 points
        const dateDiff = Math.abs(
          new Date(releveItem.date).getTime() - new Date(appTxn.date).getTime()
        );
        if (dateDiff <= 2 * 24 * 60 * 60 * 1000) {
          confidence += 10;
        }
      }

      // Référence match = +25 points
      if (releveItem.reference && appTxn.reference) {
        if (releveItem.reference.toLowerCase() === appTxn.reference.toLowerCase()) {
          confidence += 25;
        } else if (
          releveItem.reference.toLowerCase().includes(appTxn.reference.toLowerCase()) ||
          appTxn.reference.toLowerCase().includes(releveItem.reference.toLowerCase())
        ) {
          confidence += 15;
        }
      }

      // Libellé contient le nom du client = +10 points
      if (appTxn.client) {
        const clientWords = appTxn.client.toLowerCase().split(" ");
        const libelleWords = releveItem.libelle.toLowerCase();
        if (clientWords.some((w) => libelleWords.includes(w))) {
          confidence += 10;
        }
      }

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestMatch = appTxn;
      }
    }

    let status: Rapprochement["status"] = "unmatched";
    if (bestConfidence >= 70) {
      status = "matched";
    } else if (bestConfidence >= 40) {
      status = "partial";
    }

    return {
      releveItem,
      matchedItem: bestConfidence >= 30 ? bestMatch : null,
      confidence: bestConfidence,
      status,
    };
  });
};

export default function RapprochementBancaire({
  banques,
  transactions,
  onValidateRapprochement,
}: RapprochementBancaireProps) {
  const [selectedBanque, setSelectedBanque] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rapprochements, setRapprochements] = useState<Rapprochement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRapprochement, setSelectedRapprochement] = useState<Rapprochement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Veuillez sélectionner un fichier PDF");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        toast.error("Veuillez déposer un fichier PDF");
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleProcess = async () => {
    if (!file || !selectedBanque) {
      toast.error("Veuillez sélectionner une banque et un fichier PDF");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Parser le PDF réel
      const releveItems = await parseBankStatement(file, (p) => setProgress(p));

      // Filtrer les transactions de l'app pour la banque sélectionnée
      const banqueTransactions = transactions.filter(
        (t) => t.statut !== "rapproche" // Exclure les déjà rapprochées
      );

      // Faire le matching
      const results = matchTransactions(releveItems, banqueTransactions);
      setRapprochements(results);

      toast.success(`${releveItems.length} lignes analysées, ${results.filter((r) => r.status === "matched").length} correspondances trouvées`);
    } catch (error) {
      console.error("Erreur lors du traitement:", error);
      toast.error("Erreur lors du traitement du fichier");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = (rapprochement: Rapprochement) => {
    setRapprochements((prev) =>
      prev.map((r) =>
        r.releveItem.id === rapprochement.releveItem.id
          ? { ...r, status: "validated" }
          : r
      )
    );
    toast.success("Rapprochement validé");
  };

  const handleReject = (rapprochement: Rapprochement) => {
    setRapprochements((prev) =>
      prev.map((r) =>
        r.releveItem.id === rapprochement.releveItem.id
          ? { ...r, status: "rejected", matchedItem: null, confidence: 0 }
          : r
      )
    );
    toast.info("Rapprochement rejeté");
  };

  const handleViewDetail = (rapprochement: Rapprochement) => {
    setSelectedRapprochement(rapprochement);
    setDetailDialogOpen(true);
  };

  const handleValidateAll = () => {
    const validatedCount = rapprochements.filter((r) => r.status === "matched").length;
    setRapprochements((prev) =>
      prev.map((r) => (r.status === "matched" ? { ...r, status: "validated" } : r))
    );
    onValidateRapprochement(rapprochements.filter((r) => r.status === "matched"));
    toast.success(`${validatedCount} rapprochements validés`);
  };

  const handleReset = () => {
    setFile(null);
    setRapprochements([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredRapprochements = rapprochements.filter((r) => {
    const matchesSearch =
      r.releveItem.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.matchedItem?.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: rapprochements.length,
    matched: rapprochements.filter((r) => r.status === "matched").length,
    partial: rapprochements.filter((r) => r.status === "partial").length,
    unmatched: rapprochements.filter((r) => r.status === "unmatched").length,
    validated: rapprochements.filter((r) => r.status === "validated").length,
  };

  const getStatusBadge = (status: Rapprochement["status"], confidence: number) => {
    switch (status) {
      case "matched":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Correspondance ({confidence}%)
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Partiel ({confidence}%)
          </Badge>
        );
      case "unmatched":
        return (
          <Badge className="bg-destructive/10 text-destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Non trouvé
          </Badge>
        );
      case "validated":
        return (
          <Badge className="bg-blue-500/10 text-blue-500">
            <Check className="h-3 w-3 mr-1" />
            Validé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Rejeté
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Rapprochement Bancaire Automatique
          </CardTitle>
          <CardDescription>
            Importez votre relevé bancaire PDF pour effectuer le rapprochement automatique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Banque concernée</Label>
              <Select value={selectedBanque} onValueChange={setSelectedBanque}>
                <SelectTrigger>
                  <Landmark className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sélectionner une banque" />
                </SelectTrigger>
                <SelectContent>
                  {banques.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center text-center">
                {file ? (
                  <>
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Glissez votre PDF ou cliquez pour sélectionner
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse du relevé en cours...
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleProcess}
              disabled={!file || !selectedBanque || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Lancer le rapprochement
            </Button>
            {rapprochements.length > 0 && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence>
        {rapprochements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <Card className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total lignes</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-emerald-500">
                <div className="text-2xl font-bold text-emerald-500">{stats.matched}</div>
                <div className="text-sm text-muted-foreground">Correspondances</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-amber-500">
                <div className="text-2xl font-bold text-amber-500">{stats.partial}</div>
                <div className="text-sm text-muted-foreground">Partielles</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-destructive">
                <div className="text-2xl font-bold text-destructive">{stats.unmatched}</div>
                <div className="text-sm text-muted-foreground">Non trouvées</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="text-2xl font-bold text-blue-500">{stats.validated}</div>
                <div className="text-sm text-muted-foreground">Validées</div>
              </Card>
            </div>

            {/* Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Résultats du rapprochement</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-[200px]"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="matched">Correspondances</SelectItem>
                        <SelectItem value="partial">Partielles</SelectItem>
                        <SelectItem value="unmatched">Non trouvées</SelectItem>
                        <SelectItem value="validated">Validées</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleValidateAll}
                      disabled={stats.matched === 0}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Tout valider ({stats.matched})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Libellé relevé</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Correspondance</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRapprochements.map((r) => (
                        <TableRow key={r.releveItem.id}>
                          <TableCell className="font-medium">
                            {formatDate(r.releveItem.date)}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="truncate text-sm">{r.releveItem.libelle}</p>
                            {r.releveItem.reference && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {r.releveItem.reference}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                r.releveItem.type === "credit"
                                  ? "text-emerald-500"
                                  : "text-destructive"
                              }`}
                            >
                              {r.releveItem.type === "credit" ? (
                                <ArrowDownLeft className="inline h-3 w-3 mr-1" />
                              ) : (
                                <ArrowUpRight className="inline h-3 w-3 mr-1" />
                              )}
                              {formatCurrency(r.releveItem.montant)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {r.matchedItem ? (
                              <div className="text-sm">
                                <p className="truncate max-w-[150px]">{r.matchedItem.description}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {r.matchedItem.reference}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(r.status, r.confidence)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetail(r)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(r.status === "matched" || r.status === "partial") && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-emerald-500 hover:text-emerald-600"
                                    onClick={() => handleValidate(r)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/80"
                                    onClick={() => handleReject(r)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détail du rapprochement</DialogTitle>
            <DialogDescription>
              Comparez les informations du relevé et de l'application
            </DialogDescription>
          </DialogHeader>

          {selectedRapprochement && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Relevé bancaire
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <p>{formatDate(selectedRapprochement.releveItem.date)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Libellé</Label>
                    <p className="text-xs">{selectedRapprochement.releveItem.libelle}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Montant</Label>
                    <p
                      className={`font-bold ${
                        selectedRapprochement.releveItem.type === "credit"
                          ? "text-emerald-500"
                          : "text-destructive"
                      }`}
                    >
                      {formatCurrency(selectedRapprochement.releveItem.montant)}
                    </p>
                  </div>
                  {selectedRapprochement.releveItem.reference && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Référence</Label>
                      <p className="font-mono text-xs">{selectedRapprochement.releveItem.reference}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  Application
                </h4>
                {selectedRapprochement.matchedItem ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <p>{formatDate(selectedRapprochement.matchedItem.date)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="text-xs">{selectedRapprochement.matchedItem.description}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Montant</Label>
                      <p
                        className={`font-bold ${
                          selectedRapprochement.matchedItem.type === "entree"
                            ? "text-emerald-500"
                            : "text-destructive"
                        }`}
                      >
                        {formatCurrency(selectedRapprochement.matchedItem.montant)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Référence</Label>
                      <p className="font-mono text-xs">{selectedRapprochement.matchedItem.reference}</p>
                    </div>
                    {selectedRapprochement.matchedItem.client && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Client</Label>
                        <p>{selectedRapprochement.matchedItem.client}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune correspondance trouvée</p>
                )}
              </div>
            </div>
          )}

          {selectedRapprochement && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <span className="text-sm font-medium">Indice de confiance: </span>
                <span className="font-bold">{selectedRapprochement.confidence}%</span>
              </div>
              {getStatusBadge(selectedRapprochement.status, selectedRapprochement.confidence)}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Fermer
            </Button>
            {selectedRapprochement &&
              (selectedRapprochement.status === "matched" ||
                selectedRapprochement.status === "partial") && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedRapprochement);
                      setDetailDialogOpen(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => {
                      handleValidate(selectedRapprochement);
                      setDetailDialogOpen(false);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Valider
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
