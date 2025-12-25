import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Ship, Plus, Search, Edit, Trash2, Container } from "lucide-react";
import { toast } from "sonner";

interface CompagnieMaritime {
  id: number;
  nom: string;
  num_tc: string;
  prix: number;
  jours: number;
}

const mockData: CompagnieMaritime[] = [
  { id: 1, nom: "MSC", num_tc: "40", prix: 1200, jours: 14 },
  { id: 2, nom: "MSC", num_tc: "20", prix: 1200, jours: 14 },
  { id: 3, nom: "MSC", num_tc: "Frigo", prix: 1200, jours: 14 },
  { id: 4, nom: "CMA CGM", num_tc: "20", prix: 7500, jours: 3 },
  { id: 5, nom: "CMA CGM", num_tc: "40", prix: 17200, jours: 3 },
  { id: 6, nom: "MAERSK", num_tc: "20", prix: 11800, jours: 7 },
  { id: 7, nom: "MAERSK", num_tc: "40", prix: 23600, jours: 7 },
  { id: 8, nom: "HAPAG-LLOYD", num_tc: "20", prix: 0, jours: 0 },
  { id: 9, nom: "HAPAG-LLOYD", num_tc: "40", prix: 0, jours: 0 },
];

export default function CompagniesMaritimes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [compagnies] = useState<CompagnieMaritime[]>(mockData);
  const [formData, setFormData] = useState({
    nom: "",
    num_tc: "",
    prix: "",
    jours: "",
  });

  const filteredData = compagnies.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.num_tc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Compagnie maritime ajoutée avec succès");
    setIsDialogOpen(false);
    setFormData({ nom: "", num_tc: "", prix: "", jours: "" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compagnies Maritimes</h1>
          <p className="text-muted-foreground">
            Gérez les tarifs de surestarie par compagnie et type de conteneur
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle compagnie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une compagnie maritime</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la compagnie</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: MSC, CMA CGM, MAERSK..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="num_tc">Type de conteneur</Label>
                <Input
                  id="num_tc"
                  value={formData.num_tc}
                  onChange={(e) => setFormData({ ...formData, num_tc: e.target.value })}
                  placeholder="Ex: 20, 40, Frigo..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix/jour (XAF)</Label>
                  <Input
                    id="prix"
                    type="number"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jours">Jours de franchise</Label>
                  <Input
                    id="jours"
                    type="number"
                    value={formData.jours}
                    onChange={(e) => setFormData({ ...formData, jours: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Liste des compagnies
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compagnie</TableHead>
                <TableHead>Type TC</TableHead>
                <TableHead className="text-right">Prix/jour</TableHead>
                <TableHead className="text-right">Jours franchise</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((compagnie) => (
                <TableRow key={compagnie.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Container className="h-4 w-4 text-primary" />
                      {compagnie.nom}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{compagnie.num_tc}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(compagnie.prix)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{compagnie.jours} jours</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
