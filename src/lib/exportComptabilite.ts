import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface Transaction {
  date: string;
  reference: string;
  description: string;
  categorie: string;
  type: "entree" | "sortie";
  montant: number;
  client?: string;
  modePaiement?: string;
  banque?: string;
}

interface ExportOptions {
  titre: string;
  sousTitre: string;
  periodeDebut: string;
  periodeFin: string;
  transactions: Transaction[];
  totaux: {
    entrees: number;
    sorties: number;
    solde: number;
  };
  type: "caisse" | "banque" | "global";
}

const COMPANY_INFO = {
  nom: "LOGISTIGA SARL",
  capital: "18 000 000 FC",
  siege: "Owendo S/ETRAG - (GABON)",
  tel: "(+241) 07 10 47 30 / 07 10 56 76",
  nif: "7479160",
  rStat: "092441",
  rc: "2018B02163",
  email: "info@logistiga.com",
  site: "www.logistiga.com",
  compteBGFI: "40003 04140 4104165087118",
  compteUGB: "40002 00043 9000330B81 84",
};

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

export const generateExportPDF = (options: ExportOptions): void => {
  const { titre, sousTitre, periodeDebut, periodeFin, transactions, totaux, type } = options;
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Header with logo placeholder and company name
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("LOGISTIGA", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Transport - Logistique - Transit", pageWidth / 2, 22, { align: "center" });
  
  doc.setFontSize(8);
  doc.text(`${COMPANY_INFO.siege} | Tél: ${COMPANY_INFO.tel}`, pageWidth / 2, 30, { align: "center" });

  yPos = 45;

  // Title section
  doc.setTextColor(41, 128, 185);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(titre, pageWidth / 2, yPos, { align: "center" });
  
  yPos += 7;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(sousTitre, pageWidth / 2, yPos, { align: "center" });

  yPos += 6;
  doc.setFontSize(10);
  doc.text(`Période: du ${formatDateLong(periodeDebut)} au ${formatDateLong(periodeFin)}`, pageWidth / 2, yPos, { align: "center" });

  yPos += 10;

  // Summary cards
  const cardWidth = (pageWidth - margin * 2 - 10) / 3;
  const cardHeight = 20;
  
  // Entrées card
  doc.setFillColor(39, 174, 96);
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("TOTAL ENTRÉES", margin + cardWidth / 2, yPos + 6, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(totaux.entrees), margin + cardWidth / 2, yPos + 14, { align: "center" });

  // Sorties card
  doc.setFillColor(231, 76, 60);
  doc.roundedRect(margin + cardWidth + 5, yPos, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL SORTIES", margin + cardWidth + 5 + cardWidth / 2, yPos + 6, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(totaux.sorties), margin + cardWidth + 5 + cardWidth / 2, yPos + 14, { align: "center" });

  // Solde card
  const soldeColor = totaux.solde >= 0 ? [39, 174, 96] : [231, 76, 60];
  doc.setFillColor(soldeColor[0], soldeColor[1], soldeColor[2]);
  doc.roundedRect(margin + (cardWidth + 5) * 2, yPos, cardWidth, cardHeight, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("SOLDE", margin + (cardWidth + 5) * 2 + cardWidth / 2, yPos + 6, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(totaux.solde), margin + (cardWidth + 5) * 2 + cardWidth / 2, yPos + 14, { align: "center" });

  yPos += cardHeight + 10;

  // Table header
  const colWidths = type === "banque" 
    ? [22, 22, 55, 30, 25, 26] 
    : [25, 25, 60, 35, 35];
  
  const headers = type === "banque"
    ? ["Date", "Réf.", "Description", "Banque", "Mode", "Montant"]
    : ["Date", "Réf.", "Description", "Catégorie", "Montant"];

  doc.setFillColor(52, 73, 94);
  doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  
  let xPos = margin + 2;
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos + 5.5);
    xPos += colWidths[i];
  });

  yPos += 8;

  // Table rows
  doc.setFont("helvetica", "normal");
  let rowCount = 0;
  const maxRows = 25;

  transactions.forEach((t, index) => {
    if (rowCount >= maxRows) {
      // New page
      doc.addPage();
      yPos = margin;
      
      // Repeat header
      doc.setFillColor(52, 73, 94);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      
      xPos = margin + 2;
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos + 5.5);
        xPos += colWidths[i];
      });
      yPos += 8;
      rowCount = 0;
    }

    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos, pageWidth - margin * 2, 7, "F");
    }

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    xPos = margin + 2;
    
    // Date
    doc.text(formatDate(t.date), xPos, yPos + 5);
    xPos += colWidths[0];
    
    // Reference
    doc.text(t.reference.substring(0, 10), xPos, yPos + 5);
    xPos += colWidths[1];
    
    // Description (truncate if too long)
    const maxDescLength = type === "banque" ? 35 : 40;
    const desc = t.description.length > maxDescLength 
      ? t.description.substring(0, maxDescLength) + "..." 
      : t.description;
    doc.text(desc, xPos, yPos + 5);
    xPos += colWidths[2];

    if (type === "banque") {
      // Banque
      doc.text(t.banque || "-", xPos, yPos + 5);
      xPos += colWidths[3];
      
      // Mode
      doc.text(t.modePaiement || "-", xPos, yPos + 5);
      xPos += colWidths[4];
    } else {
      // Catégorie
      doc.text(t.categorie, xPos, yPos + 5);
      xPos += colWidths[3];
    }
    
    // Montant with color
    const montantText = (t.type === "entree" ? "+" : "-") + " " + formatCurrency(t.montant);
    doc.setTextColor(t.type === "entree" ? 39 : 231, t.type === "entree" ? 174 : 76, t.type === "entree" ? 96 : 60);
    doc.setFont("helvetica", "bold");
    doc.text(montantText, xPos, yPos + 5);

    yPos += 7;
    rowCount++;
  });

  // Transaction count
  yPos += 5;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(`Total: ${transactions.length} transaction(s)`, margin, yPos);

  // Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    // Company footer info
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    
    doc.text(
      `${COMPANY_INFO.nom} au capital ${COMPANY_INFO.capital} - Siège social: ${COMPANY_INFO.siege}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
    doc.text(
      `Tél: ${COMPANY_INFO.tel} | N.IF: ${COMPANY_INFO.nif} | R° Statistique: ${COMPANY_INFO.rStat} | N° RC ${COMPANY_INFO.rc}`,
      pageWidth / 2,
      pageHeight - 16,
      { align: "center" }
    );
    doc.text(
      `Email: ${COMPANY_INFO.email} - Site web: ${COMPANY_INFO.site}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );
    doc.text(
      `Compte BGFIB: N° ${COMPANY_INFO.compteBGFI} – Compte UGB N°: ${COMPANY_INFO.compteUGB}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );

    // Page number
    doc.setFontSize(8);
    doc.text(`Page ${i}/${totalPages}`, pageWidth - margin, pageHeight - 5, { align: "right" });
  }

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `${titre.replace(/\s+/g, "_")}_${dateStr}.pdf`;
  
  doc.save(filename);
};

export const generateExportExcel = (options: ExportOptions): void => {
  const { titre, periodeDebut, periodeFin, transactions, totaux, type } = options;

  // Prepare data for Excel
  const headers = type === "banque"
    ? ["Date", "Référence", "Description", "Catégorie", "Banque", "Mode Paiement", "Client", "Type", "Montant"]
    : ["Date", "Référence", "Description", "Catégorie", "Client", "Type", "Montant"];

  const data = transactions.map((t) => {
    if (type === "banque") {
      return [
        formatDate(t.date),
        t.reference,
        t.description,
        t.categorie,
        t.banque || "",
        t.modePaiement || "",
        t.client || "",
        t.type === "entree" ? "Entrée" : "Sortie",
        t.type === "entree" ? t.montant : -t.montant,
      ];
    }
    return [
      formatDate(t.date),
      t.reference,
      t.description,
      t.categorie,
      t.client || "",
      t.type === "entree" ? "Entrée" : "Sortie",
      t.type === "entree" ? t.montant : -t.montant,
    ];
  });

  // Add summary rows
  data.push([]);
  data.push(["", "", "", "", "", type === "banque" ? "" : "", type === "banque" ? "" : "", "Total Entrées:", totaux.entrees]);
  data.push(["", "", "", "", "", type === "banque" ? "" : "", type === "banque" ? "" : "", "Total Sorties:", -totaux.sorties]);
  data.push(["", "", "", "", "", type === "banque" ? "" : "", type === "banque" ? "" : "", "Solde:", totaux.solde]);

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet([
    [COMPANY_INFO.nom],
    [`${titre} - Du ${formatDateLong(periodeDebut)} au ${formatDateLong(periodeFin)}`],
    [],
    headers,
    ...data,
  ]);

  // Set column widths
  ws["!cols"] = type === "banque"
    ? [
        { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 15 },
      ]
    : [
        { wch: 12 }, { wch: 12 }, { wch: 45 }, { wch: 18 },
        { wch: 20 }, { wch: 10 }, { wch: 15 },
      ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `${titre.replace(/\s+/g, "_")}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
};
