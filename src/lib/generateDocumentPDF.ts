import jsPDF from "jspdf";

// ===== CONFIGURATION ENTREPRISE =====
export const COMPANY_CONFIG = {
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

// ===== COLORS =====
const COLORS = {
  primary: [220, 38, 38] as [number, number, number], // Logistiga Red
  secondary: [75, 75, 75] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  light: [243, 244, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// ===== INTERFACES =====
export interface LigneDocument {
  description: string;
  quantite: number;
  prixUnitaire: number;
  tva?: number;
  remise?: number;
}

export interface DocumentData {
  type: "facture" | "devis" | "ordre";
  numero: string;
  date: string;
  dateEcheance?: string;
  dateValidite?: string;
  client: {
    nom: string;
    adresse?: string;
    ville?: string;
    telephone?: string;
    email?: string;
    nif?: string;
  };
  lignes: LigneDocument[];
  tauxTVA?: number;
  remiseGlobale?: number;
  acompte?: number;
  notes?: string;
  conditionsPaiement?: string;
  referenceCommande?: string;
  // Pour ordres de travail
  typePrestation?: string;
  sousType?: string;
  details?: Record<string, string>;
}

// ===== NUMÉROTATION AUTOMATIQUE =====
const getNextNumber = (type: "facture" | "devis" | "ordre"): string => {
  const year = new Date().getFullYear();
  const prefix = type === "facture" ? "FAC" : type === "devis" ? "DEV" : "OT";
  
  // Récupérer le dernier numéro depuis localStorage (en production, utiliser la DB)
  const storageKey = `lastNumber_${type}_${year}`;
  const lastNumber = parseInt(localStorage.getItem(storageKey) || "0", 10);
  const nextNumber = lastNumber + 1;
  localStorage.setItem(storageKey, nextNumber.toString());
  
  return `${prefix}-${year}-${nextNumber.toString().padStart(4, "0")}`;
};

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

// ===== DOCUMENT PDF GENERATOR =====
export class DocumentPDFGenerator {
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

  private drawHeader(data: DocumentData): void {
    // Logo placeholder (circle with L)
    const logoSize = 18;
    this.doc.setFillColor(...COLORS.primary);
    this.doc.circle(this.margin + logoSize / 2, this.yPos + logoSize / 2, logoSize / 2, "F");
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("L", this.margin + logoSize / 2, this.yPos + logoSize / 2 + 2, { align: "center" });

    // Company name and info
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

    // Document type badge (right side)
    const typeLabels = { facture: "FACTURE", devis: "DEVIS", ordre: "ORDRE DE TRAVAIL" };
    const typeLabel = typeLabels[data.type];
    const badgeWidth = this.doc.getTextWidth(typeLabel) * 0.5 + 16;
    const badgeX = this.pageWidth - this.margin - badgeWidth;

    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(badgeX, this.yPos, badgeWidth, 10, 2, 2, "F");
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(typeLabel, badgeX + badgeWidth / 2, this.yPos + 7, { align: "center" });

    this.yPos += logoSize + 8;

    // Separator line
    this.doc.setDrawColor(...COLORS.primary);
    this.doc.setLineWidth(0.8);
    this.doc.line(this.margin, this.yPos, this.pageWidth - this.margin, this.yPos);
    this.yPos += 8;
  }

  private drawDocumentInfo(data: DocumentData): void {
    const boxHeight = 28;
    const halfWidth = this.contentWidth / 2 - 3;

    // Left box: Document info
    this.doc.setFillColor(...COLORS.light);
    this.doc.roundedRect(this.margin, this.yPos, halfWidth, boxHeight, 2, 2, "F");

    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("INFORMATIONS DOCUMENT", this.margin + 4, this.yPos + 5);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.text(`N°: ${data.numero}`, this.margin + 4, this.yPos + 11);
    this.doc.text(`Date: ${formatDate(data.date)}`, this.margin + 4, this.yPos + 16);
    
    if (data.dateEcheance) {
      this.doc.text(`Échéance: ${formatDate(data.dateEcheance)}`, this.margin + 4, this.yPos + 21);
    } else if (data.dateValidite) {
      this.doc.text(`Validité: ${formatDate(data.dateValidite)}`, this.margin + 4, this.yPos + 21);
    }
    if (data.referenceCommande) {
      this.doc.text(`Réf. commande: ${data.referenceCommande}`, this.margin + 4, this.yPos + 26);
    }

    // Right box: Client info
    const rightX = this.margin + halfWidth + 6;
    this.doc.setFillColor(...COLORS.light);
    this.doc.roundedRect(rightX, this.yPos, halfWidth, boxHeight, 2, 2, "F");

    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("CLIENT", rightX + 4, this.yPos + 5);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.text(data.client.nom, rightX + 4, this.yPos + 11);
    if (data.client.adresse) {
      this.doc.text(data.client.adresse, rightX + 4, this.yPos + 16);
    }
    if (data.client.ville) {
      this.doc.text(data.client.ville, rightX + 4, this.yPos + 21);
    }
    if (data.client.nif) {
      this.doc.text(`NIF: ${data.client.nif}`, rightX + 4, this.yPos + 26);
    }

    this.yPos += boxHeight + 8;
  }

  private drawPrestationDetails(data: DocumentData): void {
    if (!data.typePrestation && !data.details) return;

    this.doc.setFillColor(...COLORS.secondary);
    this.doc.roundedRect(this.margin, this.yPos, this.contentWidth, 7, 1, 1, "F");
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("DÉTAILS DE LA PRESTATION", this.margin + 4, this.yPos + 5);
    this.yPos += 10;

    if (data.typePrestation) {
      this.doc.setTextColor(...COLORS.muted);
      this.doc.setFontSize(7);
      this.doc.text("Type:", this.margin, this.yPos);
      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(8);
      this.doc.text(`${data.typePrestation}${data.sousType ? ` - ${data.sousType}` : ""}`, this.margin + 20, this.yPos);
      this.yPos += 5;
    }

    if (data.details) {
      const entries = Object.entries(data.details);
      const colWidth = this.contentWidth / 2;
      let col = 0;
      let startY = this.yPos;

      entries.forEach(([key, value]) => {
        if (!value) return;
        const x = this.margin + col * colWidth;
        this.doc.setTextColor(...COLORS.muted);
        this.doc.setFontSize(7);
        this.doc.text(`${key}:`, x, this.yPos);
        this.doc.setTextColor(...COLORS.dark);
        this.doc.setFontSize(8);
        this.doc.text(value, x + 35, this.yPos);

        if (col === 1) {
          this.yPos += 5;
          col = 0;
        } else {
          col = 1;
        }
      });
      if (col === 1) this.yPos += 5;
    }

    this.yPos += 5;
  }

  private drawLignesTable(data: DocumentData): void {
    // Table header
    this.doc.setFillColor(...COLORS.dark);
    this.doc.rect(this.margin, this.yPos, this.contentWidth, 8, "F");

    const headers = ["Description", "Qté", "Prix Unit.", "TVA", "Total HT"];
    const colWidths = [75, 18, 30, 20, 37];

    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");

    let xPos = this.margin + 3;
    headers.forEach((header, i) => {
      this.doc.text(header, xPos, this.yPos + 5.5);
      xPos += colWidths[i];
    });

    this.yPos += 10;

    // Table rows
    let totalHT = 0;
    let totalTVA = 0;

    data.lignes.forEach((ligne, index) => {
      this.checkNewPage(10);

      const ligneHT = ligne.quantite * ligne.prixUnitaire;
      const ligneTVA = ligneHT * ((ligne.tva || data.tauxTVA || 0) / 100);
      totalHT += ligneHT;
      totalTVA += ligneTVA;

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
        ligne.description.length > 40 ? ligne.description.substring(0, 40) + "..." : ligne.description,
        ligne.quantite.toString(),
        formatCurrency(ligne.prixUnitaire),
        `${ligne.tva || data.tauxTVA || 0}%`,
        formatCurrency(ligneHT),
      ];

      rowData.forEach((cell, i) => {
        this.doc.text(cell, xPos, this.yPos + 4);
        xPos += colWidths[i];
      });

      this.yPos += 7;
    });

    // Totaux
    this.yPos += 3;
    const totalsX = this.pageWidth - this.margin - 70;

    // Ligne de séparation
    this.doc.setDrawColor(...COLORS.muted);
    this.doc.setLineWidth(0.3);
    this.doc.line(totalsX, this.yPos, this.pageWidth - this.margin, this.yPos);
    this.yPos += 4;

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...COLORS.dark);

    // Total HT
    this.doc.text("Total HT:", totalsX, this.yPos);
    this.doc.text(formatCurrency(totalHT), this.pageWidth - this.margin, this.yPos, { align: "right" });
    this.yPos += 5;

    // TVA
    this.doc.text("TVA:", totalsX, this.yPos);
    this.doc.text(formatCurrency(totalTVA), this.pageWidth - this.margin, this.yPos, { align: "right" });
    this.yPos += 5;

    // Remise
    if (data.remiseGlobale && data.remiseGlobale > 0) {
      const remise = (totalHT + totalTVA) * (data.remiseGlobale / 100);
      this.doc.text(`Remise (${data.remiseGlobale}%):`, totalsX, this.yPos);
      this.doc.setTextColor(...COLORS.danger);
      this.doc.text(`-${formatCurrency(remise)}`, this.pageWidth - this.margin, this.yPos, { align: "right" });
      this.yPos += 5;
      totalHT -= remise;
    }

    // Acompte
    if (data.acompte && data.acompte > 0) {
      this.doc.setTextColor(...COLORS.dark);
      this.doc.text("Acompte versé:", totalsX, this.yPos);
      this.doc.setTextColor(...COLORS.success);
      this.doc.text(`-${formatCurrency(data.acompte)}`, this.pageWidth - this.margin, this.yPos, { align: "right" });
      this.yPos += 5;
    }

    // Total TTC
    const totalTTC = totalHT + totalTVA - (data.acompte || 0);
    this.doc.setFillColor(...COLORS.primary);
    this.doc.roundedRect(totalsX - 5, this.yPos - 1, 75, 10, 2, 2, "F");
    this.doc.setTextColor(...COLORS.white);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("TOTAL TTC:", totalsX, this.yPos + 5);
    this.doc.text(formatCurrency(totalTTC), this.pageWidth - this.margin - 2, this.yPos + 5, { align: "right" });

    this.yPos += 15;
  }

  private drawNotes(data: DocumentData): void {
    if (!data.notes && !data.conditionsPaiement) return;

    this.checkNewPage(25);

    this.doc.setFillColor(...COLORS.light);
    this.doc.roundedRect(this.margin, this.yPos, this.contentWidth, 20, 2, 2, "F");

    this.doc.setTextColor(...COLORS.muted);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("NOTES & CONDITIONS", this.margin + 4, this.yPos + 5);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    this.doc.setTextColor(...COLORS.dark);

    let noteY = this.yPos + 10;
    if (data.conditionsPaiement) {
      this.doc.text(`Conditions de paiement: ${data.conditionsPaiement}`, this.margin + 4, noteY);
      noteY += 4;
    }
    if (data.notes) {
      const splitNotes = this.doc.splitTextToSize(data.notes, this.contentWidth - 8);
      this.doc.text(splitNotes, this.margin + 4, noteY);
    }

    this.yPos += 25;
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
      `BGFI Bank: ${COMPANY_CONFIG.compteBGFI} | UGB: ${COMPANY_CONFIG.compteUGB}`,
      `Tél: ${COMPANY_CONFIG.tel} | Email: ${COMPANY_CONFIG.email} | ${COMPANY_CONFIG.site}`,
    ];

    lines.forEach((line, i) => {
      this.doc.text(line, this.pageWidth / 2, footerY + i * 4, { align: "center" });
    });

    // Page number
    this.doc.setFontSize(7);
    this.doc.text(`Page 1/1`, this.pageWidth - this.margin, footerY + 12, { align: "right" });
  }

  public generate(data: DocumentData): jsPDF {
    // Auto-generate number if not provided
    if (!data.numero) {
      data.numero = getNextNumber(data.type);
    }

    this.drawHeader(data);
    this.drawDocumentInfo(data);
    this.drawPrestationDetails(data);
    this.drawLignesTable(data);
    this.drawNotes(data);
    this.drawFooter();

    return this.doc;
  }

  public generateAndDownload(data: DocumentData, filename?: string): void {
    const doc = this.generate(data);
    const defaultFilename = `${data.type.toUpperCase()}_${data.numero}_${data.client.nom.replace(/\s+/g, "_")}.pdf`;
    doc.save(filename || defaultFilename);
  }

  public generateAndOpen(data: DocumentData): void {
    const doc = this.generate(data);
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  }
}

// ===== HELPER FUNCTIONS =====
export const generateFacturePDF = (data: Omit<DocumentData, "type">): void => {
  const generator = new DocumentPDFGenerator();
  generator.generateAndDownload({ ...data, type: "facture" });
};

export const generateDevisPDF = (data: Omit<DocumentData, "type">): void => {
  const generator = new DocumentPDFGenerator();
  generator.generateAndDownload({ ...data, type: "devis" });
};

export const generateOrdrePDFNew = (data: Omit<DocumentData, "type">): void => {
  const generator = new DocumentPDFGenerator();
  generator.generateAndDownload({ ...data, type: "ordre" });
};

export const previewDocument = (data: DocumentData): void => {
  const generator = new DocumentPDFGenerator();
  generator.generateAndOpen(data);
};

export const getNextDocumentNumber = getNextNumber;
