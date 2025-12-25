import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment, paymentStatusConfig, formatCurrency } from "./types";

interface PaymentsTableProps {
  payments: Payment[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Crédit</TableHead>
              <TableHead>Banque</TableHead>
              <TableHead className="text-center">Échéance</TableHead>
              <TableHead className="text-right">Capital</TableHead>
              <TableHead className="text-right">Intérêts</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucun paiement enregistré
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment, index) => {
                const status = paymentStatusConfig[payment.status];
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="text-muted-foreground">
                      {payment.date}
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {payment.creditRef}
                    </TableCell>
                    <TableCell>{payment.bank}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">#{payment.echeance}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.capital)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(payment.interet)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(payment.montant)}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.class}>{status.label}</Badge>
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
