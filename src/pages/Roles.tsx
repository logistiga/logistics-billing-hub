import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Shield,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Check,
  X,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  color: string;
}

const permissionGroups: PermissionGroup[] = [
  {
    name: "Clients",
    permissions: [
      { id: "clients.view", name: "Voir", description: "Voir la liste des clients" },
      { id: "clients.create", name: "Créer", description: "Créer de nouveaux clients" },
      { id: "clients.edit", name: "Modifier", description: "Modifier les clients" },
      { id: "clients.delete", name: "Supprimer", description: "Supprimer des clients" },
    ],
  },
  {
    name: "Factures",
    permissions: [
      { id: "invoices.view", name: "Voir", description: "Voir les factures" },
      { id: "invoices.create", name: "Créer", description: "Créer des factures" },
      { id: "invoices.edit", name: "Modifier", description: "Modifier les factures" },
      { id: "invoices.delete", name: "Supprimer", description: "Supprimer des factures" },
      { id: "invoices.send", name: "Envoyer", description: "Envoyer par email" },
    ],
  },
  {
    name: "Ordres de travail",
    permissions: [
      { id: "orders.view", name: "Voir", description: "Voir les ordres" },
      { id: "orders.create", name: "Créer", description: "Créer des ordres" },
      { id: "orders.edit", name: "Modifier", description: "Modifier les ordres" },
      { id: "orders.delete", name: "Supprimer", description: "Supprimer des ordres" },
      { id: "orders.convert", name: "Convertir", description: "Convertir en facture" },
    ],
  },
  {
    name: "Comptabilité",
    permissions: [
      { id: "accounting.view", name: "Voir", description: "Voir les données comptables" },
      { id: "accounting.payments", name: "Paiements", description: "Gérer les paiements" },
      { id: "accounting.reports", name: "Rapports", description: "Générer des rapports" },
      { id: "accounting.export", name: "Exporter", description: "Exporter les données" },
    ],
  },
  {
    name: "Paramètres",
    permissions: [
      { id: "settings.company", name: "Entreprise", description: "Modifier les paramètres" },
      { id: "settings.banks", name: "Banques", description: "Gérer les comptes" },
      { id: "settings.taxes", name: "Taxes", description: "Gérer les taxes" },
      { id: "settings.users", name: "Utilisateurs", description: "Gérer les utilisateurs" },
      { id: "settings.roles", name: "Rôles", description: "Gérer les rôles" },
    ],
  },
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    usersCount: 2,
    permissions: permissionGroups.flatMap((g) => g.permissions.map((p) => p.id)),
    color: "bg-primary",
  },
  {
    id: "2",
    name: "Comptable",
    description: "Gestion des factures et de la comptabilité",
    usersCount: 3,
    permissions: [
      "clients.view",
      "invoices.view",
      "invoices.create",
      "invoices.edit",
      "invoices.send",
      "orders.view",
      "accounting.view",
      "accounting.payments",
      "accounting.reports",
    ],
    color: "bg-blue-500",
  },
  {
    id: "3",
    name: "Commercial",
    description: "Gestion des clients et devis",
    usersCount: 5,
    permissions: [
      "clients.view",
      "clients.create",
      "clients.edit",
      "invoices.view",
      "orders.view",
      "orders.create",
    ],
    color: "bg-green-500",
  },
  {
    id: "4",
    name: "Opérateur",
    description: "Consultation uniquement",
    usersCount: 8,
    permissions: ["clients.view", "invoices.view", "orders.view"],
    color: "bg-gray-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Roles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Rôles & Permissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les rôles et leurs permissions
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau rôle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="font-heading">Nouveau rôle</DialogTitle>
                <DialogDescription>
                  Créez un nouveau rôle et définissez ses permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du rôle *</Label>
                    <Input placeholder="Ex: Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <Input type="color" defaultValue="#E31E24" className="h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Description du rôle" />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <ScrollArea className="h-[300px] rounded-lg border p-4">
                    {permissionGroups.map((group) => (
                      <div key={group.name} className="mb-6 last:mb-0">
                        <h4 className="font-semibold text-sm text-foreground mb-3">
                          {group.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {group.permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <span className="text-sm">{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="gradient" onClick={() => setIsDialogOpen(false)}>
                  Créer le rôle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {mockRoles.map((role) => (
            <motion.div key={role.id} variants={itemVariants}>
              <Card className="hover-lift cursor-pointer border-border/50 group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-xl ${role.color} flex items-center justify-center`}
                      >
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {role.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {role.usersCount} utilisateur(s)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {permissionGroups.map((group) => {
                      const hasPermission = group.permissions.some((p) =>
                        role.permissions.includes(p.id)
                      );
                      const hasAll = group.permissions.every((p) =>
                        role.permissions.includes(p.id)
                      );
                      return (
                        <Badge
                          key={group.name}
                          variant="outline"
                          className={`text-xs ${
                            hasAll
                              ? "bg-success/10 text-success border-success/30"
                              : hasPermission
                              ? "bg-warning/10 text-warning border-warning/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {group.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
}
