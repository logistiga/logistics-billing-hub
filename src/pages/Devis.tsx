import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Download,
  Mail,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ArrowRightLeft,
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
import { toast } from "@/hooks/use-toast";
import { DocumentPDFGenerator, type DocumentData } from "@/lib/generateDocumentPDF";

interface Quote {
  id: string;
  number: string;
  client: string;
  date: string;
  validUntil: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
  type: "Manutention" | "Transport" | "Stockage" | "Location";
}

const mockQuotes: Quote[] = [
  {
    id: "1",
    number: "DEV-2024-0089",
    client: "COMILOG SA",
    date: "14/12/2024",
    validUntil: "14/01/2025",
    amount: 4500000,
    status: "sent",
    type: "Transport",
  },
  {
    id: "2",
    number: "DEV-2024-0088",
    client: "OLAM Gabon",
    date: "13/12/2024",
    validUntil: "13/01/2025",
    amount: 2350000,
    status: "accepted",
    type: "Manutention",
  },
  {
    id: "3",
    number: "DEV-2024-0087",
    client: "Total Energies",
    date: "12/12/2024",
    validUntil: "12/01/2025",
    amount: 6800000,
    status: "converted",
    type: "Transport",
  },
  {
    id: "4",
    number: "DEV-2024-0086",
    client: "Assala Energy",
    date: "10/12/2024",
    validUntil: "10/01/2025",
    amount: 1890000,
    status: "rejected",
    type: "Stockage",
  },
  {
    id: "5",
    number: "DEV-2024-0085",
    client: "SEEG",
    date: "05/12/2024",
    validUntil: "05/01/2025",
    amount: 750000,
    status: "expired",
    type: "Location",
  },
  {
    id: "6",
    number: "DEV-2024-0084",
    client: "Perenco Oil",
    date: "14/12/2024",
    validUntil: "14/01/2025",
    amount: 3200000,
    status: "draft",
    type: "Manutention",
  },
];

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
    label: "Converti",
    class: "bg-accent text-accent-foreground",
  },
};

const stats = [
  { label: "Total devis", value: "19 490 000", unit: "FCFA" },
  { label: "Acceptés", value: "9 150 000", unit: "FCFA" },
  { label: "En attente", value: "7 700 000", unit: "FCFA" },
  { label: "Devis", value: "6", unit: "ce mois" },
];

export default function Devis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredQuotes = mockQuotes.filter((quote) => {
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

  return (
    <PageTransition>
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
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
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
              <SelectItem value="converted">Convertis</SelectItem>
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
                {filteredQuotes.map((quote, index) => {
                  const status = statusConfig[quote.status];
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" title="Voir">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700" title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" title="Télécharger PDF" onClick={() => handleDownloadPDF(quote)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-700" title="Envoyer par email">
                            <Mail className="h-4 w-4" />
                          </Button>
                          {(quote.status === "draft" || quote.status === "sent") && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500 hover:text-cyan-700" title="Marquer comme envoyé">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {quote.status === "accepted" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:text-indigo-700" title="Convertir en facture">
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                          )}
                          {/* Ne pas supprimer si accepté ou converti */}
                          {quote.status !== "converted" && quote.status !== "accepted" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
