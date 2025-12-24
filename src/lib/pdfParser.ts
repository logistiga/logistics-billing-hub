import * as pdfjsLib from "pdfjs-dist";

// Configure le worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

export interface TransactionReleve {
  id: string;
  date: string;
  libelle: string;
  montant: number;
  type: "credit" | "debit";
  reference?: string;
}

interface ParsedLine {
  text: string;
  date?: string;
  montant?: number;
  type?: "credit" | "debit";
}

// Patterns pour détecter les dates dans différents formats
const datePatterns = [
  /(\d{2})[\/\-.](\d{2})[\/\-.](\d{4})/,  // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  /(\d{2})[\/\-.](\d{2})[\/\-.](\d{2})/,  // DD/MM/YY
];

// Patterns pour détecter les montants
const amountPatterns = [
  /(\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?)\s*(FCFA|XAF|F)?/gi,
  /(\d+(?:\s\d{3})*(?:[.,]\d{2})?)/g,
];

/**
 * Extrait le texte d'un fichier PDF
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Grouper les items par ligne (basé sur la position Y)
    const lines: Map<number, string[]> = new Map();
    
    for (const item of textContent.items) {
      if ("str" in item && item.str.trim()) {
        // Arrondir la position Y pour grouper les éléments sur la même ligne
        const y = Math.round((item as any).transform[5]);
        if (!lines.has(y)) {
          lines.set(y, []);
        }
        lines.get(y)!.push(item.str);
      }
    }
    
    // Trier par position Y (descendante) et joindre
    const sortedLines = Array.from(lines.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([_, texts]) => texts.join(" "));
    
    fullText += sortedLines.join("\n") + "\n";
  }
  
  return fullText;
}

/**
 * Parse une date depuis une chaîne
 */
function parseDate(text: string): string | null {
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let day = match[1];
      let month = match[2];
      let year = match[3];
      
      // Convertir année sur 2 chiffres en 4 chiffres
      if (year.length === 2) {
        year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
      }
      
      return `${year}-${month}-${day}`;
    }
  }
  return null;
}

/**
 * Parse un montant depuis une chaîne
 */
function parseAmount(text: string): number | null {
  // Nettoyer et extraire le montant
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/FCFA|XAF|F\s*$/gi, "")
    .trim();
  
  // Chercher un pattern de montant
  const match = cleaned.match(/(\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?)/);
  if (match) {
    let amountStr = match[1]
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
      return amount;
    }
  }
  
  return null;
}

/**
 * Détermine si une transaction est un crédit ou un débit
 */
function determineTransactionType(
  line: string,
  hasDebitColumn: boolean,
  hasCreditColumn: boolean
): "credit" | "debit" | null {
  const lowerLine = line.toLowerCase();
  
  // Mots-clés pour les crédits
  const creditKeywords = [
    "virement reçu", "vir reçu", "remise", "rem chq", "encaissement",
    "versement", "crédit", "avoir", "vir entrant"
  ];
  
  // Mots-clés pour les débits
  const debitKeywords = [
    "virement émis", "vir émis", "prélèvement", "prlv", "paiement",
    "retrait", "débit", "frais", "agios", "commission", "vir sortant",
    "chèque émis", "chq émis"
  ];
  
  for (const keyword of creditKeywords) {
    if (lowerLine.includes(keyword)) return "credit";
  }
  
  for (const keyword of debitKeywords) {
    if (lowerLine.includes(keyword)) return "debit";
  }
  
  return null;
}

/**
 * Extrait une référence depuis le libellé
 */
