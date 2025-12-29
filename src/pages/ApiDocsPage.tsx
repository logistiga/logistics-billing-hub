import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, FileCode, Zap, Database, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const endpoints = [
  { method: "GET", path: "/api/external/health", desc: "Vérifier la connexion", perm: "-" },
  { method: "GET", path: "/api/external/stats", desc: "Statistiques globales", perm: "-" },
  { method: "GET", path: "/api/external/clients", desc: "Liste des clients", perm: "clients:read" },
  { method: "GET", path: "/api/external/clients/{id}", desc: "Détails d'un client", perm: "clients:read" },
  { method: "POST", path: "/api/external/clients", desc: "Créer un client", perm: "clients:write" },
  { method: "PUT", path: "/api/external/clients/{id}", desc: "Modifier un client", perm: "clients:write" },
  { method: "GET", path: "/api/external/ordres-travail", desc: "Liste des OT", perm: "ordres:read" },
  { method: "GET", path: "/api/external/ordres-travail/{id}", desc: "Détails d'un OT", perm: "ordres:read" },
  { method: "POST", path: "/api/external/ordres-travail", desc: "Créer un OT", perm: "ordres:write" },
  { method: "PUT", path: "/api/external/ordres-travail/{id}", desc: "Modifier un OT", perm: "ordres:write" },
  { method: "PUT", path: "/api/external/ordres-travail/{id}/status", desc: "Changer le statut", perm: "ordres:status" },
  { method: "GET", path: "/api/external/invoices", desc: "Liste des factures", perm: "invoices:read" },
  { method: "GET", path: "/api/external/invoices/{id}", desc: "Détails d'une facture", perm: "invoices:read" },
];

