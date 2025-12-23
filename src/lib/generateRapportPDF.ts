import jsPDF from "jspdf";
import * as XLSX from "xlsx";

// Types
export interface Client {
  id: string;
  nom: string;
  ville: string;
  telephone?: string;
  email?: string;
}

export interface Facture {
  id: string;
  numero: string;
  client: string;
  clientId: string;
  date: string;
  dateEcheance: string;
  montant: number;
  montantPaye: number;
  statut: "payee" | "en_attente" | "en_retard" | "annulee" | "partielle";
  type: "Manutention" | "Transport" | "Stockage" | "Location" | "Transit";
  sousType?: string;
}

export interface OrdreTravail {
  id: string;
  numero: string;
  client: string;
  clientId: string;
  date: string;
  type: "Manutention" | "Transport" | "Stockage" | "Location" | "Transit";
  sousType?: string;
  statut: "en_cours" | "termine" | "annule" | "planifie";
  montant: number;
}

export interface TransactionTresorerie {
  id: string;
  date: string;
  reference: string;
  description: string;
  type: "entree" | "sortie";
  montant: number;
  categorie: string;
  source: "caisse" | "banque";
  banque?: string;
}

export interface Devis {
  id: string;
  numero: string;
  client: string;
  clientId: string;
  date: string;
  validite: string;
  montant: number;
  statut: "accepte" | "en_attente" | "refuse" | "expire";
  type: string;
}

export interface RapportFilters {
  typeRapport: "clients" | "factures" | "ordres" | "tresorerie" | "devis";
  dateDebut: string;
  dateFin: string;
  clientsIds: string[];
  typesOperation: string[];
  sousTypesTransport: string[];
  statutsFacture: string[];
  includeDetails: boolean;
  includeGraphiques: boolean;
  groupBy: "date" | "client" | "type" | "statut";
}

// Company Info
const COMPANY_INFO = {
  nom: "LOGISTIGA SARL",
  slogan: "Transport - Logistique - Transit",
  capital: "18 000 000 FCFA",
  siege: "Owendo S/ETRAG - (GABON)",
  bp: "B.P. 1234 Libreville",
  tel: "(+241) 07 10 47 30 / 07 10 56 76",
  email: "info@logistiga.com",
  site: "www.logistiga.com",
  nif: "7479160",
  rStat: "092441",
  rc: "2018B02163",
  compteBGFI: "40003 04140 4104165087118",
  compteUGB: "40002 00043 9000330B81 84",
};

// Colors
const COLORS = {
  primary: [41, 128, 185] as const,
  secondary: [52, 73, 94] as const,
  success: [39, 174, 96] as const,
  danger: [231, 76, 60] as const,
  warning: [243, 156, 18] as const,
  muted: [149, 165, 166] as const,
  dark: [44, 62, 80] as const,
  light: [236, 240, 241] as const,
};

// Helpers
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateLong = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getStatutLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    payee: "Payée",
    en_attente: "En attente",
    en_retard: "En retard",
    annulee: "Annulée",
    partielle: "Partielle",
    en_cours: "En cours",
    termine: "Terminé",
    planifie: "Planifié",
    accepte: "Accepté",
    refuse: "Refusé",
    expire: "Expiré",
  };
  return labels[statut] || statut;
};

const getStatutColor = (statut: string): readonly [number, number, number] => {
  const colors: Record<string, readonly [number, number, number]> = {
    payee: COLORS.success,
    en_attente: COLORS.warning,
    en_retard: COLORS.danger,
    annulee: COLORS.muted,
    partielle: COLORS.primary,
    en_cours: COLORS.primary,
    termine: COLORS.success,
    planifie: COLORS.warning,
    accepte: COLORS.success,
    refuse: COLORS.danger,
    expire: COLORS.muted,
  };
  return colors[statut] || COLORS.muted;
};

