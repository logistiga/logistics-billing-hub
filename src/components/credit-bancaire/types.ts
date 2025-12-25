export interface Credit {
  id: string;
  bank: string;
  reference: string;
  capitalInitial: number;
  capitalRestant: number;
  tauxInteret: number;
  mensualite: number;
  dateDebut: string;
  dateFin: string;
  dureeTotal: number;
  echeancesPayees: number;
  status: "active" | "overdue" | "completed" | "suspended";
  prochainPaiement: string;
  objetCredit: string;
}

export interface Payment {
  id: string;
  creditId: string;
  creditRef: string;
  bank: string;
  date: string;
  montant: number;
  capital: number;
  interet: number;
  status: "paid" | "pending" | "overdue";
  echeance: number;
}

export const statusConfig = {
  active: {
    label: "Actif",
    class: "bg-success/20 text-success",
  },
  overdue: {
    label: "En retard",
    class: "bg-destructive/20 text-destructive",
  },
  completed: {
    label: "Terminé",
    class: "bg-muted text-muted-foreground",
  },
  suspended: {
    label: "Suspendu",
    class: "bg-warning/20 text-warning",
  },
};

export const paymentStatusConfig = {
  paid: {
    label: "Payé",
    class: "bg-success/20 text-success",
  },
  pending: {
    label: "En attente",
    class: "bg-warning/20 text-warning",
  },
  overdue: {
    label: "En retard",
    class: "bg-destructive/20 text-destructive",
  },
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("fr-GA", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(value);
};

export const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};
