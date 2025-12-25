import jsPDF from "jspdf";

export interface OrdreTravailData {
  type: string;
  subType: string;
  subTypeLabel: string;
  client: string;
  description: string;
  lignes: Array<{
    description: string;
    quantite: number;
    prixUnit: number;
    total: number;
  }>;
  // Transport fields
  pointDepart?: string;
  pointArrivee?: string;
  dateEnlevement?: string;
  dateLivraison?: string;
  // Import fields
  numeroConnaissement?: string;
  numeroConteneur?: string;
  compagnieMaritime?: string;
  navire?: string;
  transitaire?: string;
  representant?: string;
  // Export fields
  destinationFinale?: string;
  numeroBooking?: string;
  // Exceptionnel fields
  poidsTotal?: string;
  dimensions?: string;
  typeEscorte?: string;
  autorisationSpeciale?: string;
  // Manutention fields
  lieuPrestation?: string;
  typeMarchandise?: string;
  datePrestation?: string;
  typeManutention?: string;
  // Stockage fields
  dateEntree?: string;
  dateSortie?: string;
  duree?: string;
  typeStockage?: string;
  entrepot?: string;
  surface?: string;
  tarifJournalier?: string;
  totalEstime?: string;
  // Location fields
  dateDebut?: string;
  dateFin?: string;
  typeEngin?: string;
  typeVehicule?: string;
  avecChauffeur?: string;
  lieuUtilisation?: string;
}

