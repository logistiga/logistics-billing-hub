import { useState, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  ReceiptText,
  Search,
  User,
  Filter,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { avoirStore, AvoirCompensation } from "@/lib/avoirStore";

interface AvoirCompensationHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  avoirId?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function AvoirCompensationHistory({
  open,
  onOpenChange,
  clientId,
  avoirId,
}: AvoirCompensationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Utiliser le store pour récupérer les compensations en temps réel
  const compensations = useSyncExternalStore(
    avoirStore.subscribe,
    avoirStore.getCompensationsHistory
  );

  // Filtrer les compensations
  let filteredCompensations = compensations;
  
  if (clientId) {
    filteredCompensations = filteredCompensations.filter(c => c.clientId === clientId);
  }
  
  if (avoirId) {
    filteredCompensations = filteredCompensations.filter(c => c.avoirId === avoirId);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredCompensations = filteredCompensations.filter(
      c =>
        c.avoirNumber.toLowerCase().includes(term) ||
        c.documentNumber.toLowerCase().includes(term) ||
        c.clientName.toLowerCase().includes(term)
    );
  }
  
  if (filterClient !== "all") {
    filteredCompensations = filteredCompensations.filter(c => c.clientId === filterClient);
  }

  // Obtenir les clients uniques pour le filtre
  const uniqueClients = Array.from(
    new Map(compensations.map(c => [c.clientId, { id: c.clientId, name: c.clientName }])).values()
  );

  // Calculer les statistiques
  const totalCompensations = filteredCompensations.length;
  const totalCompensatedAmount = filteredCompensations.reduce((sum, c) => sum + c.compensatedAmount, 0);
  const uniqueAvoirs = new Set(filteredCompensations.map(c => c.avoirId)).size;

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    // Simulation d'export
    console.log("Export des compensations:", filteredCompensations);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-orange-500" />
            Historique des compensations par avoir
          </DialogTitle>
          <DialogDescription>
            Traçabilité complète de toutes les compensations effectuées avec des avoirs
          </DialogDescription>
        </DialogHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{totalCompensations}</p>
            <p className="text-xs text-muted-foreground">Compensations</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalCompensatedAmount)}</p>
            <p className="text-xs text-muted-foreground">Montant total compensé</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{uniqueAvoirs}</p>
            <p className="text-xs text-muted-foreground">Avoirs utilisés</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 pb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par n° avoir, facture, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {!clientId && (
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {uniqueClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute période</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Tableau des compensations */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Avoir</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Montant compensé</TableHead>
                <TableHead className="text-right">Solde avoir</TableHead>
                <TableHead>Opérateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredCompensations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune compensation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompensations.map((comp, index) => (
                    <Collapsible
                      key={comp.id}
                      open={expandedRows.includes(comp.id)}
                      onOpenChange={() => toggleRowExpand(comp.id)}
                      asChild
                    >
                      <>
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "border-b transition-colors hover:bg-muted/50",
                            expandedRows.includes(comp.id) && "bg-muted/30"
                          )}
                        >
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                {expandedRows.includes(comp.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(comp.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ReceiptText className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">{comp.avoirNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{comp.documentNumber}</span>
                              <Badge variant="outline" className="text-xs">
                                {comp.documentType === "facture" ? "Facture" : "Ordre"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate max-w-[120px]">{comp.clientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-orange-600">
                            -{formatCurrency(comp.compensatedAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {comp.remainingAfter === 0 ? (
                              <Badge className="bg-muted text-muted-foreground">Épuisé</Badge>
                            ) : (
                              <span className="text-sm">{formatCurrency(comp.remainingAfter)}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {comp.operateur}
                          </TableCell>
                        </motion.tr>
                        
                        <CollapsibleContent asChild>
                          <tr className="bg-muted/20">
                            <td colSpan={8} className="p-4">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
                              >
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Avoir original</p>
                                  <p className="font-medium">{formatCurrency(comp.avoirOriginalAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Mode de paiement</p>
                                  <p className="font-medium">{comp.paymentMethod}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">ID Paiement</p>
                                  <p className="font-mono text-xs">{comp.paymentId}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                  <p className="text-muted-foreground italic">
                                    {comp.notes || "Aucune note"}
                                  </p>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredCompensations.length} compensation(s) affichée(s)
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
