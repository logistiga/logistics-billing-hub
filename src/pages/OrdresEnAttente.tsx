import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  Plus,
  Eye,
  Clock,
  Truck,
  Ship,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Container,
  X,
  ChevronDown,
  ChevronUp,
  Anchor,
  MapPin,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { pendingContainersService, type PendingBookingGroup } from "@/services/api/pending-containers.service";

export default function OrdresEnAttente() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PendingBookingGroup | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<string[]>([]);

  // Récupérer les conteneurs en attente
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["pending-containers", searchTerm],
    queryFn: () => pendingContainersService.getAll({ search: searchTerm || undefined }),
  });

  // Récupérer les stats
  const { data: statsData } = useQuery({
    queryKey: ["pending-containers-stats"],
    queryFn: () => pendingContainersService.getStats(),
  });

  // Mutation pour créer un ordre de travail
  const createOrderMutation = useMutation({
    mutationFn: (bookingNumber: string) => 
      pendingContainersService.createOrdreTravail({ booking_number: bookingNumber }),
    onSuccess: (result) => {
      toast.success("Ordre de travail créé", {
        description: `${result.data.containers_count} conteneur(s) ajouté(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ["pending-containers"] });
      queryClient.invalidateQueries({ queryKey: ["pending-containers-stats"] });
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message || "Impossible de créer l'ordre de travail",
      });
    },
  });

  // Mutation pour créer en lot
  const bulkCreateMutation = useMutation({
    mutationFn: (bookingNumbers: string[]) => 
      pendingContainersService.bulkCreateOrdresTravail(bookingNumbers),
    onSuccess: (result) => {
      const { created_count, failed_count } = result.summary;
      if (created_count > 0) {
        toast.success(`${created_count} ordre(s) créé(s)`, {
          description: failed_count > 0 ? `${failed_count} en erreur` : undefined,
        });
      }
      if (failed_count > 0 && created_count === 0) {
        toast.error("Erreur", {
          description: "Aucun ordre n'a pu être créé",
        });
      }
      setSelectedBookings([]);
      queryClient.invalidateQueries({ queryKey: ["pending-containers"] });
      queryClient.invalidateQueries({ queryKey: ["pending-containers-stats"] });
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message || "Impossible de créer les ordres",
      });
    },
  });

  // Mutation pour rejeter
  const rejectMutation = useMutation({
    mutationFn: (bookingNumber: string) => 
      pendingContainersService.reject(bookingNumber),
    onSuccess: () => {
      toast.success("Conteneurs rejetés");
      queryClient.invalidateQueries({ queryKey: ["pending-containers"] });
      queryClient.invalidateQueries({ queryKey: ["pending-containers-stats"] });
      setViewDialogOpen(false);
    },
  });

  const bookings = data?.data || [];
  const stats = statsData?.data;

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.booking_number.toLowerCase().includes(search) ||
      booking.client_name?.toLowerCase().includes(search) ||
      booking.vessel_name?.toLowerCase().includes(search) ||
      booking.containers.some(c => c.container_number.toLowerCase().includes(search))
    );
  });

  const handleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map((b) => b.booking_number));
    }
  };

  const handleSelectOne = (bookingNumber: string) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingNumber)
        ? prev.filter((b) => b !== bookingNumber)
        : [...prev, bookingNumber]
    );
  };

  const toggleExpanded = (bookingNumber: string) => {
    setExpandedBookings((prev) =>
      prev.includes(bookingNumber)
        ? prev.filter((b) => b !== bookingNumber)
        : [...prev, bookingNumber]
    );
  };

  const isAllSelected = selectedBookings.length === filteredBookings.length && filteredBookings.length > 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleViewDetails = (booking: PendingBookingGroup) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const handleCreateOrder = (bookingNumber: string) => {
    createOrderMutation.mutate(bookingNumber);
  };

  const handleCreateSelected = () => {
    if (selectedBookings.length === 0) return;
    bulkCreateMutation.mutate(selectedBookings);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Conteneurs en attente
            </h1>
            <p className="text-muted-foreground mt-1">
              Conteneurs reçus de l'application externe, groupés par numéro de booking
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Ship className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.total_bookings || bookings.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Container className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.total_containers || data?.total_containers || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Conteneurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.recent_count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Dernières 24h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedBookings.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Sélectionnés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par booking, conteneur, client ou navire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Selection Actions */}
        {selectedBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedBookings.length} booking(s) sélectionné(s)
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedBookings([])}>
                Annuler
              </Button>
              <Button
                size="sm"
                variant="gradient"
                onClick={handleCreateSelected}
                disabled={bulkCreateMutation.isPending}
              >
                {bulkCreateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Créer les ordres de travail
              </Button>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>N° Booking</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Navire</TableHead>
                  <TableHead>Compagnie</TableHead>
                  <TableHead>Conteneurs</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Reçu le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Chargement des données...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Aucun résultat pour cette recherche" : "Aucun conteneur en attente"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking, index) => {
                    const isExpanded = expandedBookings.includes(booking.booking_number);
                    
                    return (
                      <Collapsible key={booking.booking_number} asChild>
                        <>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group hover:bg-muted/30 transition-colors"
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedBookings.includes(booking.booking_number)}
                                onCheckedChange={() => handleSelectOne(booking.booking_number)}
                              />
                            </TableCell>
                            <TableCell>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => toggleExpanded(booking.booking_number)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground font-mono">
                                {booking.booking_number}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {booking.client_name || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Ship className="h-3 w-3 text-muted-foreground" />
                                {booking.vessel_name || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {booking.shipping_line || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-mono">
                                <Container className="h-3 w-3 mr-1" />
                                {booking.container_count}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(booking.eta)}
                            </TableCell>
                            <TableCell>
                              {formatDate(booking.received_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleViewDetails(booking)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Voir détails</TooltipContent>
                                </Tooltip>
                                <Button
                                  size="sm"
                                  variant="gradient"
                                  onClick={() => handleCreateOrder(booking.booking_number)}
                                  disabled={createOrderMutation.isPending}
                                >
                                  {createOrderMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Créer OT
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                          <CollapsibleContent asChild>
                            <tr className="bg-muted/20">
                              <td colSpan={10} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {booking.port_origin && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Origine: {booking.port_origin}
                                      </span>
                                    )}
                                    {booking.port_destination && (
                                      <span className="flex items-center gap-1">
                                        <Anchor className="h-3 w-3" />
                                        Destination: {booking.port_destination}
                                      </span>
                                    )}
                                    {booking.voyage_number && (
                                      <span>Voyage: {booking.voyage_number}</span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {booking.containers.map((container) => (
                                      <div
                                        key={container.id}
                                        className="bg-background rounded-lg p-3 border"
                                      >
                                        <div className="font-mono font-medium text-sm">
                                          {container.container_number}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {container.container_type || container.container_size || "Type N/A"}
                                          {container.weight && ` • ${container.weight} kg`}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog détails */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Booking {selectedBooking?.booking_number}
              </DialogTitle>
              <DialogDescription>
                Détails du booking et liste des conteneurs
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                {/* Infos booking */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedBooking.client_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Navire</p>
                    <p className="font-medium">{selectedBooking.vessel_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Compagnie maritime</p>
                    <p className="font-medium">{selectedBooking.shipping_line || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Voyage</p>
                    <p className="font-medium">{selectedBooking.voyage_number || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Port d'origine</p>
                    <p className="font-medium">{selectedBooking.port_origin || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Port de destination</p>
                    <p className="font-medium">{selectedBooking.port_destination || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ETA</p>
                    <p className="font-medium">{formatDate(selectedBooking.eta)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ETD</p>
                    <p className="font-medium">{formatDate(selectedBooking.etd)}</p>
                  </div>
                </div>

                {/* Liste conteneurs */}
                <div>
                  <h4 className="font-medium mb-2">
                    Conteneurs ({selectedBooking.container_count})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedBooking.containers.map((container) => (
                      <div
                        key={container.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Container className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-mono font-medium">
                              {container.container_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {container.container_type || container.container_size || "Type N/A"}
                              {container.seal_number && ` • Scellé: ${container.seal_number}`}
                            </p>
                          </div>
                        </div>
                        {container.weight && (
                          <Badge variant="outline">{container.weight} kg</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedBooking) {
                    rejectMutation.mutate(selectedBooking.booking_number);
                  }
                }}
                disabled={rejectMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  if (selectedBooking) {
                    handleCreateOrder(selectedBooking.booking_number);
                    setViewDialogOpen(false);
                  }
                }}
                disabled={createOrderMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer l'ordre de travail
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