export const generateOrdrePDF = (data: OrdreTravailData): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Colors
  const primaryColor: [number, number, number] = [220, 38, 38]; // Red
  const textColor: [number, number, number] = [31, 41, 55]; // Dark gray
  const mutedColor: [number, number, number] = [107, 114, 128]; // Gray

  // Helper function to add text
  const addText = (
    text: string,
    x: number,
    y: number,
    size: number = 8,
    color: [number, number, number] = textColor,
    style: "normal" | "bold" = "normal"
  ) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont("helvetica", style);
    doc.text(text, x, y);
  };

  // ===== HEADER with LOGO =====
  // Draw a centered logo placeholder (circle with L)
  const logoSize = 25;
  const logoX = pageWidth / 2;
  doc.setFillColor(...primaryColor);
  doc.circle(logoX, yPos + logoSize / 2, logoSize / 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("L", logoX, yPos + logoSize / 2 + 3, { align: "center" });

  yPos += logoSize + 5;

  // Company name
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LOGISTIGA", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  // ===== DOCUMENT TITLE =====
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - margin * 2, 12, "F");
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ORDRE DE TRAVAIL", pageWidth / 2, yPos + 8, { align: "center" });
  yPos += 18;

  // ===== TYPE & SUBTYPE BADGES =====
  const badgeHeight = 6;
  const typeText = data.type.toUpperCase();
  const subTypeText = data.subTypeLabel.toUpperCase();
  
  // Type badge
  doc.setFillColor(...primaryColor);
  const typeWidth = doc.getTextWidth(typeText) * 0.35 + 8;
  doc.roundedRect(margin, yPos, typeWidth, badgeHeight, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(typeText, margin + 4, yPos + 4);

  // SubType badge
  doc.setFillColor(229, 231, 235);
  const subTypeWidth = doc.getTextWidth(subTypeText) * 0.35 + 8;
  doc.roundedRect(margin + typeWidth + 3, yPos, subTypeWidth, badgeHeight, 1, 1, "F");
  doc.setTextColor(...textColor);
  doc.text(subTypeText, margin + typeWidth + 7, yPos + 4);

  // Order number & date (right side)
  const orderNum = `OT-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString("fr-FR");
  addText(`N°: ${orderNum}`, pageWidth - margin - 40, yPos + 4, 8, textColor, "bold");
  addText(`Date: ${dateStr}`, pageWidth - margin - 40, yPos + 10, 7, mutedColor);
  
  yPos += 16;

  // ===== CLIENT INFO =====
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  addText("CLIENT", margin, yPos, 7, mutedColor, "bold");
  yPos += 4;
  addText(data.client || "Non spécifié", margin, yPos, 9, textColor, "bold");
  yPos += 8;

  // ===== TYPE-SPECIFIC FIELDS =====
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  addText("DETAILS DE LA PRESTATION", margin, yPos, 7, mutedColor, "bold");
  yPos += 6;

  const colWidth = (pageWidth - margin * 2) / 2;
  let leftCol = margin;
  let rightCol = margin + colWidth;
  let fieldY = yPos;

  const addField = (label: string, value: string | undefined, col: "left" | "right") => {
    if (!value) return;
    const x = col === "left" ? leftCol : rightCol;
    addText(label, x, fieldY, 6, mutedColor);
    addText(value, x, fieldY + 3, 8, textColor);
  };

  // Transport fields
  if (data.type === "Transport") {
    addField("Point de départ", data.pointDepart, "left");
    addField("Point d'arrivée", data.pointArrivee, "right");
    fieldY += 9;
    addField("Date d'enlèvement", data.dateEnlevement, "left");
    addField("Date de livraison", data.dateLivraison, "right");
    fieldY += 9;

    if (data.subType === "import") {
      addField("N° Connaissement (BL)", data.numeroConnaissement, "left");
      addField("Numéro de conteneur", data.numeroConteneur, "right");
      fieldY += 9;
      addField("Compagnie Maritime", data.compagnieMaritime, "left");
      addField("Navire", data.navire, "right");
      fieldY += 9;
      addField("Transitaire", data.transitaire, "left");
      addField("Représentant", data.representant, "right");
      fieldY += 9;
    } else if (data.subType === "export") {
      addField("Destination finale", data.destinationFinale, "left");
      addField("N° Booking", data.numeroBooking, "right");
      fieldY += 9;
      addField("Compagnie Maritime", data.compagnieMaritime, "left");
      addField("Numéro de conteneur", data.numeroConteneur, "right");
      fieldY += 9;
    } else if (data.subType === "exceptionnel") {
      addField("Poids total", data.poidsTotal, "left");
      addField("Dimensions", data.dimensions, "right");
      fieldY += 9;
      addField("Type d'escorte", data.typeEscorte, "left");
      addField("Autorisation spéciale", data.autorisationSpeciale, "right");
      fieldY += 9;
    }
  }

  // Manutention fields
  if (data.type === "Manutention") {
    addField("Lieu de prestation", data.lieuPrestation, "left");
    addField("Type de marchandise", data.typeMarchandise, "right");
    fieldY += 9;
    addField("Date de prestation", data.datePrestation, "left");
    if (data.subType === "autre") {
      addField("Type de manutention", data.typeManutention, "right");
    }
    fieldY += 9;
  }

  // Stockage fields
  if (data.type === "Stockage") {
    addField("Date d'entrée", data.dateEntree, "left");
    addField("Date de sortie", data.dateSortie, "right");
    fieldY += 9;
    addField("Type de stockage", data.typeStockage, "left");
    addField("Entrepôt", data.entrepot, "right");
    fieldY += 9;
    addField("Type de marchandise", data.typeMarchandise, "left");
    addField("Surface (m²)", data.surface, "right");
    fieldY += 9;
    addField("Tarif journalier/m²", data.tarifJournalier, "left");
    addField("Total estimé", data.totalEstime, "right");
    fieldY += 9;
  }

  // Location fields
  if (data.type === "Location") {
    addField("Date de début", data.dateDebut, "left");
    addField("Date de fin", data.dateFin, "right");
    fieldY += 9;
    if (data.subType === "engin") {
      addField("Type d'engin", data.typeEngin, "left");
    } else {
      addField("Type de véhicule", data.typeVehicule, "left");
    }
    addField("Avec chauffeur/opérateur", data.avecChauffeur, "right");
    fieldY += 9;
    addField("Lieu d'utilisation", data.lieuUtilisation, "left");
    addField("Total estimé", data.totalEstime, "right");
    fieldY += 9;
  }

  yPos = fieldY + 3;

  // ===== DESCRIPTION =====
  if (data.description) {
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    addText("DESCRIPTION", margin, yPos, 7, mutedColor, "bold");
    yPos += 5;
    doc.setFontSize(8);
    doc.setTextColor(...textColor);
    const splitDesc = doc.splitTextToSize(data.description, pageWidth - margin * 2);
    doc.text(splitDesc, margin, yPos);
    yPos += splitDesc.length * 4 + 3;
  }

  // ===== LIGNES DE PRESTATION =====
  if (data.lignes && data.lignes.length > 0) {
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    addText("LIGNES DE PRESTATION", margin, yPos, 7, mutedColor, "bold");
    yPos += 6;

    // Table header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, pageWidth - margin * 2, 6, "F");
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Description", margin + 2, yPos + 4);
    doc.text("Qté", margin + 100, yPos + 4);
    doc.text("Prix Unit.", margin + 120, yPos + 4);
    doc.text("Total", margin + 150, yPos + 4);
    yPos += 8;

    // Table rows
    doc.setFont("helvetica", "normal");
    let totalGeneral = 0;
    data.lignes.forEach((ligne) => {
      doc.text(ligne.description || "-", margin + 2, yPos);
      doc.text(String(ligne.quantite || 0), margin + 100, yPos);
      doc.text(`${(ligne.prixUnit || 0).toLocaleString("fr-FR")} FCFA`, margin + 120, yPos);
      doc.text(`${(ligne.total || 0).toLocaleString("fr-FR")} FCFA`, margin + 150, yPos);
      totalGeneral += ligne.total || 0;
      yPos += 5;
    });

    // Total
    yPos += 2;
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", margin + 120, yPos);
    doc.text(`${totalGeneral.toLocaleString("fr-FR")} FCFA`, margin + 150, yPos);
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 20;
  
  // Footer separator
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  // Footer text
  doc.setFontSize(5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  
  const footerLine1 = "LOGISTIGA SARL au capital 18 000 000 FC - Siège social: Owendo S/ETRAG - (GABON) Tél: (+241) 07 10 47 30 / 07 10 56 76";
  const footerLine2 = "N.IF:7479160 - R° Statistique: 092441 N° RC 2018B02163 - Email: info@logistiga.com - Site web: www.logistiga.com";
  const footerLine3 = "Compte BGFIB: N° 40003 04140 4104165087118 - Compte UGB N°: 40002 00043 9000330B81 84";

  doc.text(footerLine1, pageWidth / 2, footerY, { align: "center" });
  doc.text(footerLine2, pageWidth / 2, footerY + 4, { align: "center" });
  doc.text(footerLine3, pageWidth / 2, footerY + 8, { align: "center" });

  return doc;
};
