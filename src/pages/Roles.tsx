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
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Receipt,
  Wallet,
  Settings,
  Landmark,
  TrendingUp,
  UserCog,
  Building2,
  ReceiptText,
  LineChart,
  CreditCard,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface PagePermissions {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
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

// Définition complète des permissions par page
const pagesPermissions: PagePermissions[] = [
  {
    id: "dashboard",
    name: "Tableau de bord",
    icon: LayoutDashboard,
    description: "Page d'accueil avec les statistiques",
    permissions: [
      { id: "dashboard.view", name: "Voir le tableau de bord", description: "Accéder à la page d'accueil" },
      { id: "dashboard.stats", name: "Voir les statistiques", description: "Voir les KPIs et chiffres" },
      { id: "dashboard.charts", name: "Voir les graphiques", description: "Voir les graphiques d'évolution" },
    ],
  },
  {
    id: "clients",
    name: "Clients",
    icon: Users,
    description: "Gestion des clients",
    permissions: [
      { id: "clients.view", name: "Voir les clients", description: "Accéder à la liste des clients" },
      { id: "clients.view_details", name: "Voir le détail client", description: "Accéder au dashboard client" },
      { id: "clients.create", name: "Créer un client", description: "Ajouter de nouveaux clients" },
      { id: "clients.edit", name: "Modifier un client", description: "Modifier les informations client" },
      { id: "clients.delete", name: "Supprimer un client", description: "Supprimer des clients" },
      { id: "clients.export", name: "Exporter les clients", description: "Exporter la liste en Excel/PDF" },
    ],
  },
  {
    id: "ordres",
    name: "Ordres de travail",
    icon: ClipboardList,
    description: "Gestion des ordres de travail / connaissements",
    permissions: [
      { id: "ordres.view", name: "Voir les ordres", description: "Accéder à la liste des ordres" },
      { id: "ordres.view_details", name: "Voir le détail", description: "Voir les détails d'un ordre" },
      { id: "ordres.create", name: "Créer un ordre", description: "Créer un nouvel ordre de travail" },
      { id: "ordres.edit", name: "Modifier un ordre", description: "Modifier les ordres existants" },
      { id: "ordres.delete", name: "Supprimer un ordre", description: "Supprimer des ordres" },
      { id: "ordres.download_pdf", name: "Télécharger PDF", description: "Générer et télécharger le PDF" },
      { id: "ordres.send_email", name: "Envoyer par email", description: "Envoyer l'ordre par email" },
      { id: "ordres.payment", name: "Enregistrer paiement", description: "Enregistrer un paiement" },
      { id: "ordres.advance", name: "Enregistrer avance", description: "Enregistrer une avance" },
      { id: "ordres.group_payment", name: "Paiement groupé", description: "Payer plusieurs ordres ensemble" },
      { id: "ordres.convert_invoice", name: "Convertir en facture", description: "Convertir l'ordre en facture" },
      { id: "ordres.create_avoir", name: "Créer un avoir", description: "Créer un avoir depuis l'ordre" },
      { id: "ordres.cancel", name: "Annuler un ordre", description: "Annuler un ordre de travail" },
      { id: "ordres.view_history", name: "Voir l'historique", description: "Voir l'historique des paiements" },
    ],
  },
  {
    id: "factures",
    name: "Factures",
    icon: FileText,
    description: "Gestion des factures",
    permissions: [
      { id: "factures.view", name: "Voir les factures", description: "Accéder à la liste des factures" },
      { id: "factures.view_details", name: "Voir le détail", description: "Voir les détails d'une facture" },
      { id: "factures.create", name: "Créer une facture", description: "Créer une nouvelle facture" },
      { id: "factures.edit", name: "Modifier une facture", description: "Modifier les factures existantes" },
      { id: "factures.delete", name: "Supprimer une facture", description: "Supprimer des factures" },
      { id: "factures.download_pdf", name: "Télécharger PDF", description: "Générer et télécharger le PDF" },
      { id: "factures.send_email", name: "Envoyer par email", description: "Envoyer la facture par email" },
      { id: "factures.payment", name: "Enregistrer paiement", description: "Enregistrer un paiement" },
      { id: "factures.advance", name: "Enregistrer avance", description: "Enregistrer une avance" },
      { id: "factures.group_payment", name: "Paiement groupé", description: "Payer plusieurs factures" },
      { id: "factures.create_avoir", name: "Créer un avoir", description: "Créer un avoir depuis la facture" },
      { id: "factures.view_history", name: "Voir l'historique", description: "Voir l'historique des paiements" },
    ],
  },
  {
    id: "devis",
    name: "Devis",
    icon: Receipt,
    description: "Gestion des devis",
    permissions: [
      { id: "devis.view", name: "Voir les devis", description: "Accéder à la liste des devis" },
      { id: "devis.create", name: "Créer un devis", description: "Créer un nouveau devis" },
      { id: "devis.edit", name: "Modifier un devis", description: "Modifier les devis existants" },
      { id: "devis.delete", name: "Supprimer un devis", description: "Supprimer des devis" },
      { id: "devis.download_pdf", name: "Télécharger PDF", description: "Générer et télécharger le PDF" },
      { id: "devis.send_email", name: "Envoyer par email", description: "Envoyer le devis par email" },
      { id: "devis.convert_invoice", name: "Convertir en facture", description: "Convertir le devis en facture" },
      { id: "devis.duplicate", name: "Dupliquer", description: "Dupliquer un devis existant" },
    ],
  },
  {
    id: "avoirs",
    name: "Avoirs & Remboursements",
    icon: ReceiptText,
    description: "Gestion des avoirs et remboursements",
    permissions: [
      { id: "avoirs.view", name: "Voir les avoirs", description: "Accéder à la liste des avoirs" },
      { id: "avoirs.create", name: "Créer un avoir", description: "Créer un nouvel avoir" },
      { id: "avoirs.edit", name: "Modifier un avoir", description: "Modifier les avoirs existants" },
      { id: "avoirs.delete", name: "Annuler un avoir", description: "Annuler des avoirs" },
      { id: "avoirs.download_pdf", name: "Télécharger PDF", description: "Générer et télécharger le PDF" },
      { id: "avoirs.process_refund", name: "Traiter remboursement", description: "Traiter un remboursement" },
      { id: "avoirs.apply_compensation", name: "Appliquer compensation", description: "Compenser sur facture" },
    ],
  },
  {
    id: "caisse",
    name: "Caisse",
    icon: Wallet,
    description: "Gestion de la caisse",
    permissions: [
      { id: "caisse.view", name: "Voir la caisse", description: "Accéder à la page caisse" },
      { id: "caisse.create_entry", name: "Créer une entrée", description: "Ajouter une entrée de caisse" },
      { id: "caisse.create_exit", name: "Créer une sortie", description: "Ajouter une sortie de caisse" },
      { id: "caisse.edit", name: "Modifier", description: "Modifier les mouvements" },
      { id: "caisse.delete", name: "Supprimer", description: "Supprimer des mouvements" },
      { id: "caisse.export", name: "Exporter", description: "Exporter les données" },
      { id: "caisse.close_day", name: "Clôturer journée", description: "Clôturer la caisse du jour" },
    ],
  },
  {
    id: "banque",
    name: "Suivi Banque",
    icon: Landmark,
    description: "Suivi des comptes bancaires",
    permissions: [
      { id: "banque.view", name: "Voir les comptes", description: "Accéder au suivi bancaire" },
      { id: "banque.create", name: "Créer mouvement", description: "Ajouter un mouvement" },
      { id: "banque.edit", name: "Modifier", description: "Modifier les mouvements" },
      { id: "banque.delete", name: "Supprimer", description: "Supprimer des mouvements" },
      { id: "banque.reconcile", name: "Rapprocher", description: "Rapprochement bancaire" },
      { id: "banque.export", name: "Exporter", description: "Exporter les données" },
    ],
  },
  {
    id: "tresorerie",
    name: "Trésorerie Prévisionnelle",
    icon: LineChart,
    description: "Prévisions de trésorerie",
    permissions: [
      { id: "tresorerie.view", name: "Voir les prévisions", description: "Accéder aux prévisions" },
      { id: "tresorerie.create", name: "Créer prévision", description: "Ajouter une prévision" },
      { id: "tresorerie.edit", name: "Modifier", description: "Modifier les prévisions" },
      { id: "tresorerie.delete", name: "Supprimer", description: "Supprimer des prévisions" },
      { id: "tresorerie.export", name: "Exporter", description: "Exporter les données" },
    ],
  },
  {
    id: "credit",
    name: "Crédit Bancaire",
    icon: CreditCard,
    description: "Gestion des crédits bancaires",
    permissions: [
      { id: "credit.view", name: "Voir les crédits", description: "Accéder aux crédits" },
      { id: "credit.create", name: "Créer un crédit", description: "Ajouter un crédit" },
      { id: "credit.edit", name: "Modifier", description: "Modifier les crédits" },
      { id: "credit.delete", name: "Supprimer", description: "Supprimer des crédits" },
      { id: "credit.payment", name: "Enregistrer échéance", description: "Payer une échéance" },
    ],
  },
  {
    id: "comptabilite",
    name: "Comptabilité Générale",
    icon: TrendingUp,
    description: "Vue globale de la comptabilité",
    permissions: [
      { id: "comptabilite.view", name: "Voir la comptabilité", description: "Accéder à la vue globale" },
      { id: "comptabilite.export", name: "Exporter", description: "Exporter les données comptables" },
      { id: "comptabilite.journal", name: "Journal", description: "Voir le journal comptable" },
      { id: "comptabilite.balance", name: "Balance", description: "Voir la balance" },
      { id: "comptabilite.grand_livre", name: "Grand livre", description: "Voir le grand livre" },
    ],
  },
  {
    id: "rapports",
    name: "Rapports",
    icon: FileText,
    description: "Génération de rapports",
    permissions: [
      { id: "rapports.view", name: "Voir les rapports", description: "Accéder aux rapports" },
      { id: "rapports.generate", name: "Générer", description: "Générer des rapports" },
      { id: "rapports.export_pdf", name: "Exporter PDF", description: "Exporter en PDF" },
      { id: "rapports.export_excel", name: "Exporter Excel", description: "Exporter en Excel" },
      { id: "rapports.schedule", name: "Planifier", description: "Planifier des rapports automatiques" },
    ],
  },
  {
    id: "entreprise",
    name: "Paramètres Entreprise",
    icon: Building2,
    description: "Configuration de l'entreprise",
    permissions: [
      { id: "entreprise.view", name: "Voir les paramètres", description: "Accéder aux paramètres" },
      { id: "entreprise.edit", name: "Modifier", description: "Modifier les paramètres" },
      { id: "entreprise.logo", name: "Gérer le logo", description: "Modifier le logo" },
      { id: "entreprise.legal", name: "Mentions légales", description: "Modifier les mentions" },
    ],
  },
  {
    id: "banques_config",
    name: "Configuration Banques",
    icon: Landmark,
    description: "Configuration des comptes bancaires",
    permissions: [
      { id: "banques_config.view", name: "Voir les banques", description: "Accéder aux banques" },
      { id: "banques_config.create", name: "Créer", description: "Ajouter une banque" },
      { id: "banques_config.edit", name: "Modifier", description: "Modifier les banques" },
      { id: "banques_config.delete", name: "Supprimer", description: "Supprimer des banques" },
    ],
  },
  {
    id: "taxes",
    name: "Taxes",
    icon: Receipt,
    description: "Configuration des taxes",
    permissions: [
      { id: "taxes.view", name: "Voir les taxes", description: "Accéder aux taxes" },
      { id: "taxes.create", name: "Créer", description: "Ajouter une taxe" },
      { id: "taxes.edit", name: "Modifier", description: "Modifier les taxes" },
      { id: "taxes.delete", name: "Supprimer", description: "Supprimer des taxes" },
    ],
  },
  {
    id: "utilisateurs",
    name: "Utilisateurs",
    icon: UserCog,
    description: "Gestion des utilisateurs",
    permissions: [
      { id: "utilisateurs.view", name: "Voir les utilisateurs", description: "Accéder à la liste" },
      { id: "utilisateurs.create", name: "Créer", description: "Créer un utilisateur" },
      { id: "utilisateurs.edit", name: "Modifier", description: "Modifier les utilisateurs" },
      { id: "utilisateurs.delete", name: "Supprimer", description: "Supprimer des utilisateurs" },
      { id: "utilisateurs.reset_password", name: "Réinitialiser MDP", description: "Réinitialiser un mot de passe" },
      { id: "utilisateurs.assign_role", name: "Attribuer rôle", description: "Attribuer un rôle" },
    ],
  },
  {
    id: "roles",
    name: "Rôles & Permissions",
    icon: Shield,
    description: "Gestion des rôles",
    permissions: [
      { id: "roles.view", name: "Voir les rôles", description: "Accéder aux rôles" },
      { id: "roles.create", name: "Créer", description: "Créer un rôle" },
      { id: "roles.edit", name: "Modifier", description: "Modifier les rôles" },
      { id: "roles.delete", name: "Supprimer", description: "Supprimer des rôles" },
    ],
  },
];

// Tous les IDs de permissions
const allPermissionIds = pagesPermissions.flatMap((p) => p.permissions.map((perm) => perm.id));

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    usersCount: 2,
    permissions: allPermissionIds,
    color: "#E31E24",
  },
  {
    id: "2",
    name: "Comptable",
    description: "Gestion des factures et de la comptabilité",
    usersCount: 3,
    permissions: [
      "dashboard.view", "dashboard.stats", "dashboard.charts",
      "clients.view", "clients.view_details",
      "factures.view", "factures.view_details", "factures.create", "factures.edit", "factures.download_pdf", "factures.send_email", "factures.payment", "factures.view_history",
      "devis.view", "devis.download_pdf",
      "avoirs.view", "avoirs.create", "avoirs.download_pdf", "avoirs.process_refund",
      "caisse.view", "caisse.create_entry", "caisse.create_exit", "caisse.export",
      "banque.view", "banque.create", "banque.reconcile", "banque.export",
      "comptabilite.view", "comptabilite.export", "comptabilite.journal", "comptabilite.balance", "comptabilite.grand_livre",
      "rapports.view", "rapports.generate", "rapports.export_pdf", "rapports.export_excel",
    ],
    color: "#3B82F6",
  },
  {
    id: "3",
    name: "Commercial",
    description: "Gestion des clients et devis",
    usersCount: 5,
    permissions: [
      "dashboard.view", "dashboard.stats",
      "clients.view", "clients.view_details", "clients.create", "clients.edit",
      "ordres.view", "ordres.view_details", "ordres.create", "ordres.download_pdf", "ordres.send_email",
      "devis.view", "devis.create", "devis.edit", "devis.download_pdf", "devis.send_email", "devis.duplicate",
      "factures.view", "factures.view_details",
    ],
    color: "#22C55E",
  },
  {
    id: "4",
    name: "Opérateur",
    description: "Consultation uniquement",
    usersCount: 8,
    permissions: [
      "dashboard.view",
      "clients.view",
      "ordres.view", "ordres.view_details",
      "factures.view", "factures.view_details",
      "devis.view",
    ],
    color: "#6B7280",
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
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedPages, setExpandedPages] = useState<string[]>([]);
  
  // Form state
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleColor, setRoleColor] = useState("#E31E24");

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setRoleColor("#E31E24");
    setSelectedPermissions([]);
    setExpandedPages([]);
    setEditingRole(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setRoleColor(role.color);
    setSelectedPermissions([...role.permissions]);
    setExpandedPages([]);
    setIsDialogOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const togglePageExpand = (pageId: string) => {
    setExpandedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((p) => p !== pageId)
        : [...prev, pageId]
    );
  };

  const toggleAllPagePermissions = (page: PagePermissions, enabled: boolean) => {
    const pagePermIds = page.permissions.map((p) => p.id);
    if (enabled) {
      setSelectedPermissions((prev) => [...new Set([...prev, ...pagePermIds])]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => !pagePermIds.includes(p)));
    }
  };

  const selectAllPermissions = () => {
    setSelectedPermissions([...allPermissionIds]);
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const getPagePermissionStatus = (page: PagePermissions) => {
    const pagePermIds = page.permissions.map((p) => p.id);
    const selectedCount = pagePermIds.filter((id) => selectedPermissions.includes(id)).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === pagePermIds.length) return "all";
    return "partial";
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom de rôle",
        variant: "destructive",
      });
      return;
    }

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id
            ? { ...r, name: roleName, description: roleDescription, color: roleColor, permissions: selectedPermissions }
            : r
        )
      );
      toast({
        title: "Rôle modifié",
        description: `Le rôle "${roleName}" a été mis à jour`,
      });
    } else {
      const newRole: Role = {
        id: String(Date.now()),
        name: roleName,
        description: roleDescription,
        color: roleColor,
        permissions: selectedPermissions,
        usersCount: 0,
      };
      setRoles((prev) => [...prev, newRole]);
      toast({
        title: "Rôle créé",
        description: `Le rôle "${roleName}" a été créé avec ${selectedPermissions.length} permissions`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (role: Role) => {
    if (role.usersCount > 0) {
      toast({
        title: "Impossible de supprimer",
        description: `Ce rôle est assigné à ${role.usersCount} utilisateur(s)`,
        variant: "destructive",
      });
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== role.id));
    toast({
      title: "Rôle supprimé",
      description: `Le rôle "${role.name}" a été supprimé`,
    });
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
              Gérez les rôles et leurs permissions détaillées par page
            </p>
          </div>
          <Button variant="gradient" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rôle
          </Button>
        </div>

        {/* Roles Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {roles.map((role) => (
            <motion.div key={role.id} variants={itemVariants}>
              <Card className="hover-lift cursor-pointer border-border/50 group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: role.color }}
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
                        <DropdownMenuItem onClick={() => openEditDialog(role)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(role)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {role.usersCount} utilisateur(s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {role.permissions.length} permissions
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {pagesPermissions.slice(0, 6).map((page) => {
                      const pagePermIds = page.permissions.map((p) => p.id);
                      const hasPermission = pagePermIds.some((id) => role.permissions.includes(id));
                      const hasAll = pagePermIds.every((id) => role.permissions.includes(id));
                      return (
                        <Badge
                          key={page.id}
                          variant="outline"
                          className={`text-xs ${
                            hasAll
                              ? "bg-success/10 text-success border-success/30"
                              : hasPermission
                              ? "bg-warning/10 text-warning border-warning/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {page.name}
                        </Badge>
                      );
                    })}
                    {pagesPermissions.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{pagesPermissions.length - 6}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingRole ? "Modifier le rôle" : "Nouveau rôle"}
              </DialogTitle>
              <DialogDescription>
                {editingRole 
                  ? "Modifiez les informations et permissions du rôle"
                  : "Créez un nouveau rôle et définissez ses permissions par page"
                }
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="infos" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="infos">Informations</TabsTrigger>
                <TabsTrigger value="permissions">
                  Permissions ({selectedPermissions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="infos" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du rôle *</Label>
                    <Input 
                      placeholder="Ex: Manager" 
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={roleColor} 
                        onChange={(e) => setRoleColor(e.target.value)}
                        className="h-10 w-16 p-1 cursor-pointer" 
                      />
                      <Input 
                        value={roleColor} 
                        onChange={(e) => setRoleColor(e.target.value)}
                        className="flex-1"
                        placeholder="#E31E24"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Description du rôle" 
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="flex-1 flex flex-col overflow-hidden py-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez les permissions pour chaque page
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllPermissions}>
                      Tout sélectionner
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllPermissions}>
                      Tout désélectionner
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 rounded-lg border">
                  <div className="p-4 space-y-2">
                    {pagesPermissions.map((page) => {
                      const PageIcon = page.icon;
                      const status = getPagePermissionStatus(page);
                      const isExpanded = expandedPages.includes(page.id);
                      const selectedCount = page.permissions.filter((p) => selectedPermissions.includes(p.id)).length;
                      
                      return (
                        <Collapsible
                          key={page.id}
                          open={isExpanded}
                          onOpenChange={() => togglePageExpand(page.id)}
                        >
                          <div className={`rounded-lg border transition-colors ${
                            status === "all" 
                              ? "bg-success/5 border-success/30" 
                              : status === "partial"
                              ? "bg-warning/5 border-warning/30"
                              : "bg-muted/30 border-border"
                          }`}>
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 rounded-t-lg">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <PageIcon className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium text-sm">{page.name}</p>
                                    <p className="text-xs text-muted-foreground">{page.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className={`text-xs ${
                                    status === "all" 
                                      ? "bg-success/10 text-success" 
                                      : status === "partial"
                                      ? "bg-warning/10 text-warning"
                                      : ""
                                  }`}>
                                    {selectedCount}/{page.permissions.length}
                                  </Badge>
                                  <Switch
                                    checked={status === "all"}
                                    onCheckedChange={(checked) => toggleAllPagePermissions(page, checked)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 pb-3 pt-1 border-t border-border/50">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                  {page.permissions.map((permission) => (
                                    <label
                                      key={permission.id}
                                      className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                        selectedPermissions.includes(permission.id)
                                          ? "bg-primary/10 border border-primary/30"
                                          : "hover:bg-muted/50 border border-transparent"
                                      }`}
                                    >
                                      <Checkbox
                                        checked={selectedPermissions.includes(permission.id)}
                                        onCheckedChange={() => togglePermission(permission.id)}
                                        className="mt-0.5"
                                      />
                                      <div>
                                        <p className="text-sm font-medium">{permission.name}</p>
                                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="gradient" onClick={handleSave}>
                {editingRole ? "Enregistrer" : "Créer le rôle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