// PDF Generator Class
class RapportPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private yPos: number;
  private contentWidth: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 15;
    this.yPos = this.margin;
    this.contentWidth = this.pageWidth - this.margin * 2;
  }

  private checkNewPage(requiredSpace: number = 30): void {
    if (this.yPos + requiredSpace > this.pageHeight - 35) {
      this.doc.addPage();
      this.yPos = this.margin;
    }
  }

  private drawHeader(titre: string, sousTitre: string): void {
    // Blue header band
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 40, "F");

    // Company name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("LOGISTIGA", this.margin, 18);

    // Slogan
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(COMPANY_INFO.slogan, this.margin, 26);

    // Contact info on the right
    this.doc.setFontSize(8);
    this.doc.text(COMPANY_INFO.tel, this.pageWidth - this.margin, 15, { align: "right" });
    this.doc.text(COMPANY_INFO.email, this.pageWidth - this.margin, 20, { align: "right" });
    this.doc.text(COMPANY_INFO.siege, this.pageWidth - this.margin, 25, { align: "right" });

    // Document title area
    this.yPos = 50;
    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(titre, this.pageWidth / 2, this.yPos, { align: "center" });

    if (sousTitre) {
      this.yPos += 8;
      this.doc.setTextColor(...COLORS.muted);
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(sousTitre, this.pageWidth / 2, this.yPos, { align: "center" });
    }

    // Decorative line
    this.yPos += 8;
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(0.8);
    const lineWidth = 60;
    this.doc.line(
      (this.pageWidth - lineWidth) / 2,
      this.yPos,
      (this.pageWidth + lineWidth) / 2,
      this.yPos
    );

    this.yPos += 10;
  }

  private drawPeriodBox(dateDebut: string, dateFin: string): void {
    const boxHeight = 12;
    this.doc.setFillColor(...COLORS.light);
    this.doc.roundedRect(this.margin, this.yPos, this.contentWidth, boxHeight, 2, 2, "F");

    this.doc.setTextColor(...COLORS.secondary);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Période du rapport:", this.margin + 5, this.yPos + 8);

    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `Du ${formatDateLong(dateDebut)} au ${formatDateLong(dateFin)}`,
      this.margin + 50,
      this.yPos + 8
    );

    // Generated date
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.muted);
    this.doc.text(
      `Généré le ${formatDateLong(new Date().toISOString())}`,
      this.pageWidth - this.margin - 5,
      this.yPos + 8,
      { align: "right" }
    );

    this.yPos += boxHeight + 8;
  }

  private drawStatsCards(stats: { label: string; value: string; color?: readonly [number, number, number] }[]): void {
    const cardWidth = (this.contentWidth - (stats.length - 1) * 4) / stats.length;
    const cardHeight = 22;

    stats.forEach((stat, index) => {
      const x = this.margin + index * (cardWidth + 4);
      const color = stat.color || COLORS.primary;

      // Card background
      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.roundedRect(x, this.yPos, cardWidth, cardHeight, 2, 2, "F");

      // Label
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(stat.label, x + cardWidth / 2, this.yPos + 7, { align: "center" });

      // Value
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(stat.value, x + cardWidth / 2, this.yPos + 16, { align: "center" });
    });

    this.yPos += cardHeight + 10;
  }

  private drawSectionTitle(title: string, icon?: string): void {
    this.checkNewPage(15);

    // Background
    this.doc.setFillColor(...COLORS.secondary);
    this.doc.roundedRect(this.margin, this.yPos, this.contentWidth, 8, 1, 1, "F");

    // Title text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title.toUpperCase(), this.margin + 5, this.yPos + 5.5);

    this.yPos += 12;
  }

  private drawTableHeader(headers: string[], colWidths: number[]): void {
    this.doc.setFillColor(...COLORS.dark);
    this.doc.rect(this.margin, this.yPos, this.contentWidth, 8, "F");

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");

    let xPos = this.margin + 2;
    headers.forEach((header, i) => {
      this.doc.text(header, xPos, this.yPos + 5.5);
      xPos += colWidths[i];
    });

    this.yPos += 8;
  }

  private drawTableRow(
    cells: { text: string; color?: readonly [number, number, number] }[],
    colWidths: number[],
    isAlternate: boolean
  ): void {
    const rowHeight = 7;
    this.checkNewPage(rowHeight + 10);

    // Alternate row background
    if (isAlternate) {
      this.doc.setFillColor(248, 249, 250);
      this.doc.rect(this.margin, this.yPos, this.contentWidth, rowHeight, "F");
    }

    let xPos = this.margin + 2;
    this.doc.setFontSize(7.5);
    this.doc.setFont("helvetica", "normal");

    cells.forEach((cell, i) => {
      if (cell.color) {
        this.doc.setTextColor(cell.color[0], cell.color[1], cell.color[2]);
      } else {
        this.doc.setTextColor(...COLORS.dark);
      }

      const maxChars = Math.floor(colWidths[i] / 2);
      const text = cell.text.length > maxChars ? cell.text.substring(0, maxChars) + "..." : cell.text;
      this.doc.text(text, xPos, this.yPos + 5);
      xPos += colWidths[i];
    });

    this.yPos += rowHeight;
  }

  private drawFooter(): void {
    const totalPages = this.doc.internal.pages.length - 1;

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      // Footer line
      this.doc.setDrawColor(...COLORS.primary);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, this.pageHeight - 28, this.pageWidth - this.margin, this.pageHeight - 28);

      // Company info
      this.doc.setTextColor(...COLORS.muted);
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");

      this.doc.text(
        `${COMPANY_INFO.nom} - Capital: ${COMPANY_INFO.capital} - Siège: ${COMPANY_INFO.siege}`,
        this.pageWidth / 2,
        this.pageHeight - 22,
        { align: "center" }
      );
      this.doc.text(
        `NIF: ${COMPANY_INFO.nif} | R.STAT: ${COMPANY_INFO.rStat} | RC: ${COMPANY_INFO.rc}`,
        this.pageWidth / 2,
        this.pageHeight - 18,
        { align: "center" }
      );
      this.doc.text(
        `BGFI Bank: ${COMPANY_INFO.compteBGFI} | UGB: ${COMPANY_INFO.compteUGB}`,
        this.pageWidth / 2,
        this.pageHeight - 14,
        { align: "center" }
      );
      this.doc.text(
        `Tél: ${COMPANY_INFO.tel} | Email: ${COMPANY_INFO.email} | ${COMPANY_INFO.site}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: "center" }
      );

      // Page number
      this.doc.setFontSize(8);
      this.doc.text(`Page ${i}/${totalPages}`, this.pageWidth - this.margin, this.pageHeight - 5, { align: "right" });
    }
  }

  // Public methods for different report types
  public generateRapportFactures(
    factures: Facture[],
    filters: RapportFilters,
    clients: Client[]
  ): void {
    const titre = "RAPPORT DES FACTURES";
    const sousTitre = this.buildSousTitre(filters, clients);

    this.drawHeader(titre, sousTitre);
    this.drawPeriodBox(filters.dateDebut, filters.dateFin);

    // Calculate stats
    const totalFacture = factures.reduce((sum, f) => sum + f.montant, 0);
    const totalPaye = factures.reduce((sum, f) => sum + f.montantPaye, 0);
    const totalEnAttente = totalFacture - totalPaye;

    this.drawStatsCards([
      { label: "Total Facturé", value: formatCurrency(totalFacture), color: COLORS.primary },
      { label: "Total Payé", value: formatCurrency(totalPaye), color: COLORS.success },
      { label: "En Attente", value: formatCurrency(totalEnAttente), color: COLORS.warning },
      { label: "Nb Factures", value: factures.length.toString(), color: COLORS.secondary },
    ]);

    // Factures table
    this.drawSectionTitle("Détail des Factures");

    const headers = ["N° Facture", "Client", "Type", "Date", "Échéance", "Montant", "Payé", "Statut"];
    const colWidths = [28, 35, 22, 18, 18, 23, 20, 16];

    this.drawTableHeader(headers, colWidths);

    factures.forEach((facture, index) => {
      const statutColor = getStatutColor(facture.statut);
      this.drawTableRow(
        [
          { text: facture.numero },
          { text: facture.client },
          { text: facture.type },
          { text: formatDate(facture.date) },
          { text: formatDate(facture.dateEcheance) },
          { text: formatCurrency(facture.montant) },
          { text: formatCurrency(facture.montantPaye) },
          { text: getStatutLabel(facture.statut), color: statutColor },
        ],
        colWidths,
        index % 2 === 0
      );
    });

    // Summary by status
    this.yPos += 10;
    this.drawSectionTitle("Répartition par Statut");

    const statutGroups = factures.reduce((acc, f) => {
      acc[f.statut] = acc[f.statut] || { count: 0, montant: 0 };
      acc[f.statut].count++;
      acc[f.statut].montant += f.montant;
      return acc;
    }, {} as Record<string, { count: number; montant: number }>);

    const statutHeaders = ["Statut", "Nombre", "Montant Total", "% du Total"];
    const statutColWidths = [40, 30, 50, 40];
    this.drawTableHeader(statutHeaders, statutColWidths);

    Object.entries(statutGroups).forEach(([statut, data], index) => {
      const percentage = ((data.montant / totalFacture) * 100).toFixed(1);
      this.drawTableRow(
        [
          { text: getStatutLabel(statut), color: getStatutColor(statut) },
          { text: data.count.toString() },
          { text: formatCurrency(data.montant) },
          { text: `${percentage}%` },
        ],
        statutColWidths,
        index % 2 === 0
      );
    });

    this.drawFooter();

    const filename = `Rapport_Factures_${formatDate(filters.dateDebut)}_${formatDate(filters.dateFin)}.pdf`;
    this.doc.save(filename.replace(/\//g, "-"));
  }

  public generateRapportClients(
    factures: Facture[],
    ordres: OrdreTravail[],
    filters: RapportFilters,
    clients: Client[]
  ): void {
    const selectedClients = filters.clientsIds.length > 0
      ? clients.filter((c) => filters.clientsIds.includes(c.id))
      : clients;

    const titre = "RAPPORT CLIENTS";
    const sousTitre = this.buildSousTitre(filters, clients);

    this.drawHeader(titre, sousTitre);
    this.drawPeriodBox(filters.dateDebut, filters.dateFin);

    // Stats
    const totalCA = factures.reduce((sum, f) => sum + f.montant, 0);
    const totalPaye = factures.reduce((sum, f) => sum + f.montantPaye, 0);

    this.drawStatsCards([
      { label: "Clients Analysés", value: selectedClients.length.toString(), color: COLORS.primary },
      { label: "Chiffre d'Affaires", value: formatCurrency(totalCA), color: COLORS.success },
      { label: "Encaissé", value: formatCurrency(totalPaye), color: COLORS.secondary },
      { label: "Ordres de Travail", value: ordres.length.toString(), color: COLORS.warning },
    ]);

    // Client details
    selectedClients.forEach((client) => {
      this.checkNewPage(50);
      this.drawSectionTitle(`Client: ${client.nom}`);

      // Client info
      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`Ville: ${client.ville}`, this.margin + 5, this.yPos);
      if (client.telephone) {
        this.doc.text(`Tél: ${client.telephone}`, this.margin + 60, this.yPos);
      }
      this.yPos += 8;

      // Client factures
      const clientFactures = factures.filter((f) => f.clientId === client.id);
      const clientTotal = clientFactures.reduce((sum, f) => sum + f.montant, 0);
      const clientPaye = clientFactures.reduce((sum, f) => sum + f.montantPaye, 0);

      this.doc.setFontSize(8);
      this.doc.text(`Total Facturé: ${formatCurrency(clientTotal)}`, this.margin + 5, this.yPos);
      this.doc.text(`Total Payé: ${formatCurrency(clientPaye)}`, this.margin + 70, this.yPos);
      this.doc.text(`Solde: ${formatCurrency(clientTotal - clientPaye)}`, this.margin + 130, this.yPos);
      this.yPos += 6;

      if (filters.includeDetails && clientFactures.length > 0) {
        const headers = ["N° Facture", "Date", "Type", "Montant", "Payé", "Statut"];
        const colWidths = [35, 25, 30, 30, 30, 30];
        this.drawTableHeader(headers, colWidths);

        clientFactures.forEach((f, index) => {
          this.drawTableRow(
            [
              { text: f.numero },
              { text: formatDate(f.date) },
              { text: f.type },
              { text: formatCurrency(f.montant) },
              { text: formatCurrency(f.montantPaye) },
              { text: getStatutLabel(f.statut), color: getStatutColor(f.statut) },
            ],
            colWidths,
            index % 2 === 0
          );
        });
      }

      this.yPos += 5;
    });

    this.drawFooter();

    const filename = `Rapport_Clients_${formatDate(filters.dateDebut)}_${formatDate(filters.dateFin)}.pdf`;
    this.doc.save(filename.replace(/\//g, "-"));
  }

  public generateRapportOrdres(
    ordres: OrdreTravail[],
    filters: RapportFilters,
    clients: Client[]
  ): void {
    const titre = "RAPPORT DES ORDRES DE TRAVAIL";
    const sousTitre = this.buildSousTitre(filters, clients);

    this.drawHeader(titre, sousTitre);
    this.drawPeriodBox(filters.dateDebut, filters.dateFin);

    // Stats
    const totalMontant = ordres.reduce((sum, o) => sum + o.montant, 0);
    const ordresTermines = ordres.filter((o) => o.statut === "termine").length;

    this.drawStatsCards([
      { label: "Total Ordres", value: ordres.length.toString(), color: COLORS.primary },
      { label: "Montant Total", value: formatCurrency(totalMontant), color: COLORS.success },
      { label: "Terminés", value: ordresTermines.toString(), color: COLORS.secondary },
      { label: "Taux Réalisation", value: `${((ordresTermines / ordres.length) * 100).toFixed(0)}%`, color: COLORS.warning },
    ]);

    // Ordres table
    this.drawSectionTitle("Liste des Ordres de Travail");

    const headers = ["N° Ordre", "Client", "Type", "Sous-type", "Date", "Montant", "Statut"];
    const colWidths = [28, 35, 25, 25, 22, 25, 20];

    this.drawTableHeader(headers, colWidths);

    ordres.forEach((ordre, index) => {
      this.drawTableRow(
        [
          { text: ordre.numero },
          { text: ordre.client },
          { text: ordre.type },
          { text: ordre.sousType || "-" },
          { text: formatDate(ordre.date) },
          { text: formatCurrency(ordre.montant) },
          { text: getStatutLabel(ordre.statut), color: getStatutColor(ordre.statut) },
        ],
        colWidths,
        index % 2 === 0
      );
    });

    // Répartition par type
    this.yPos += 10;
    this.drawSectionTitle("Répartition par Type d'Opération");

    const typeGroups = ordres.reduce((acc, o) => {
      acc[o.type] = acc[o.type] || { count: 0, montant: 0 };
      acc[o.type].count++;
      acc[o.type].montant += o.montant;
      return acc;
    }, {} as Record<string, { count: number; montant: number }>);

    const typeHeaders = ["Type", "Nombre", "Montant Total", "% du Total"];
    const typeColWidths = [45, 30, 50, 35];
    this.drawTableHeader(typeHeaders, typeColWidths);

    Object.entries(typeGroups).forEach(([type, data], index) => {
      const percentage = ((data.montant / totalMontant) * 100).toFixed(1);
      this.drawTableRow(
        [
          { text: type },
          { text: data.count.toString() },
          { text: formatCurrency(data.montant) },
          { text: `${percentage}%` },
        ],
        typeColWidths,
        index % 2 === 0
      );
    });

    this.drawFooter();

    const filename = `Rapport_OrdresTravail_${formatDate(filters.dateDebut)}_${formatDate(filters.dateFin)}.pdf`;
    this.doc.save(filename.replace(/\//g, "-"));
  }

  public generateRapportTresorerie(
    transactions: TransactionTresorerie[],
    filters: RapportFilters
  ): void {
    const titre = "RAPPORT DE TRÉSORERIE";
    const sousTitre = "Mouvements Caisse et Banque";

    this.drawHeader(titre, sousTitre);
    this.drawPeriodBox(filters.dateDebut, filters.dateFin);

    // Stats
    const entrees = transactions.filter((t) => t.type === "entree").reduce((sum, t) => sum + t.montant, 0);
    const sorties = transactions.filter((t) => t.type === "sortie").reduce((sum, t) => sum + t.montant, 0);
    const solde = entrees - sorties;
    const transactionsCaisse = transactions.filter((t) => t.source === "caisse").length;
    const transactionsBanque = transactions.filter((t) => t.source === "banque").length;

    this.drawStatsCards([
      { label: "Total Entrées", value: formatCurrency(entrees), color: COLORS.success },
      { label: "Total Sorties", value: formatCurrency(sorties), color: COLORS.danger },
      { label: "Solde", value: formatCurrency(solde), color: solde >= 0 ? COLORS.success : COLORS.danger },
      { label: "Transactions", value: transactions.length.toString(), color: COLORS.secondary },
    ]);

    // Caisse section
    const transactionsCaisseData = transactions.filter((t) => t.source === "caisse");
    if (transactionsCaisseData.length > 0) {
      this.drawSectionTitle(`Mouvements Caisse (${transactionsCaisseData.length})`);

      const headers = ["Date", "Référence", "Description", "Catégorie", "Montant"];
      const colWidths = [25, 30, 55, 35, 35];
      this.drawTableHeader(headers, colWidths);

      transactionsCaisseData.forEach((t, index) => {
        const montantText = (t.type === "entree" ? "+ " : "- ") + formatCurrency(t.montant);
        this.drawTableRow(
          [
            { text: formatDate(t.date) },
            { text: t.reference },
            { text: t.description },
            { text: t.categorie },
            { text: montantText, color: t.type === "entree" ? COLORS.success : COLORS.danger },
          ],
          colWidths,
          index % 2 === 0
        );
      });
    }

    // Banque section
    const transactionsBanqueData = transactions.filter((t) => t.source === "banque");
    if (transactionsBanqueData.length > 0) {
      this.yPos += 10;
      this.drawSectionTitle(`Mouvements Banque (${transactionsBanqueData.length})`);

      const headers = ["Date", "Référence", "Description", "Banque", "Montant"];
      const colWidths = [25, 28, 52, 30, 35];
      this.drawTableHeader(headers, colWidths);

      transactionsBanqueData.forEach((t, index) => {
        const montantText = (t.type === "entree" ? "+ " : "- ") + formatCurrency(t.montant);
        this.drawTableRow(
          [
            { text: formatDate(t.date) },
            { text: t.reference },
            { text: t.description },
            { text: t.banque || "-" },
            { text: montantText, color: t.type === "entree" ? COLORS.success : COLORS.danger },
          ],
          colWidths,
          index % 2 === 0
        );
      });
    }

    this.drawFooter();

    const filename = `Rapport_Tresorerie_${formatDate(filters.dateDebut)}_${formatDate(filters.dateFin)}.pdf`;
    this.doc.save(filename.replace(/\//g, "-"));
  }

  public generateRapportDevis(
    devis: Devis[],
    filters: RapportFilters,
    clients: Client[]
  ): void {
    const titre = "RAPPORT DES DEVIS";
    const sousTitre = this.buildSousTitre(filters, clients);

    this.drawHeader(titre, sousTitre);
    this.drawPeriodBox(filters.dateDebut, filters.dateFin);

    // Stats
    const totalDevis = devis.reduce((sum, d) => sum + d.montant, 0);
    const devisAcceptes = devis.filter((d) => d.statut === "accepte");
    const totalAccepte = devisAcceptes.reduce((sum, d) => sum + d.montant, 0);
    const tauxConversion = devis.length > 0 ? ((devisAcceptes.length / devis.length) * 100).toFixed(0) : "0";

    this.drawStatsCards([
      { label: "Total Devis", value: formatCurrency(totalDevis), color: COLORS.primary },
      { label: "Devis Acceptés", value: formatCurrency(totalAccepte), color: COLORS.success },
      { label: "Nb Devis", value: devis.length.toString(), color: COLORS.secondary },
      { label: "Taux Conversion", value: `${tauxConversion}%`, color: COLORS.warning },
    ]);

    // Devis table
    this.drawSectionTitle("Liste des Devis");

    const headers = ["N° Devis", "Client", "Type", "Date", "Validité", "Montant", "Statut"];
    const colWidths = [28, 40, 25, 22, 22, 25, 18];

    this.drawTableHeader(headers, colWidths);

    devis.forEach((d, index) => {
      this.drawTableRow(
        [
          { text: d.numero },
          { text: d.client },
          { text: d.type },
          { text: formatDate(d.date) },
          { text: formatDate(d.validite) },
          { text: formatCurrency(d.montant) },
          { text: getStatutLabel(d.statut), color: getStatutColor(d.statut) },
        ],
        colWidths,
        index % 2 === 0
      );
    });

    this.drawFooter();

    const filename = `Rapport_Devis_${formatDate(filters.dateDebut)}_${formatDate(filters.dateFin)}.pdf`;
    this.doc.save(filename.replace(/\//g, "-"));
  }

  private buildSousTitre(filters: RapportFilters, clients: Client[]): string {
    const parts: string[] = [];

    if (filters.clientsIds.length > 0 && filters.clientsIds.length <= 3) {
      const clientNames = clients
        .filter((c) => filters.clientsIds.includes(c.id))
        .map((c) => c.nom);
      parts.push(`Clients: ${clientNames.join(", ")}`);
    } else if (filters.clientsIds.length > 3) {
      parts.push(`${filters.clientsIds.length} clients sélectionnés`);
    }

    if (filters.typesOperation.length > 0) {
      parts.push(`Types: ${filters.typesOperation.join(", ")}`);
    }

    return parts.join(" | ");
  }
}

// Excel Generator
export const generateRapportExcel = (
  data: {
    factures?: Facture[];
    ordres?: OrdreTravail[];
    transactions?: TransactionTresorerie[];
    devis?: Devis[];
  },
  filters: RapportFilters,
  clients: Client[]
): void => {
  const wb = XLSX.utils.book_new();

  const addHeaderRows = (sheetData: unknown[][], titre: string) => {
    sheetData.unshift([COMPANY_INFO.nom]);
    sheetData.unshift([titre]);
    sheetData.unshift([`Période: ${formatDateLong(filters.dateDebut)} - ${formatDateLong(filters.dateFin)}`]);
    sheetData.unshift([`Généré le: ${formatDateLong(new Date().toISOString())}`]);
    sheetData.unshift([]);
    return sheetData;
  };

  if (filters.typeRapport === "factures" && data.factures) {
    const headers = ["N° Facture", "Client", "Type", "Date", "Échéance", "Montant", "Payé", "Reste", "Statut"];
    const rows = data.factures.map((f) => [
      f.numero,
      f.client,
      f.type,
      formatDate(f.date),
      formatDate(f.dateEcheance),
      f.montant,
      f.montantPaye,
      f.montant - f.montantPaye,
      getStatutLabel(f.statut),
    ]);

    const total = data.factures.reduce((sum, f) => sum + f.montant, 0);
    const totalPaye = data.factures.reduce((sum, f) => sum + f.montantPaye, 0);
    rows.push([]);
    rows.push(["", "", "", "", "TOTAUX:", total, totalPaye, total - totalPaye, ""]);

    const sheetData = addHeaderRows([headers, ...rows], "Rapport des Factures");
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "Factures");
  }

  if (filters.typeRapport === "ordres" && data.ordres) {
    const headers = ["N° Ordre", "Client", "Type", "Sous-type", "Date", "Montant", "Statut"];
    const rows = data.ordres.map((o) => [
      o.numero,
      o.client,
      o.type,
      o.sousType || "",
      formatDate(o.date),
      o.montant,
      getStatutLabel(o.statut),
    ]);

    const sheetData = addHeaderRows([headers, ...rows], "Rapport des Ordres de Travail");
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "Ordres");
  }

  if (filters.typeRapport === "tresorerie" && data.transactions) {
    const headers = ["Date", "Référence", "Description", "Catégorie", "Source", "Banque", "Type", "Montant"];
    const rows = data.transactions.map((t) => [
      formatDate(t.date),
      t.reference,
      t.description,
      t.categorie,
      t.source === "caisse" ? "Caisse" : "Banque",
      t.banque || "",
      t.type === "entree" ? "Entrée" : "Sortie",
      t.type === "entree" ? t.montant : -t.montant,
    ]);

    const sheetData = addHeaderRows([headers, ...rows], "Rapport de Trésorerie");
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Trésorerie");
  }

  if (filters.typeRapport === "devis" && data.devis) {
    const headers = ["N° Devis", "Client", "Type", "Date", "Validité", "Montant", "Statut"];
    const rows = data.devis.map((d) => [
      d.numero,
      d.client,
      d.type,
      formatDate(d.date),
      formatDate(d.validite),
      d.montant,
      getStatutLabel(d.statut),
    ]);

    const sheetData = addHeaderRows([headers, ...rows], "Rapport des Devis");
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "Devis");
  }

  const typeLabel = {
    clients: "Clients",
    factures: "Factures",
    ordres: "OrdresTravail",
    tresorerie: "Tresorerie",
    devis: "Devis",
  }[filters.typeRapport];

  const filename = `Rapport_${typeLabel}_${formatDate(filters.dateDebut)}_${formatDate(filters.dateFin)}.xlsx`;
  XLSX.writeFile(wb, filename.replace(/\//g, "-"));
};

// Main export function
export const generateRapport = (
  filters: RapportFilters,
  data: {
    factures?: Facture[];
    ordres?: OrdreTravail[];
    transactions?: TransactionTresorerie[];
    devis?: Devis[];
    clients: Client[];
  },
  format: "pdf" | "excel"
): void => {
  if (format === "excel") {
    generateRapportExcel(data, filters, data.clients);
    return;
  }

  const generator = new RapportPDFGenerator();

  switch (filters.typeRapport) {
    case "factures":
      if (data.factures) {
        generator.generateRapportFactures(data.factures, filters, data.clients);
      }
      break;
    case "clients":
      if (data.factures) {
        generator.generateRapportClients(data.factures, data.ordres || [], filters, data.clients);
      }
      break;
    case "ordres":
      if (data.ordres) {
        generator.generateRapportOrdres(data.ordres, filters, data.clients);
      }
      break;
    case "tresorerie":
      if (data.transactions) {
        generator.generateRapportTresorerie(data.transactions, filters);
      }
      break;
    case "devis":
      if (data.devis) {
        generator.generateRapportDevis(data.devis, filters, data.clients);
      }
      break;
  }
};