const ApiDocsPage = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const baseUrl = window.location.origin.includes("lovableproject") 
    ? window.location.origin.replace("lovableproject.com", "lovable.app") 
    : import.meta.env.VITE_API_URL || "http://localhost:8000";

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: "Copié!" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const lovablePrompt = `# Intégration API - Application de Gestion Logistique

## Contexte
Je veux intégrer mon application avec une API externe de gestion logistique (ordres de travail, clients, factures).
L'API utilise une clé API pour l'authentification via l'en-tête X-API-Key.

## URL de base de l'API
${baseUrl}

## Fichiers à créer

### 1. Service API Principal (src/services/logistique-api.service.ts)

\`\`\`typescript
// Configuration et client API pour l'intégration logistique
const API_BASE_URL = "${baseUrl}/api/external";

// La clé API doit être stockée dans les secrets Lovable Cloud
// Ajouter LOGISTIQUE_API_KEY dans les secrets

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class LogistiqueApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = \`\${API_BASE_URL}\${endpoint}\`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Erreur API");
    }
    
    return data;
  }

  // === HEALTH CHECK ===
  async checkHealth() {
    return this.request("/health");
  }

  async getStats() {
    return this.request("/stats");
  }

  // === CLIENTS ===
  async getClients(params?: { search?: string; page?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(\`/clients?\${query}\`);
  }

  async getClient(id: number) {
    return this.request(\`/clients/\${id}\`);
  }

  async createClient(data: {
    nom: string;
    email?: string;
    telephone?: string;
    adresse?: string;
  }) {
    return this.request("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: number, data: Partial<{
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
  }>) {
    return this.request(\`/clients/\${id}\`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // === ORDRES DE TRAVAIL ===
  async getOrdresTravail(params?: {
    status?: string;
    client_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(\`/ordres-travail?\${query}\`);
  }

  async getOrdreTravail(id: number) {
    return this.request(\`/ordres-travail/\${id}\`);
  }

  async createOrdreTravail(data: {
    client_id: number;
    date: string;
    type: string;
    reference?: string;
    booking_number?: string;
    vessel_name?: string;
    containers?: Array<{ number: string; type: string }>;
    lignes_prestations?: Array<{
      description: string;
      quantite: number;
      prix_unitaire: number;
    }>;
  }) {
    return this.request("/ordres-travail", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrdreTravail(id: number, data: Partial<{
    date: string;
    type: string;
    reference: string;
    booking_number: string;
    vessel_name: string;
  }>) {
    return this.request(\`/ordres-travail/\${id}\`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateOrdreTravailStatus(id: number, status: string, notes?: string) {
    return this.request(\`/ordres-travail/\${id}/status\`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    });
  }

  // === FACTURES ===
  async getInvoices(params?: {
    status?: string;
    client_id?: number;
    page?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(\`/invoices?\${query}\`);
  }

  async getInvoice(id: number) {
    return this.request(\`/invoices/\${id}\`);
  }
}

export const createLogistiqueApi = (apiKey: string) => new LogistiqueApiService(apiKey);
\`\`\`

### 2. Hook React pour l'API (src/hooks/useLogistiqueApi.ts)

\`\`\`typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createLogistiqueApi } from "@/services/logistique-api.service";

// Remplacer par votre clé API depuis les secrets
const API_KEY = import.meta.env.VITE_LOGISTIQUE_API_KEY || "";

const api = createLogistiqueApi(API_KEY);

// Hook pour les clients
export const useClients = (params?: { search?: string; page?: number }) => {
  return useQuery({
    queryKey: ["logistique", "clients", params],
    queryFn: () => api.getClients(params),
  });
};

export const useClient = (id: number) => {
  return useQuery({
    queryKey: ["logistique", "client", id],
    queryFn: () => api.getClient(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createClient.bind(api),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistique", "clients"] });
    },
  });
};

// Hook pour les ordres de travail
export const useOrdresTravail = (params?: {
  status?: string;
  client_id?: number;
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery({
    queryKey: ["logistique", "ordres-travail", params],
    queryFn: () => api.getOrdresTravail(params),
  });
};

export const useOrdreTravail = (id: number) => {
  return useQuery({
    queryKey: ["logistique", "ordre-travail", id],
    queryFn: () => api.getOrdreTravail(id),
    enabled: !!id,
  });
};

export const useCreateOrdreTravail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createOrdreTravail.bind(api),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistique", "ordres-travail"] });
    },
  });
};

export const useUpdateOrdreTravailStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      api.updateOrdreTravailStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistique", "ordres-travail"] });
    },
  });
};

// Hook pour les factures
export const useInvoices = (params?: { status?: string; client_id?: number }) => {
  return useQuery({
    queryKey: ["logistique", "invoices", params],
    queryFn: () => api.getInvoices(params),
  });
};

export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: ["logistique", "invoice", id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  });
};

// Hook pour vérifier la connexion
export const useApiHealth = () => {
  return useQuery({
    queryKey: ["logistique", "health"],
    queryFn: () => api.checkHealth(),
    refetchInterval: 60000, // Vérifier toutes les minutes
  });
};
\`\`\`

### 3. Types TypeScript (src/types/logistique.types.ts)

\`\`\`typescript
export interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  created_at: string;
  updated_at: string;
}

export interface Container {
  id: number;
  number: string;
  type: string; // 20GP, 40GP, 40HC, etc.
}

export interface LignePrestation {
  id: number;
  description: string;
  quantite: number;
  prix_unitaire: number;
  montant: number;
}

export interface OrdreTravail {
  id: number;
  numero: string;
  client_id: number;
  client?: Client;
  date: string;
  type: string;
  status: "brouillon" | "en_cours" | "termine" | "facture";
  reference?: string;
  booking_number?: string;
  vessel_name?: string;
  containers: Container[];
  lignes_prestations: LignePrestation[];
  montant_total: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  numero: string;
  client_id: number;
  client?: Client;
  ordre_travail_id?: number;
  ordre_travail?: OrdreTravail;
  date_emission: string;
  date_echeance: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  status: "brouillon" | "envoyee" | "payee" | "annulee";
  created_at: string;
  updated_at: string;
}

export interface ApiStats {
  clients_count: number;
  ordres_travail_count: number;
  ordres_en_cours: number;
  invoices_count: number;
  chiffre_affaires_mois: number;
}
\`\`\`

### 4. Composant de statut de connexion (src/components/LogistiqueApiStatus.tsx)

\`\`\`typescript
import { useApiHealth } from "@/hooks/useLogistiqueApi";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export const LogistiqueApiStatus = () => {
  const { data, isLoading, isError } = useApiHealth();

  if (isLoading) {
    return <Badge variant="outline">Connexion...</Badge>;
  }

  if (isError || !data?.success) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        Déconnecté
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="flex items-center gap-1 bg-green-500">
      <Wifi className="h-3 w-3" />
      Connecté
    </Badge>
  );
};
\`\`\`

## Configuration requise

1. **Ajouter la clé API dans les variables d'environnement** :
   - Aller dans les paramètres du projet
   - Ajouter \`VITE_LOGISTIQUE_API_KEY\` avec la valeur de la clé API

2. **S'assurer que TanStack Query est configuré** (déjà inclus dans Lovable)

## Exemple d'utilisation

\`\`\`typescript
import { useOrdresTravail, useCreateOrdreTravail } from "@/hooks/useLogistiqueApi";
import { LogistiqueApiStatus } from "@/components/LogistiqueApiStatus";

const MaPage = () => {
  const { data: ordres, isLoading } = useOrdresTravail({ status: "en_cours" });
  const createOT = useCreateOrdreTravail();

  const handleCreate = async () => {
    await createOT.mutateAsync({
      client_id: 1,
      date: "2025-01-15",
      type: "Transport",
      containers: [{ number: "MSCU1234567", type: "20GP" }],
      lignes_prestations: [
        { description: "Transport", quantite: 1, prix_unitaire: 150000 }
      ]
    });
  };

  return (
    <div>
      <LogistiqueApiStatus />
      {/* Votre interface */}
    </div>
  );
};
\`\`\``;

  const copyFullPrompt = () => {
    navigator.clipboard.writeText(lovablePrompt);
    toast({ 
      title: "Prompt copié!",
      description: "Collez ce texte dans l'autre application Lovable"
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Documentation API</h1>
        <p className="text-muted-foreground mt-1">Guide d'intégration de l'API externe</p>
      </div>

      <Tabs defaultValue="lovable" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lovable" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Pour Lovable
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Exemples
          </TabsTrigger>
        </TabsList>

        {/* TAB: Instructions pour Lovable */}
        <TabsContent value="lovable" className="space-y-4">
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Instructions pour l'autre application Lovable
              </CardTitle>
              <CardDescription>
                Copiez ce prompt et collez-le dans l'autre application Lovable pour créer automatiquement tous les fichiers d'intégration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Étapes à suivre :</p>
                  <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                    <li>Cliquez sur "Copier le prompt complet"</li>
                    <li>Ouvrez l'autre application Lovable</li>
                    <li>Collez le prompt dans le chat</li>
                    <li>Lovable créera automatiquement tous les fichiers</li>
                    <li>Ajoutez la clé API dans les secrets du projet</li>
                  </ol>
                </div>
                <Button onClick={copyFullPrompt} size="lg" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copier le prompt complet
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Fichiers qui seront créés :</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <FileCode className="h-4 w-4 text-blue-500" />
                    <code className="text-sm">src/services/logistique-api.service.ts</code>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <FileCode className="h-4 w-4 text-green-500" />
                    <code className="text-sm">src/hooks/useLogistiqueApi.ts</code>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <FileCode className="h-4 w-4 text-purple-500" />
                    <code className="text-sm">src/types/logistique.types.ts</code>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <FileCode className="h-4 w-4 text-orange-500" />
                    <code className="text-sm">src/components/LogistiqueApiStatus.tsx</code>
                  </div>
                </div>
              </div>

              <Separator />

              <ScrollArea className="h-[400px] rounded-lg border">
                <pre className="p-4 text-xs whitespace-pre-wrap font-mono">
                  {lovablePrompt}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Endpoints */}
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentification
              </CardTitle>
              <CardDescription>Toutes les requêtes nécessitent une clé API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Ajoutez l'en-tête <code className="bg-muted px-1 rounded">X-API-Key</code> à chaque requête :</p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "${baseUrl}/api/external/health" \\
  -H "X-API-Key: sk_live_votre_cle_api" \\
  -H "Content-Type: application/json"`}
                </pre>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute top-2 right-2"
                  onClick={() => copyCode(`curl -X GET "${baseUrl}/api/external/health" -H "X-API-Key: sk_live_votre_cle_api" -H "Content-Type: application/json"`, "auth")}
                >
                  {copiedCode === "auth" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endpoints disponibles</CardTitle>
              <CardDescription>URL de base: <code>{baseUrl}</code></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {endpoints.map((ep, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                    <Badge 
                      variant={ep.method === "GET" ? "secondary" : ep.method === "POST" ? "default" : "outline"} 
                      className="w-16 justify-center font-mono"
                    >
                      {ep.method}
                    </Badge>
                    <code className="text-sm flex-1 font-mono">{ep.path}</code>
                    <span className="text-sm text-muted-foreground hidden md:block">{ep.desc}</span>
                    <Badge variant="outline" className="text-xs">{ep.perm}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Exemples */}
        <TabsContent value="examples" className="space-y-4">
          <Tabs defaultValue="js">
            <TabsList>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            <TabsContent value="js" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Créer un Ordre de Travail</CardTitle></CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`const response = await fetch("${baseUrl}/api/external/ordres-travail", {
  method: "POST",
  headers: {
    "X-API-Key": "sk_live_votre_cle",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    client_id: 1,
    date: "2025-01-15",
    type: "Transport",
    reference: "REF-001",
    booking_number: "BK123456",
    vessel_name: "MSC MARINA",
    containers: [
      { number: "MSCU1234567", type: "20GP" }
    ],
    lignes_prestations: [
      { description: "Transport conteneur", quantite: 1, prix_unitaire: 150000 }
    ]
  })
});
const data = await response.json();`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Mettre à jour le statut d'un OT</CardTitle></CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`const response = await fetch("${baseUrl}/api/external/ordres-travail/123/status", {
  method: "PUT",
  headers: {
    "X-API-Key": "sk_live_votre_cle",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    status: "termine",
    notes: "Livraison effectuée avec succès"
  })
});`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curl" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Lister les clients</CardTitle></CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "${baseUrl}/api/external/clients?search=dupont" \\
  -H "X-API-Key: sk_live_votre_cle" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Créer un client</CardTitle></CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST "${baseUrl}/api/external/clients" \\
  -H "X-API-Key: sk_live_votre_cle" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nom": "Entreprise XYZ",
    "email": "contact@xyz.com",
    "telephone": "+225 07 00 00 00",
    "adresse": "Abidjan, Zone Industrielle"
  }'`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocsPage;
