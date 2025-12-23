import { z } from "zod";

// Messages d'erreur en français
const messages = {
  required: "Ce champ est obligatoire",
  email: "Adresse email invalide",
  min: (n: number) => `Minimum ${n} caractères requis`,
  max: (n: number) => `Maximum ${n} caractères autorisés`,
  phone: "Numéro de téléphone invalide",
  nif: "Format NIF invalide (ex: 123456789GA)",
  rccm: "Format RCCM invalide (ex: LBV/2024/B/12345)",
  positive: "Le montant doit être positif",
  password: {
    min: "Le mot de passe doit contenir au moins 8 caractères",
    uppercase: "Le mot de passe doit contenir au moins une majuscule",
    lowercase: "Le mot de passe doit contenir au moins une minuscule",
    number: "Le mot de passe doit contenir au moins un chiffre",
    match: "Les mots de passe ne correspondent pas",
  },
};

// ==================== CLIENT ====================
export const contactSchema = z.object({
  name: z.string().min(1, messages.required).max(100, messages.max(100)),
  email: z.string().email(messages.email).or(z.literal("")).default(""),
  phone: z.string().max(20, messages.max(20)).default(""),
});

export const clientSchema = z.object({
  name: z.string().min(1, messages.required).max(100, messages.max(100)),
  nif: z
    .string()
    .min(1, messages.required)
    .regex(/^[0-9]{9}[A-Z]{2}$/, messages.nif),
  rccm: z
    .string()
    .min(1, messages.required)
    .regex(/^[A-Z]{2,3}\/\d{4}\/[A-Z]\/\d{4,5}$/, messages.rccm),
  address: z.string().max(255, messages.max(255)).default(""),
  city: z.string().max(50, messages.max(50)).default(""),
  phone: z.string().max(20, messages.max(20)).default(""),
  email: z.string().email(messages.email).or(z.literal("")).default(""),
  contacts: z.array(contactSchema).default([]),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ==================== PROFIL ====================
export const profileSchema = z.object({
  firstName: z.string().min(1, messages.required).max(50, messages.max(50)),
  lastName: z.string().max(50, messages.max(50)).optional(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, messages.required),
    newPassword: z
      .string()
      .min(8, messages.password.min)
      .regex(/[A-Z]/, messages.password.uppercase)
      .regex(/[a-z]/, messages.password.lowercase)
      .regex(/[0-9]/, messages.password.number),
    confirmPassword: z.string().min(1, messages.required),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: messages.password.match,
    path: ["confirmPassword"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;

// ==================== ORDRE DE TRAVAIL ====================
export const ligneSchema = z.object({
  description: z.string().min(1, messages.required),
  quantite: z.number().min(1, "La quantité doit être au moins 1"),
  prixUnit: z.number().min(0, messages.positive),
  total: z.number(),
});

export const ordreTravailBaseSchema = z.object({
  client: z.string().min(1, "Veuillez sélectionner un client"),
  description: z.string().max(500, messages.max(500)).optional(),
  lignes: z.array(ligneSchema).min(1, "Au moins une ligne de prestation est requise"),
});

// Transport fields
export const transportSchema = ordreTravailBaseSchema.extend({
  pointDepart: z.string().min(1, "Le point de départ est obligatoire"),
  pointArrivee: z.string().min(1, "Le point d'arrivée est obligatoire"),
  dateEnlevement: z.string().min(1, "La date d'enlèvement est obligatoire"),
  dateLivraison: z.string().optional(),
});

// Import fields
export const importSchema = transportSchema.extend({
  numeroConnaissement: z.string().min(1, "Le numéro de connaissement est obligatoire"),
  numeroConteneur: z.string().min(1, "Le numéro de conteneur est obligatoire"),
  compagnieMaritime: z.string().min(1, "La compagnie maritime est obligatoire"),
  navire: z.string().optional(),
  transitaire: z.string().min(1, "Le transitaire est obligatoire"),
  representant: z.string().optional(),
});

// Export fields
export const exportSchema = transportSchema.extend({
  destinationFinale: z.string().min(1, "La destination finale est obligatoire"),
  numeroBooking: z.string().optional(),
  compagnieMaritime: z.string().min(1, "La compagnie maritime est obligatoire"),
  numeroConteneur: z.string().optional(),
});

// Manutention fields
export const manutentionSchema = ordreTravailBaseSchema.extend({
  lieuPrestation: z.string().min(1, "Le lieu de prestation est obligatoire"),
  typeMarchandise: z.string().optional(),
  datePrestation: z.string().min(1, "La date de prestation est obligatoire"),
  typeManutention: z.string().optional(),
});

// Stockage fields
export const stockageSchema = ordreTravailBaseSchema.extend({
  dateEntree: z.string().min(1, "La date d'entrée est obligatoire"),
  dateSortie: z.string().optional(),
  typeStockage: z.string().min(1, "Le type de stockage est obligatoire"),
  entrepot: z.string().min(1, "L'entrepôt est obligatoire"),
  typeMarchandise: z.string().optional(),
  surface: z.string().optional(),
  tarifJournalier: z.string().optional(),
});

// Location fields
export const locationSchema = ordreTravailBaseSchema.extend({
  dateDebut: z.string().min(1, "La date de début est obligatoire"),
  dateFin: z.string().optional(),
  typeEngin: z.string().optional(),
  typeVehicule: z.string().optional(),
  avecChauffeur: z.string().optional(),
  lieuUtilisation: z.string().min(1, "Le lieu d'utilisation est obligatoire"),
});

// ==================== EMAIL ====================
export const emailSchema = z.object({
  to: z.string().email(messages.email),
  subject: z.string().min(1, messages.required).max(200, messages.max(200)),
  message: z.string().min(1, messages.required).max(5000, messages.max(5000)),
});

export type EmailFormData = z.infer<typeof emailSchema>;

// ==================== AVOIR ====================
export const avoirSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  reason: z.string().min(1, "Le motif est obligatoire").max(500, messages.max(500)),
});

export type AvoirFormData = z.infer<typeof avoirSchema>;

// ==================== HELPERS ====================
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
};
