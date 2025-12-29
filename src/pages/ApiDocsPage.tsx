import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const createOTExample = `{
  "client_id": 1,
  "date": "2025-01-15",
  "type": "Transport",
  "reference": "REF-001",
  "booking_number": "BK123456",
  "vessel_name": "MSC MARINA",
  "containers": [
    { "number": "MSCU1234567", "type": "20GP" }
  ],
  "lignes_prestations": [
    { "description": "Transport conteneur", "quantite": 1, "prix_unitaire": 150000 }
  ]
}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Documentation API</h1>
        <p className="text-muted-foreground mt-1">Guide d'intégration de l'API externe</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentification</CardTitle>
          <CardDescription>Toutes les requêtes nécessitent une clé API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">Ajoutez l'en-tête <code className="bg-muted px-1 rounded">X-API-Key</code> à chaque requête :</p>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "${baseUrl}/api/external/health" \\
  -H "X-API-Key: sk_live_votre_cle_api" \\
  -H "Content-Type: application/json"`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {endpoints.map((ep, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                <Badge variant={ep.method === "GET" ? "secondary" : ep.method === "POST" ? "default" : "outline"} className="w-16 justify-center">
                  {ep.method}
                </Badge>
                <code className="text-sm flex-1">{ep.path}</code>
                <span className="text-sm text-muted-foreground hidden md:block">{ep.desc}</span>
                <Badge variant="outline" className="text-xs">{ep.perm}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="js">
        <TabsList>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
          <TabsTrigger value="curl">cURL</TabsTrigger>
        </TabsList>
        <TabsContent value="js">
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
  body: JSON.stringify(${createOTExample})
});
const data = await response.json();`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="curl">
          <Card>
            <CardHeader><CardTitle>Créer un Ordre de Travail</CardTitle></CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST "${baseUrl}/api/external/ordres-travail" \\
  -H "X-API-Key: sk_live_votre_cle" \\
  -H "Content-Type: application/json" \\
  -d '${createOTExample}'`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocsPage;
