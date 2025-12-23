import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDashboard from "./pages/ClientDashboard";
import Factures from "./pages/Factures";
import Devis from "./pages/Devis";
import OrdresTravail from "./pages/OrdresTravail";
import NouvelOrdreTravail from "./pages/NouvelOrdreTravail";
import NotesDebut from "./pages/NotesDebut";
import Entreprise from "./pages/Entreprise";
import Banques from "./pages/Banques";
import Taxes from "./pages/Taxes";
import Roles from "./pages/Roles";
import Utilisateurs from "./pages/Utilisateurs";
import Partenaires from "./pages/Partenaires";
import Caisse from "./pages/Caisse";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDashboard />} />
            <Route path="/factures" element={<Factures />} />
            <Route path="/devis" element={<Devis />} />
            <Route path="/ordres-travail" element={<OrdresTravail />} />
            <Route path="/ordres-travail/nouveau" element={<NouvelOrdreTravail />} />
            <Route path="/notes-debut" element={<NotesDebut />} />
            <Route path="/entreprise" element={<Entreprise />} />
            <Route path="/banques" element={<Banques />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/partenaires" element={<Partenaires />} />
            <Route path="/caisse" element={<Caisse />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
