import { motion } from "framer-motion";
import {
  Banknote,
  Building2,
  FileText,
  Calendar,
  Hash,
  Clock,
  CheckCircle2,
  ArrowDownLeft,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: "especes" | "virement" | "cheque";
  reference: string;
  banque?: string;
  notes?: string;
  isAdvance: boolean;
  createdBy?: string;
}

interface PaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentNumber: string;
  documentType: "facture" | "ordre";
  client: string;
  totalAmount: number;
  payments: PaymentRecord[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMethodIcon = (method: string) => {
  switch (method) {
    case "especes":
      return Banknote;
    case "virement":
      return Building2;
    case "cheque":
      return FileText;
    default:
      return Banknote;
  }
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case "especes":
      return "Espèces";
    case "virement":
      return "Virement";
    case "cheque":
      return "Chèque";
    default:
      return method;
  }
};

const getMethodColor = (method: string) => {
  switch (method) {
    case "especes":
      return "text-green-500 bg-green-500/10";
    case "virement":
      return "text-blue-500 bg-blue-500/10";
    case "cheque":
      return "text-purple-500 bg-purple-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export function PaymentHistory({
  open,
  onOpenChange,
  documentNumber,
  documentType,
  client,
  totalAmount,
  payments,
}: PaymentHistoryProps) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalAmount - totalPaid;
  const isPaid = remaining <= 0;
  const advancePayments = payments.filter((p) => p.isAdvance);
  const regularPayments = payments.filter((p) => !p.isAdvance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Historique des paiements
          </DialogTitle>
          <DialogDescription>
            Détail des transactions pour {documentNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Document Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{documentNumber}</p>
              <p className="text-sm text-muted-foreground">{client}</p>
            </div>
            <Badge variant={documentType === "facture" ? "default" : "secondary"}>
              {documentType === "facture" ? "Facture" : "Ordre de travail"}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Montant total</p>
              <p className="font-bold text-lg">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total payé</p>
              <p className="font-bold text-lg text-success">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reste à payer</p>
              <p className={cn("font-bold text-lg", isPaid ? "text-success" : "text-primary")}>
                {isPaid ? (
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Soldé
                  </span>
                ) : (
                  formatCurrency(remaining)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <ScrollArea className="max-h-[400px] pr-4">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Banknote className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun paiement enregistré</p>
              <p className="text-sm">Les paiements apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Advance Payments */}
              {advancePayments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <h4 className="font-medium text-sm">Avances ({advancePayments.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {advancePayments.map((payment, index) => (
                      <PaymentCard key={payment.id} payment={payment} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Payments */}
              {regularPayments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="h-4 w-4 text-success" />
                    <h4 className="font-medium text-sm">Paiements ({regularPayments.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {regularPayments.map((payment, index) => (
                      <PaymentCard key={payment.id} payment={payment} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer Summary */}
        {payments.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {payments.length} transaction{payments.length > 1 ? "s" : ""}
              </span>
              <span className="font-medium">
                Total encaissé: <span className="text-success">{formatCurrency(totalPaid)}</span>
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentCard({ payment, index }: { payment: PaymentRecord; index: number }) {
  const MethodIcon = getMethodIcon(payment.method);
  const methodColor = getMethodColor(payment.method);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", methodColor)}>
          <MethodIcon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
              {payment.isAdvance && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Avance
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDateShort(payment.date)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {payment.reference}
            </span>
            <Badge variant="secondary" className="text-xs">
              {getMethodLabel(payment.method)}
            </Badge>
            {payment.banque && (
              <span className="flex items-center gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                {payment.banque}
              </span>
            )}
          </div>
          
          {payment.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              "{payment.notes}"
            </p>
          )}
          
          {payment.createdBy && (
            <p className="text-xs text-muted-foreground mt-1">
              Par: {payment.createdBy}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Données vides - à remplacer par les données de la base de données
export const mockPaymentHistory: Record<string, PaymentRecord[]> = {};
