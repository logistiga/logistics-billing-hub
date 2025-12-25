import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageLoader } from "@/components/ui/page-loader";

// Lazy loaded pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const Factures = lazy(() => import("./pages/Factures"));
const Devis = lazy(() => import("./pages/Devis"));
const Avoirs = lazy(() => import("./pages/Avoirs"));
const OrdresTravail = lazy(() => import("./pages/OrdresTravail"));
const SelectOrderType = lazy(() => import("./pages/SelectOrderType"));
const NouvelOrdreTravail = lazy(() => import("./pages/NouvelOrdreTravail"));
const EditerOrdreTravail = lazy(() => import("./pages/EditerOrdreTravail"));
const OrdresEnAttente = lazy(() => import("./pages/OrdresEnAttente"));
const NotesDebut = lazy(() => import("./pages/NotesDebut"));
const NouvelleNoteDebut = lazy(() => import("./pages/NouvelleNoteDebut"));
const NouvelleNoteOuverturePort = lazy(() => import("./pages/NouvelleNoteOuverturePort"));
const NouvelleNoteDetention = lazy(() => import("./pages/NouvelleNoteDetention"));
const NouvelleNoteReparation = lazy(() => import("./pages/NouvelleNoteReparation"));
const Entreprise = lazy(() => import("./pages/Entreprise"));
const Banques = lazy(() => import("./pages/Banques"));
const Taxes = lazy(() => import("./pages/Taxes"));
const Roles = lazy(() => import("./pages/Roles"));
const Utilisateurs = lazy(() => import("./pages/Utilisateurs"));
const Partenaires = lazy(() => import("./pages/Partenaires"));
const Caisse = lazy(() => import("./pages/Caisse"));
const SuiviBanque = lazy(() => import("./pages/SuiviBanque"));
const TableauFlux = lazy(() => import("./pages/TableauFlux"));
const ComptabiliteGenerale = lazy(() => import("./pages/ComptabiliteGenerale"));
const Rapports = lazy(() => import("./pages/Rapports"));
const CreditBancaire = lazy(() => import("./pages/CreditBancaire"));
const TresoreriePrev = lazy(() => import("./pages/TresoreriePrev"));
const Emails = lazy(() => import("./pages/Emails"));
const Profil = lazy(() => import("./pages/Profil"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy loaded order forms by type
const TransportOrderForm = lazy(() => import("./components/ordre-travail/forms/TransportOrderForm"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={
                <Suspense fallback={<PageLoader />}>
                  <Login />
                </Suspense>
              } />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <AppLayout />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:id" element={<ClientDashboard />} />
                <Route path="/factures" element={<Factures />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/avoirs" element={<Avoirs />} />
                <Route path="/ordres-travail" element={<OrdresTravail />} />
                <Route path="/ordres-travail/nouveau" element={<SelectOrderType />} />
                <Route path="/ordres-travail/nouveau/transport" element={<TransportOrderForm />} />
                <Route path="/ordres-travail/nouveau/ancien" element={<NouvelOrdreTravail />} />
                <Route path="/ordres-travail/:id/editer" element={<EditerOrdreTravail />} />
                <Route path="/ordres-en-attente" element={<OrdresEnAttente />} />
                <Route path="/notes-debut" element={<NotesDebut />} />
                <Route path="/notes-debut/nouvelle" element={<NouvelleNoteDebut />} />
                <Route path="/notes-debut/ouverture-port" element={<NouvelleNoteOuverturePort />} />
                <Route path="/notes-debut/detention" element={<NouvelleNoteDetention />} />
                <Route path="/notes-debut/reparation" element={<NouvelleNoteReparation />} />
                <Route path="/entreprise" element={<Entreprise />} />
                <Route path="/banques" element={<Banques />} />
                <Route path="/taxes" element={<Taxes />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/utilisateurs" element={<Utilisateurs />} />
                <Route path="/partenaires" element={<Partenaires />} />
                <Route path="/caisse" element={<Caisse />} />
                <Route path="/suivi-banque" element={<SuiviBanque />} />
                <Route path="/tableau-flux" element={<TableauFlux />} />
                <Route path="/comptabilite" element={<ComptabiliteGenerale />} />
                <Route path="/rapports" element={<Rapports />} />
                <Route path="/credit-bancaire" element={<CreditBancaire />} />
                <Route path="/tresorerie-prev" element={<TresoreriePrev />} />
                <Route path="/emails" element={<Emails />} />
                <Route path="/profil" element={<Profil />} />
              </Route>
              
              <Route path="*" element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
