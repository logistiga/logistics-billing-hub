import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Client {
  id: string;
  name: string;
  nif: string;
  rccm: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  contacts: { name: string; email: string; phone: string }[];
  totalInvoices: number;
  balance: number;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "COMILOG SA",
    nif: "123456789GA",
    rccm: "LBV/2020/B/12345",
    address: "Boulevard Triomphal, Immeuble Concorde",
    city: "Libreville",
    phone: "+241 01 76 00 00",
    email: "contact@comilog.ga",
    contacts: [
      { name: "Jean Mbou", email: "j.mbou@comilog.ga", phone: "+241 077 00 00 00" },
    ],
    totalInvoices: 24,
    balance: 8500000,
  },
  {
    id: "2",
    name: "OLAM Gabon",
    nif: "987654321GA",
    rccm: "LBV/2018/B/67890",
    address: "Zone Portuaire d'Owendo",
    city: "Owendo",
    phone: "+241 01 70 50 00",
    email: "info@olamgabon.com",
    contacts: [
      { name: "Marie Nzeng", email: "m.nzeng@olamgabon.com", phone: "+241 066 50 00 00" },
    ],
    totalInvoices: 18,
    balance: 4200000,
  },
  {
    id: "3",
    name: "Total Energies Gabon",
    nif: "456789123GA",
    rccm: "POG/2015/B/11111",
    address: "Cap Lopez, Port-Gentil",
    city: "Port-Gentil",
    phone: "+241 01 55 10 00",
    email: "gabon@totalenergies.com",
    contacts: [
      { name: "Pierre Ondo", email: "p.ondo@totalenergies.com", phone: "+241 074 10 00 00" },
    ],
    totalInvoices: 42,
    balance: 15800000,
  },
  {
    id: "4",
    name: "Assala Energy",
    nif: "741852963GA",
    rccm: "POG/2019/B/22222",
    address: "Quartier du Port",
    city: "Port-Gentil",
    phone: "+241 01 55 20 00",
    email: "contact@assalaenergy.com",
    contacts: [
      { name: "Sophie Ella", email: "s.ella@assalaenergy.com", phone: "+241 062 20 00 00" },
    ],
    totalInvoices: 15,
    balance: 6300000,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "", email: "", phone: "" }
  ]);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    nif: "",
    rccm: "",
    address: "",
    city: "",
    phone: "",
    email: "",
  });
  const [editContacts, setEditContacts] = useState<Contact[]>([]);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const addContact = () => {
    setContacts([...contacts, { id: Date.now().toString(), name: "", email: "", phone: "" }]);
  };

  const removeContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const resetForm = () => {
    setContacts([{ id: "1", name: "", email: "", phone: "" }]);
    setIsDialogOpen(false);
  };

  // Edit handlers
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name,
      nif: client.nif,
      rccm: client.rccm,
      address: client.address,
      city: client.city,
      phone: client.phone,
      email: client.email,
    });
    setEditContacts(client.contacts.map((c, i) => ({ ...c, id: String(i) })));
    setIsEditDialogOpen(true);
  };

  const addEditContact = () => {
    setEditContacts([...editContacts, { id: Date.now().toString(), name: "", email: "", phone: "" }]);
  };

  const removeEditContact = (id: string) => {
    if (editContacts.length > 1) {
      setEditContacts(editContacts.filter(c => c.id !== id));
    }
  };

  const updateEditContact = (id: string, field: keyof Contact, value: string) => {
    setEditContacts(editContacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveEdit = () => {
    if (!editingClient) return;
    
    setClients(clients.map(c => 
      c.id === editingClient.id 
        ? { 
            ...c, 
            ...editForm,
            contacts: editContacts.map(({ name, email, phone }) => ({ name, email, phone }))
          } 
        : c
    ));
    
    toast({
      title: "Client modifié",
      description: `Les informations de ${editForm.name} ont été mises à jour`,
    });
    
    setIsEditDialogOpen(false);
    setEditingClient(null);
  };

  // Delete handlers
  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!clientToDelete) return;
    
    setClients(clients.filter(c => c.id !== clientToDelete.id));
    
    toast({
      title: "Client supprimé",
      description: `${clientToDelete.name} a été supprimé de la liste`,
    });
    
    setIsDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value) + " FCFA";
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Clients
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos clients et leurs informations
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Nouveau client</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du nouveau client
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Raison sociale *</Label>
                    <Input id="name" placeholder="Nom de l'entreprise" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nif">Numéro NIF *</Label>
                    <Input id="nif" placeholder="123456789GA" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rccm">Numéro RCCM *</Label>
                    <Input id="rccm" placeholder="LBV/2024/B/12345" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" placeholder="Libreville" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea id="address" placeholder="Adresse complète" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="+241 01 XX XX XX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="contact@entreprise.ga" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Contacts</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addContact}>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un contact
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {contacts.map((contact, index) => (
                      <div key={contact.id} className="relative p-4 border rounded-lg bg-muted/30">
                        {contacts.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeContact(contact.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <p className="text-xs text-muted-foreground mb-3">
                          {index === 0 ? "Contact principal" : `Contact ${index + 1}`}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input
                              value={contact.name}
                              onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                              placeholder="Nom du contact"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={contact.email}
                              onChange={(e) => updateContact(contact.id, "email", e.target.value)}
                              placeholder="email@entreprise.ga"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input
                              value={contact.phone}
                              onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                              placeholder="+241 0XX XX XX XX"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button variant="gradient" onClick={resetForm}>
                  Créer le client
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou NIF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Clients Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredClients.map((client) => (
            <motion.div key={client.id} variants={itemVariants}>
              <Card className="hover-lift cursor-pointer border-border/50 group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          NIF: {client.nif}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteClick(client)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{client.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Factures</p>
                      <p className="font-semibold">{client.totalInvoices}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Solde</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(client.balance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations de {editingClient?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Raison sociale *</Label>
                  <Input 
                    id="edit-name" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nif">Numéro NIF *</Label>
                  <Input 
                    id="edit-nif" 
                    value={editForm.nif}
                    onChange={(e) => setEditForm({ ...editForm, nif: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-rccm">Numéro RCCM *</Label>
                  <Input 
                    id="edit-rccm" 
                    value={editForm.rccm}
                    onChange={(e) => setEditForm({ ...editForm, rccm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Ville</Label>
                  <Input 
                    id="edit-city" 
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Textarea 
                  id="edit-address" 
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input 
                    id="edit-phone" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Contacts</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addEditContact}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un contact
                  </Button>
                </div>
                <div className="space-y-4">
                  {editContacts.map((contact, index) => (
                    <div key={contact.id} className="relative p-4 border rounded-lg bg-muted/30">
                      {editContacts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeEditContact(contact.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground mb-3">
                        {index === 0 ? "Contact principal" : `Contact ${index + 1}`}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nom</Label>
                          <Input
                            value={contact.name}
                            onChange={(e) => updateEditContact(contact.id, "name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateEditContact(contact.id, "email", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input
                            value={contact.phone}
                            onChange={(e) => updateEditContact(contact.id, "phone", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="gradient" onClick={handleSaveEdit}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le client <strong>{clientToDelete?.name}</strong> ?
                <br /><br />
                Cette action est irréversible. Toutes les données associées à ce client seront perdues.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
