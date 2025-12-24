import jsPDF from "jspdf";
import { COMPANY_CONFIG } from "./generateDocumentPDF";

// ===== COLORS =====
const COLORS = {
  primary: [220, 38, 38] as [number, number, number],
  secondary: [75, 75, 75] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  light: [243, 244, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// ===== INTERFACES =====
export interface PaymentSummaryData {
  client: {
    nom: string;
    adresse?: string;
    nif?: string;
  };
  periode: {
    debut: string;
    fin: string;
  };
  paiements: {
    reference: string;
    date: string;
    facture: string;
    methode: string;
    montant: number;
  }[];
  totaux: {
    totalPaiements: number;
    totalFacture: number;
    soldeRestant: number;
  };
}

// ===== FORMATTERS =====
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR");
};

// ===== PAYMENT SUMMARY PDF GENERATOR =====
export class PaymentSummaryPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private yPos: number;
  private contentWidth: number;

  constructor() {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 15;
    this.yPos = this.margin;
    this.contentWidth = this.pageWidth - this.margin * 2;
  }

  private checkNewPage(requiredSpace: number = 30): void {
    if (this.yPos + requiredSpace > this.pageHeight - 40) {
      this.doc.addPage();
      this.yPos = this.margin;
    }
  }

  private drawHeader(data: PaymentSummaryData): void {
    // Logo placeholder
    const logoSize = 18;
    this.doc.setFillColor(...COLORS.primary);
    this.doc.circle(this.margin + logoSize / 2, this.yPos + logoSize / 2, logoSize / 2, "F");
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("L", this.margin + logoSize / 2, this.yPos + logoSize / 2 + 2, { align: "center" });

    // Company name
    const companyX = this.margin + logoSize + 5;
    this.doc.setTextColor(...COLORS.primary);
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(COMPANY_CONFIG.nom, companyX, this.yPos + 8);

    this.doc.setTextColor(...COLORS.muted);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(COMPANY_CONFIG.slogan, companyX, this.yPos + 13);
    this.doc.text(`${COMPANY_CONFIG.siege} | Tél: ${COMPANY_CONFIG.tel}`, companyX, this.yPos + 17);

    // Document type badge
    const badgeLabel = "RÉCAPITULATIF PAIEMENTS";
    const badgeWidth = this.doc.getTextWidth(badgeLabel) * 0.45 + 12;
    const badgeX = this.pageWidth - this.margin - badgeWidth;

    this.doc.setFillColor(...COLORS.success);
    this.doc.roundedRect(badgeX, this.yPos, badgeWidth, 10, 2, 2, "F");
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(badgeLabel, badgeX + badgeWidth / 2, this.yPos + 7, { align: "center" });

    this.yPos += logoSize + 8;

    // Separator line
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(0.8);
    this.doc.line(this.margin, this.yPos, this.pageWidth - this.margin, this.yPos);
    this.yPos += 8;
  }

  private drawSummaryInfo(data: PaymentSummaryData): void {
    const boxHeight = 28;
    const halfWidth = this.contentWidth / 2 - 3;

    // Left box: Client info
    this.doc.setFillColor(...COLORS.light);
    this.doc.roundedRect(this.margin, this.yPos, halfWidth, boxHeight, 2, 2, "F");

    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("CLIENT", this.margin + 4, this.yPos + 5);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.text(data.client.nom, this.margin + 4, this.yPos + 12);
    
    this.doc.setFontSize(8);
    if (data.client.adresse) {
      this.doc.text(data.client.adresse, this.margin + 4, this.yPos + 17);
    }
    if (data.client.nif) {
      this.doc.text(`NIF: ${data.client.nif}`, this.margin + 4, this.yPos + 22);
    }

    // Right box: Period info
    const rightX = this.margin + halfWidth + 6;
    this.doc.setFillColor(...COLORS.light);
    this.doc.roundedRect(rightX, this.yPos, halfWidth, boxHeight, 2, 2, "F");

    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("PÉRIODE", rightX + 4, this.yPos + 5);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.text(`Du ${formatDate(data.periode.debut)}`, rightX + 4, this.yPos + 12);
    this.doc.text(`Au ${formatDate(data.periode.fin)}`, rightX + 4, this.yPos + 18);
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.muted);
    this.doc.text(`${data.paiements.length} paiement(s) enregistré(s)`, rightX + 4, this.yPos + 24);

    this.yPos += boxHeight + 10;
  }

  private drawPaymentsTable(data: PaymentSummaryData): void {
    // Table header
    this.doc.setFillColor(...COLORS.dark);
    this.doc.rect(this.margin, this.yPos, this.contentWidth, 8, "F");

    const headers = ["Référence", "Date", "Facture liée", "Méthode", "Montant"];
    const colWidths = [40, 30, 40, 35, 35];

    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");

    let xPos = this.margin + 3;
    headers.forEach((header, i) => {
      const align = i === headers.length - 1 ? "right" : "left";
      const textX = align === "right" ? xPos + colWidths[i] - 3 : xPos;
      this.doc.text(header, textX, this.yPos + 5.5, { align: align as any });
      xPos += colWidths[i];
    });

    this.yPos += 10;

    // Table rows
    data.paiements.forEach((paiement, index) => {
      this.checkNewPage(10);

      // Alternate row background
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(this.margin, this.yPos - 1, this.contentWidth, 7, "F");
      }

      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");

      xPos = this.margin + 3;
      const rowData = [
        paiement.reference,
        formatShortDate(paiement.date),
        paiement.facture,
        paiement.methode,
        formatCurrency(paiement.montant),
      ];

      rowData.forEach((cell, i) => {
        const align = i === rowData.length - 1 ? "right" : "left";
        const textX = align === "right" ? xPos + colWidths[i] - 3 : xPos;
        
        if (i === rowData.length - 1) {
          this.doc.setTextColor(...COLORS.success);
          this.doc.setFont("helvetica", "bold");
        }
        
        this.doc.text(cell, textX, this.yPos + 4, { align: align as any });
        
        if (i === rowData.length - 1) {
          this.doc.setTextColor(...COLORS.dark);
          this.doc.setFont("helvetica", "normal");
        }
        
        xPos += colWidths[i];
      });

      this.yPos += 7;
    });

    this.yPos += 5;
  }

  private drawTotals(data: PaymentSummaryData): void {
    const boxWidth = 80;
    const boxX = this.pageWidth - this.margin - boxWidth;

    // Background
    this.doc.setFillColor(...COLORS.light);
    this.doc.roundedRect(boxX, this.yPos, boxWidth, 35, 2, 2, "F");

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...COLORS.dark);

    // Total paiements
    this.doc.text("Total paiements:", boxX + 5, this.yPos + 8);
    this.doc.setTextColor(...COLORS.success);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(formatCurrency(data.totaux.totalPaiements), boxX + boxWidth - 5, this.yPos + 8, { align: "right" });

    // Total facturé
    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Total facturé:", boxX + 5, this.yPos + 16);
    this.doc.text(formatCurrency(data.totaux.totalFacture), boxX + boxWidth - 5, this.yPos + 16, { align: "right" });

    // Separator
    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(boxX + 5, this.yPos + 20, boxX + boxWidth - 5, this.yPos + 20);

    // Solde restant
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Solde restant:", boxX + 5, this.yPos + 28);
    
    const soldeColor = data.totaux.soldeRestant > 0 ? COLORS.primary : COLORS.success;
    this.doc.setTextColor(...soldeColor);
    this.doc.text(formatCurrency(data.totaux.soldeRestant), boxX + boxWidth - 5, this.yPos + 28, { align: "right" });

    this.yPos += 45;
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - 25;

    // Footer separator
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 2, this.pageWidth - this.margin, footerY - 2);

    // Legal mentions
    this.doc.setTextColor(...COLORS.muted);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "normal");

    const lines = [
      `${COMPANY_CONFIG.nom} au capital de ${COMPANY_CONFIG.capital} - Siège social: ${COMPANY_CONFIG.siege}`,
      `NIF: ${COMPANY_CONFIG.nif} | R.STAT: ${COMPANY_CONFIG.rStat} | RC: ${COMPANY_CONFIG.rc}`,
      `Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
    ];

    lines.forEach((line, i) => {
      this.doc.text(line, this.pageWidth / 2, footerY + i * 4, { align: "center" });
    });
  }

  public generate(data: PaymentSummaryData): jsPDF {
    this.drawHeader(data);
    this.drawSummaryInfo(data);
    this.drawPaymentsTable(data);
    this.drawTotals(data);
    this.drawFooter();

    return this.doc;
  }

  public generateAndDownload(data: PaymentSummaryData, filename?: string): void {
    const doc = this.generate(data);
    const defaultFilename = `Recapitulatif_Paiements_${data.client.nom.replace(/\s+/g, "_")}_${formatShortDate(data.periode.debut)}_${formatShortDate(data.periode.fin)}.pdf`;
    doc.save(filename || defaultFilename);
  }
}

// Helper function
export const generatePaymentSummaryPDF = (data: PaymentSummaryData): void => {
  const generator = new PaymentSummaryPDFGenerator();
  generator.generateAndDownload(data);
};