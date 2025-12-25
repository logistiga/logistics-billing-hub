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
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, DollarSign, Award } from "lucide-react";
import { toast } from "sonner";

interface Representant {
  id: number;
  compagnie: string;
  nom: string;
  tel: string;
  email: string;
  adresse: string;
  solde: number;
}

const mockData: Representant[] = [
  { id: 1, compagnie: "MR. CHAOUKI", nom: "MR. CHAOUKI", tel: "+241 65303809", email: "CHAOUKI@LOGISTIGA.COM", adresse: "libreville gabon", solde: 150000 },
  { id: 2, compagnie: "JUDE MOUTENDY", nom: "JUDE MOUTENDY", tel: "0100000", email: "Jude@logistiga.com", adresse: "oloumi", solde: 75000 },
  { id: 3, compagnie: "LSG", nom: "JUNIOR/PRAXED", tel: "", email: "", adresse: "", solde: 200000 },
  { id: 4, compagnie: "ABOU", nom: "ABOU", tel: "+241 66329007", email: "", adresse: "", solde: 0 },
  { id: 5, compagnie: "SIGALLI", nom: "BOUCHARD", tel: "+241 077570703", email: "admin@logistiga.com", adresse: "LIBREVILLE", solde: 350000 },
];

export default function Representants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [representants] = useState<Representant[]>(mockData);
  const [formData, setFormData] = useState({
    compagnie: "",
    nom: "",
    tel: "",
    email: "",
    adresse: "",
  });

  const filteredData = representants.filter(
    (r) =>
      r.compagnie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Représentant ajouté avec succès");
    setIsDialogOpen(false);
    setFormData({ compagnie: "", nom: "", tel: "", email: "", adresse: "" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrimes = representants.reduce((sum, r) => sum + r.solde, 0);
  const primesEnAttente = representants.filter((r) => r.solde > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Représentants</h1>
          <p className="text-muted-foreground">
            Gérez les représentants et leur suivi de primes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau représentant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un représentant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compagnie">Compagnie</Label>
                  <Input
                    id="compagnie"
                    value={formData.compagnie}
                    onChange={(e) => setFormData({ ...formData, compagnie: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tel">Téléphone</Label>
                  <Input
                    id="tel"
                    value={formData.tel}
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                />
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Représentants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{representants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Primes en Attente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalPrimes)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primes à Payer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primesEnAttente}</div>
            <p className="text-xs text-muted-foreground">représentants</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des représentants
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
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Primes en attente</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium">{rep.compagnie}</TableCell>
                  <TableCell>{rep.nom}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {rep.tel && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {rep.tel}
                        </span>
                      )}
                      {rep.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {rep.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rep.adresse && (
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" /> {rep.adresse}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={rep.solde > 0 ? "default" : "secondary"}>
                      {formatCurrency(rep.solde)}
                    </Badge>
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
