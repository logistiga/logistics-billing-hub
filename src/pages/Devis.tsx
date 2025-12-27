import { useState, useEffect } from "react";
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
  Send,
  FileText,
  Loader2,
  ArrowRight,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { DocumentPDFGenerator, type DocumentData } from "@/lib/generateDocumentPDF";
import { devisService, type Devis } from "@/services/api";

interface Quote {
  id: number;
  number: string;
  client: string;
  clientId: number;
  date: string;
  validUntil: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  type: "Manutention" | "Transport" | "Stockage" | "Location";
  description: string;
}

const statusConfig = {
  draft: {
    label: "Brouillon",
    class: "bg-muted text-muted-foreground",
  },
  sent: {
    label: "Envoyé",
    class: "bg-primary/20 text-primary border-primary/30",
  },
  accepted: {
    label: "Accepté",
    class: "bg-success text-success-foreground",
  },
  rejected: {
    label: "Refusé",
    class: "bg-destructive text-destructive-foreground",
  },
  expired: {
    label: "Expiré",
    class: "bg-warning/20 text-warning border-warning/30",
  },
  converted: {
    label: "Converti en OT",
    class: "bg-accent text-accent-foreground",
  },
};

export default function DevisPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    count: 0,
  });

  // Conversion dialog state
  const [convertingQuote, setConvertingQuote] = useState<Quote | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Load devis from API
  useEffect(() => {
    const loadDevis = async () => {
      try {
        setIsLoading(true);
        const response = await devisService.getAll();
        const devisList = response.data || [];
        
        const mappedQuotes: Quote[] = devisList.map((d: Devis) => ({
          id: d.id,
          number: d.number,
          client: d.client?.name || `Client #${d.client_id}`,
          clientId: d.client_id,
          date: new Date(d.date).toLocaleDateString("fr-FR"),
          validUntil: new Date(d.validity_date).toLocaleDateString("fr-FR"),
          amount: d.amount || 0,
          status: d.status as Quote["status"],
          type: d.type,
          description: d.description || "",
        }));

        setQuotes(mappedQuotes);

        // Calculate stats
        const totalAmount = mappedQuotes.reduce((sum, q) => sum + q.amount, 0);
        const acceptedAmount = mappedQuotes
          .filter(q => q.status === "accepted" || q.status === "converted")
          .reduce((sum, q) => sum + q.amount, 0);
        const pendingAmount = mappedQuotes
          .filter(q => q.status === "sent" || q.status === "draft")
          .reduce((sum, q) => sum + q.amount, 0);

        setStats({
          total: totalAmount,
          accepted: acceptedAmount,
          pending: pendingAmount,
          count: mappedQuotes.length,
        });
      } catch (error) {
        console.error("Erreur chargement devis:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les devis",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDevis();
  }, []);

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Convert devis to OT directly
  const handleConvertToOT = async (quote: Quote) => {
    setConvertingQuote(quote);
  };

  const confirmConversion = async () => {
    if (!convertingQuote) return;

    setIsConverting(true);
    try {
      // Try API conversion first
      try {
        const result = await devisService.convertToOrdre(convertingQuote.id);
        toast({
          title: "Conversion réussie",
          description: `Ordre de travail ${result.ordre_number} créé`,
        });
        
        // Update local state
        setQuotes(prev => prev.map(q => 
          q.id === convertingQuote.id 
            ? { ...q, status: "converted" as const }
            : q
        ));
        
        setConvertingQuote(null);
        navigate(`/ordres-travail/${result.ordre_id}/editer`);
        return;
      } catch {
        // Fallback: navigate to new OT with devis data
        navigate(`/ordres-travail/nouveau?fromDevis=${convertingQuote.id}`);
      }
    } catch (error) {
      console.error("Erreur conversion:", error);
      toast({
        title: "Erreur",
        description: "Impossible de convertir le devis",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
      setConvertingQuote(null);
    }
  };

  // Quick convert - go directly to OT form with devis data
  const handleQuickConvert = (quote: Quote) => {
    navigate(`/ordres-travail/nouveau?fromDevis=${quote.id}`);
  };

  // PDF generation handler
  const handleDownloadPDF = (quote: Quote) => {
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };

    const documentData: DocumentData = {
      type: "devis",
      numero: quote.number,
      date: parseDate(quote.date),
      dateValidite: parseDate(quote.validUntil),
      client: {
        nom: quote.client,
      },
      typePrestation: quote.type,
      lignes: [
        {
          description: `Prestation ${quote.type}`,
          quantite: 1,
          prixUnitaire: quote.amount,
        },
      ],
      tauxTVA: 18,
      conditionsPaiement: "Paiement à 30 jours après acceptation",
      notes: "Ce devis est valable 30 jours à compter de sa date d'émission.",
    };

    const generator = new DocumentPDFGenerator();
    generator.generateAndDownload(documentData);
    toast({
      title: "PDF généré",
      description: `Le devis ${quote.number} a été téléchargé`,
    });
  };

  const statsDisplay = [
    { label: "Total devis", value: formatCurrency(stats.total), unit: "FCFA" },
    { label: "Acceptés", value: formatCurrency(stats.accepted), unit: "FCFA" },
    { label: "En attente", value: formatCurrency(stats.pending), unit: "FCFA" },
    { label: "Devis", value: String(stats.count), unit: "ce mois" },
  ];

  return (
    <PageTransition>
      {/* Conversion confirmation dialog */}
      <AlertDialog open={!!convertingQuote} onOpenChange={() => setConvertingQuote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Convertir en ordre de travail
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous convertir le devis <strong>{convertingQuote?.number}</strong> en ordre de travail ?
              <br /><br />
              <span className="text-muted-foreground">
                Client: {convertingQuote?.client}<br />
                Montant: {convertingQuote && formatCurrency(convertingQuote.amount)} FCFA
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConverting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConversion} disabled={isConverting}>
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conversion...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convertir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Devis
            </h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez vos devis clients
            </p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/ordres-travail/nouveau?mode=devis")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsDisplay.map((stat, index) => (
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
              placeholder="Rechercher par numéro ou client..."
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
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="sent">Envoyés</SelectItem>
              <SelectItem value="accepted">Acceptés</SelectItem>
              <SelectItem value="rejected">Refusés</SelectItem>
              <SelectItem value="expired">Expirés</SelectItem>
              <SelectItem value="converted">Convertis en OT</SelectItem>
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
                <TableRow className="hover:bg-transparent">
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground mt-2">Chargement...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun devis trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote, index) => {
                    const status = statusConfig[quote.status];
                    const canConvert = quote.status !== "converted" && quote.status !== "rejected";
                    
                    return (
                      <motion.tr
                        key={quote.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50 cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          {quote.number}
                        </TableCell>
                        <TableCell>{quote.client}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {quote.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {quote.date}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {quote.validUntil}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(quote.amount)} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge className={status.class}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick convert button - highlighted */}
                            {canConvert && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 font-medium"
                                title="Transférer rapidement vers OT"
                                onClick={() => handleQuickConvert(quote)}
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                → OT
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Voir">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Modifier">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Télécharger PDF" onClick={() => handleDownloadPDF(quote)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Envoyer par email">
                              <Mail className="h-4 w-4" />
                            </Button>
                            {(quote.status === "draft" || quote.status === "sent") && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Marquer comme envoyé">
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Full conversion with confirmation */}
                            {quote.status === "accepted" && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-accent-foreground hover:text-accent-foreground/80" 
                                title="Convertir en ordre de travail"
                                onClick={() => handleConvertToOT(quote)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            {quote.status !== "converted" && quote.status !== "accepted" && (
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
    </PageTransition>
  );
}
