import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Tax {
  id: string;
  name: string;
  code: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
  description: string;
}

const mockTaxes: Tax[] = [
  {
    id: "1",
    name: "TVA Standard",
    code: "TVA18",
    rate: 18,
    isActive: true,
    isDefault: true,
    description: "Taxe sur la Valeur Ajoutée - Taux normal",
  },
  {
    id: "2",
    name: "TVA Réduite",
    code: "TVA10",
    rate: 10,
    isActive: true,
    isDefault: false,
    description: "Taxe sur la Valeur Ajoutée - Taux réduit",
  },
  {
    id: "3",
    name: "Exonéré",
    code: "EXO",
    rate: 0,
    isActive: true,
    isDefault: false,
    description: "Exonération de TVA",
  },
  {
    id: "4",
    name: "Taxe Spéciale",
    code: "TS5",
    rate: 5,
    isActive: false,
    isDefault: false,
    description: "Taxe spéciale sur certains services",
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
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function Taxes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Taxes
            </h1>
            <p className="text-muted-foreground mt-1">
              Configurez les taux de taxes applicables
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle taxe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Nouvelle taxe</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle taxe à appliquer sur vos documents
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de la taxe *</Label>
                    <Input placeholder="TVA Standard" />
                  </div>
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input placeholder="TVA18" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Taux (%) *</Label>
                  <Input type="number" placeholder="18" min="0" max="100" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Description de la taxe" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <Switch id="active" defaultChecked />
                    <Label htmlFor="active">Taxe active</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="defaultTax" />
                    <Label htmlFor="defaultTax">Par défaut</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="gradient" onClick={() => setIsDialogOpen(false)}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Taxes Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTaxes.map((tax, index) => (
                  <motion.tr
                    key={tax.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Percent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tax.name}</p>
                          {tax.isDefault && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Par défaut
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
                        {tax.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-2xl font-bold text-primary">
                        {tax.rate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {tax.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          tax.isActive
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {tax.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                          <DropdownMenuItem>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Définir par défaut
                          </DropdownMenuItem>
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
      </div>
    </PageTransition>
  );
}
