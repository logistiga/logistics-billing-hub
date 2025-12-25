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
import { Truck, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Transitaire {
  id: number;
  compagnie: string;
  nom: string;
  tel: string;
  email: string;
  adresse: string;
  solde: number;
}

const mockData: Transitaire[] = [
  { id: 1, compagnie: "BOLLORE", nom: "BOLLORE", tel: "", email: "", adresse: "", solde: 0 },
  { id: 2, compagnie: "DHL", nom: "DHL", tel: "", email: "", adresse: "", solde: 125000 },
  { id: 3, compagnie: "LSG", nom: "LSG", tel: "011705726", email: "junior.yenda@lsg-gabon.com", adresse: "owendo", solde: -50000 },
  { id: 4, compagnie: "MAERSK", nom: "MAERSK", tel: "", email: "ga.import@maersk.com", adresse: "", solde: 0 },
  { id: 5, compagnie: "TMT", nom: "TMT", tel: "011707363", email: "contact@tmtransit.com", adresse: "", solde: 250000 },
  { id: 6, compagnie: "ETL", nom: "ETL", tel: "+241 06614100", email: "commercial.etl241@gmail.com", adresse: "", solde: 0 },
];

export default function Transitaires() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transitaires] = useState<Transitaire[]>(mockData);
  const [formData, setFormData] = useState({
    compagnie: "",
    nom: "",
    tel: "",
    email: "",
    adresse: "",
  });

  const filteredData = transitaires.filter(
    (t) =>
      t.compagnie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Transitaire ajouté avec succès");
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

  const totalSolde = transitaires.reduce((sum, t) => sum + t.solde, 0);
  const positifCount = transitaires.filter((t) => t.solde > 0).length;
  const negatifCount = transitaires.filter((t) => t.solde < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transitaires</h1>
          <p className="text-muted-foreground">
            Gérez les transitaires et leur suivi de paiement
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau transitaire
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un transitaire</DialogTitle>
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
            <CardTitle className="text-sm font-medium">Solde Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalSolde >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalSolde)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soldes Positifs</CardTitle>
            <Badge variant="default" className="bg-green-500">{positifCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(transitaires.filter((t) => t.solde > 0).reduce((s, t) => s + t.solde, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soldes Négatifs</CardTitle>
            <Badge variant="destructive">{negatifCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(transitaires.filter((t) => t.solde < 0).reduce((s, t) => s + t.solde, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Liste des transitaires
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
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((transitaire) => (
                <TableRow key={transitaire.id}>
                  <TableCell className="font-medium">{transitaire.compagnie}</TableCell>
                  <TableCell>{transitaire.nom}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {transitaire.tel && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {transitaire.tel}
                        </span>
                      )}
                      {transitaire.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {transitaire.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transitaire.adresse && (
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" /> {transitaire.adresse}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={transitaire.solde > 0 ? "default" : transitaire.solde < 0 ? "destructive" : "secondary"}
                    >
                      {formatCurrency(transitaire.solde)}
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