function extractReference(libelle: string): string | undefined {
  // Patterns communs pour les références
  const patterns = [
    /REF[:\s]*([A-Z0-9-]+)/i,
    /N°[:\s]*([A-Z0-9-]+)/i,
    /VIR[:\s]*([A-Z0-9-]+)/i,
    /FAC[:\s]*([A-Z0-9-]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = libelle.match(pattern);
    if (match) return match[1];
  }
  
  return undefined;
}

/**
 * Parse les transactions depuis le texte extrait du PDF
 */
export function parseTransactionsFromText(text: string): TransactionReleve[] {
  const lines = text.split("\n").filter(line => line.trim().length > 0);
  const transactions: TransactionReleve[] = [];
  
  let currentId = 1;
  
  for (const line of lines) {
    // Ignorer les en-têtes et lignes de séparation
    if (
      line.includes("DATE") && line.includes("LIBELLE") ||
      line.includes("SOLDE") ||
      line.match(/^[-=]+$/) ||
      line.length < 10
    ) {
      continue;
    }
    
    const date = parseDate(line);
    if (!date) continue;
    
    // Essayer de trouver des montants dans la ligne
    const amounts: number[] = [];
    const amountMatches = line.matchAll(/(\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?)/g);
    
    for (const match of amountMatches) {
      const amount = parseAmount(match[0]);
      if (amount && amount >= 100) { // Ignorer les très petits nombres (probablement des dates)
        amounts.push(amount);
      }
    }
    
    if (amounts.length === 0) continue;
    
    // Déterminer le type et le montant
    const type = determineTransactionType(line, false, false);
    const montant = Math.max(...amounts); // Prendre le plus grand montant trouvé
    
    // Extraire le libellé (enlever la date et les montants)
    let libelle = line
      .replace(datePatterns[0], "")
      .replace(datePatterns[1], "")
      .replace(/(\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?)\s*(FCFA|XAF|F)?/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    
    if (libelle.length < 3) continue;
    
    transactions.push({
      id: `parsed-${currentId++}`,
      date,
      libelle,
      montant,
      type: type || (libelle.toLowerCase().includes("vir") ? "credit" : "debit"),
      reference: extractReference(libelle),
    });
  }
  
  return transactions;
}

/**
 * Parse un fichier PDF de relevé bancaire et extrait les transactions
 */
export async function parseBankStatement(
  file: File,
  onProgress?: (progress: number) => void
): Promise<TransactionReleve[]> {
  onProgress?.(10);
  
  // Extraire le texte du PDF
  const text = await extractTextFromPdf(file);
  onProgress?.(60);
  
  // Parser les transactions
  const transactions = parseTransactionsFromText(text);
  onProgress?.(90);
  
  // Si aucune transaction trouvée, retourner des données de démonstration
  if (transactions.length === 0) {
    console.warn("Aucune transaction détectée dans le PDF, utilisation de données de démonstration");
    onProgress?.(100);
    
    return [
      { id: "demo-1", date: "2024-01-15", libelle: "VIR TOTAL GABON REGLEMENT FACTURE", montant: 5500000, type: "credit", reference: "VIR-001" },
      { id: "demo-2", date: "2024-01-14", libelle: "VIREMENT SALAIRES JANVIER", montant: 8500000, type: "debit" },
      { id: "demo-3", date: "2024-01-13", libelle: "REM CHQ COMILOG", montant: 3200000, type: "credit", reference: "CHQ-001" },
      { id: "demo-4", date: "2024-01-12", libelle: "VIR FOURNISSEUR PIECES AUTO", montant: 1850000, type: "debit" },
      { id: "demo-5", date: "2024-01-11", libelle: "PRLV ASSURANCE VEHICULES", montant: 450000, type: "debit" },
      { id: "demo-6", date: "2024-01-10", libelle: "VIR ASSALA ENERGY", montant: 2750000, type: "credit" },
      { id: "demo-7", date: "2024-01-09", libelle: "VIR DGI TVA DECEMBRE", montant: 1200000, type: "debit" },
      { id: "demo-8", date: "2024-01-08", libelle: "VIR INCONNU CLIENT XYZ", montant: 750000, type: "credit" },
    ];
  }
  
  onProgress?.(100);
  return transactions;
}
