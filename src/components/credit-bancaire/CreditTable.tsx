import { motion } from "framer-motion";
import { Eye, Edit, Trash2, Building2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Credit, statusConfig, formatCurrency } from "./types";

const statusIcons = {
  active: CheckCircle2,
  overdue: AlertTriangle,
  completed: CheckCircle2,
  suspended: Clock,
};

interface CreditTableProps {
  credits: Credit[];
  onView: (credit: Credit) => void;
  onDelete: (credit: Credit) => void;
}

export function CreditTable({ credits, onView, onDelete }: CreditTableProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Référence</TableHead>
              <TableHead>Banque</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead className="text-right">Capital</TableHead>
              <TableHead className="text-right">Reste</TableHead>
              <TableHead className="text-center">Progression</TableHead>
              <TableHead className="text-right">Mensualité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Aucun crédit enregistré
                </TableCell>
              </TableRow>
            ) : (
              credits.map((credit, index) => {
                const status = statusConfig[credit.status];
                const StatusIcon = statusIcons[credit.status];
                const progression = (credit.echeancesPayees / credit.dureeTotal) * 100;
                
                return (
                  <motion.tr
                    key={credit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-medium font-mono">
                      {credit.reference}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {credit.bank}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {credit.objetCredit}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(credit.capitalInitial)}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-medium">
                      {formatCurrency(credit.capitalRestant)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progression} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">
                          {credit.echeancesPayees}/{credit.dureeTotal}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(credit.mensualite)}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.class}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onView(credit)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voir échéancier</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Modifier</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onDelete(credit)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Supprimer</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
