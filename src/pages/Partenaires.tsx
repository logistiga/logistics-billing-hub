import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Ship,
  UserCheck,
  Building2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { partenaireStore, type CompagnieMaritime, type Transitaire, type Representant } from "@/lib/partenaireStore";

export default function Partenaires() {
  // Utiliser le store partagé
  const compagnies = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getCompagnies,
    partenaireStore.getCompagnies
  );
  const transitaires = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getTransitaires,
    partenaireStore.getTransitaires
  );
  const representants = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getRepresentants,
    partenaireStore.getRepresentants
  );

  const [activeTab, setActiveTab] = useState("compagnies");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const tabConfig = {
    compagnies: { label: "Compagnies Maritimes", icon: Ship },
    transitaires: { label: "Transitaires", icon: Building2 },
    representants: { label: "Représentants", icon: UserCheck },
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Partenaires
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos compagnies maritimes, transitaires et représentants
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              {Object.entries(tabConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger key={key} value={key} className="gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">
                    {activeTab === "compagnies" && "Nouvelle compagnie maritime"}
                    {activeTab === "transitaires" && "Nouveau transitaire"}
                    {activeTab === "representants" && "Nouveau représentant"}
                  </DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du partenaire
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {activeTab === "compagnies" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom de la compagnie *</Label>
                          <Input placeholder="Ex: MSC" />
                        </div>
                        <div className="space-y-2">
                          <Label>Code SCAC *</Label>
                          <Input placeholder="Ex: MSCU" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pays</Label>
                          <Input placeholder="Ex: Suisse" />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact</Label>
                          <Input placeholder="Nom du contact" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input placeholder="+241 XX XX XX XX" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="contact@example.com" />
                        </div>
                      </div>
                    </>
                  )}
                  {activeTab === "transitaires" && (
                    <>
                      <div className="space-y-2">
                        <Label>Nom du transitaire *</Label>
                        <Input placeholder="Ex: Trans Gabon Logistics" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>NIF</Label>
                          <Input placeholder="Numéro d'identification fiscale" />
                        </div>
                        <div className="space-y-2">
                          <Label>RCCM</Label>
                          <Input placeholder="GA-LBV-XXXX-X-XXXX" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Input placeholder="Adresse complète" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input placeholder="+241 XX XX XX XX" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="contact@example.com" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Prime de transitaire (%)</Label>
                        <Input type="number" step="0.1" placeholder="0" />
                        <p className="text-xs text-muted-foreground">
                          Commission appliquée sur les prestations
                        </p>
                      </div>
                    </>
                  )}
                  {activeTab === "representants" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom *</Label>
                          <Input placeholder="Nom de famille" />
                        </div>
                        <div className="space-y-2">
                          <Label>Prénom *</Label>
                          <Input placeholder="Prénom" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input placeholder="+241 XX XX XX XX" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="email@example.com" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Transitaire associé</Label>
                        <Input placeholder="Nom du transitaire (optionnel)" />
                      </div>
                      <div className="space-y-2">
                        <Label>Prime de représentant (%)</Label>
                        <Input type="number" step="0.1" placeholder="0" />
                        <p className="text-xs text-muted-foreground">
                          Commission appliquée sur les prestations
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button variant="gradient" onClick={() => setIsDialogOpen(false)}>
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Compagnies Maritimes Tab */}
          <TabsContent value="compagnies">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nom</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compagnies.map((compagnie, index) => (
                      <motion.tr
                        key={compagnie.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{compagnie.nom}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{compagnie.code}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{compagnie.pays}</TableCell>
                        <TableCell>{compagnie.contact}</TableCell>
                        <TableCell className="text-muted-foreground">{compagnie.telephone}</TableCell>
                        <TableCell className="text-muted-foreground">{compagnie.email}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transitaires Tab */}
          <TabsContent value="transitaires">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nom</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>RCCM</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Prime</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transitaires.map((transitaire, index) => (
                      <motion.tr
                        key={transitaire.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{transitaire.nom}</TableCell>
                        <TableCell className="text-muted-foreground">{transitaire.nif}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">{transitaire.rccm}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{transitaire.telephone}</TableCell>
                        <TableCell className="text-muted-foreground">{transitaire.email}</TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-primary/20 text-primary">{transitaire.prime}%</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Représentants Tab */}
          <TabsContent value="representants">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Transitaire</TableHead>
                      <TableHead className="text-right">Prime</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {representants.map((rep, index) => (
                      <motion.tr
                        key={rep.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{rep.nom}</TableCell>
                        <TableCell>{rep.prenom}</TableCell>
                        <TableCell className="text-muted-foreground">{rep.telephone}</TableCell>
                        <TableCell className="text-muted-foreground">{rep.email}</TableCell>
                        <TableCell>
                          {rep.transitaire ? (
                            <Badge variant="outline">{rep.transitaire}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-success/20 text-success">{rep.prime}%</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
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
