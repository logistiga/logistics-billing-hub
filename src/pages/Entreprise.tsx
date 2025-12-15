import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Save,
  Upload,
  Landmark,
  FileText,
  Phone,
  Mail,
  MapPin,
  Hash,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/logo.png";

export default function Entreprise() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Paramètres Entreprise
            </h1>
            <p className="text-muted-foreground mt-1">
              Configurez les informations de votre entreprise
            </p>
          </div>
          <Button variant="gradient">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="legal">Mentions légales</TabsTrigger>
            <TabsTrigger value="invoicing">Facturation</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Logo */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Logo
                  </CardTitle>
                  <CardDescription>
                    Logo affiché sur vos documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-48 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                      <img src={logo} alt="Logo" className="max-h-20 object-contain" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Changer le logo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card className="border-border/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Raison sociale</Label>
                      <Input id="companyName" defaultValue="LOGISTICA SARL" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tradeName">Nom commercial</Label>
                      <Input id="tradeName" defaultValue="Logistica" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nif">Numéro NIF</Label>
                      <Input id="nif" defaultValue="123456789GA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rccm">Numéro RCCM</Label>
                      <Input id="rccm" defaultValue="LBV/2020/B/12345" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      defaultValue="Boulevard Triomphal, Immeuble Concorde, BP 1234"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input id="city" defaultValue="Libreville" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input id="country" defaultValue="Gabon" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Mentions légales
                </CardTitle>
                <CardDescription>
                  Ces mentions apparaîtront sur vos factures et devis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="legalMention">Mentions légales</Label>
                  <Textarea
                    id="legalMention"
                    rows={4}
                    defaultValue="LOGISTICA SARL au capital de 10 000 000 FCFA - RCCM: LBV/2020/B/12345 - NIF: 123456789GA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Conditions de paiement</Label>
                  <Textarea
                    id="paymentTerms"
                    rows={3}
                    defaultValue="Paiement à 30 jours date de facture. Tout retard de paiement entraînera des pénalités de retard de 1.5% par mois."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer">Pied de page documents</Label>
                  <Textarea
                    id="footer"
                    rows={2}
                    defaultValue="Merci de votre confiance - LOGISTICA, votre partenaire logistique"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoicing" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Numérotation
                  </CardTitle>
                  <CardDescription>
                    Format de numérotation des documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Préfixe factures</Label>
                    <Input defaultValue="FAC-{YEAR}-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Préfixe devis</Label>
                    <Input defaultValue="DEV-{YEAR}-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Préfixe ordres de travail</Label>
                    <Input defaultValue="OT-{YEAR}-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prochain numéro facture</Label>
                    <Input type="number" defaultValue="143" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Landmark className="h-5 w-5" />
                    Exercice comptable
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Début exercice</Label>
                      <Select defaultValue="01">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={String(i + 1).padStart(2, "0")}>
                              {new Date(2024, i).toLocaleDateString("fr-FR", { month: "long" })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Année en cours</Label>
                      <Input defaultValue="2024" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Select defaultValue="XAF">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XAF">Franc CFA (FCFA)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dollar US ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone1">Téléphone principal</Label>
                    <Input id="phone1" defaultValue="+241 01 76 00 00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone2">Téléphone secondaire</Label>
                    <Input id="phone2" defaultValue="+241 077 00 00 00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email principal</Label>
                    <Input id="email" type="email" defaultValue="contact@logistica.ga" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailBilling">Email facturation</Label>
                    <Input id="emailBilling" type="email" defaultValue="facturation@logistica.ga" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input id="website" defaultValue="www.logistica.ga" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
