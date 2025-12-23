import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  FileText,
  Clipboard,
  Receipt,
  Building2,
  X,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

// Mock data - à remplacer par les vraies données
const mockClients = [
  { id: "1", name: "TOTAL Gabon", type: "client" },
  { id: "2", name: "COMILOG", type: "client" },
  { id: "3", name: "Société Générale Gabon", type: "client" },
  { id: "4", name: "Olam Gabon", type: "client" },
  { id: "5", name: "Assala Energy", type: "client" },
];

const mockFactures = [
  { id: "1", reference: "FAC-2024-001", client: "TOTAL Gabon", montant: 5500000, type: "facture" },
  { id: "2", reference: "FAC-2024-002", client: "COMILOG", montant: 3200000, type: "facture" },
  { id: "3", reference: "FAC-2024-003", client: "Olam Gabon", montant: 1850000, type: "facture" },
];

const mockOrdres = [
  { id: "1", reference: "OT-2024-001", client: "TOTAL Gabon", description: "Transport conteneurs", type: "ordre" },
  { id: "2", reference: "OT-2024-002", client: "COMILOG", description: "Livraison matériaux", type: "ordre" },
  { id: "3", reference: "OT-2024-003", client: "Assala Energy", description: "Manutention équipements", type: "ordre" },
];

const mockDevis = [
  { id: "1", reference: "DEV-2024-001", client: "Société Générale Gabon", montant: 2500000, type: "devis" },
  { id: "2", reference: "DEV-2024-002", client: "TOTAL Gabon", montant: 4800000, type: "devis" },
];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Filtrer les résultats
  const filteredClients = mockClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFactures = mockFactures.filter(
    (f) =>
      f.reference.toLowerCase().includes(search.toLowerCase()) ||
      f.client.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrdres = mockOrdres.filter(
    (o) =>
      o.reference.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDevis = mockDevis.filter(
    (d) =>
      d.reference.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults =
    filteredClients.length > 0 ||
    filteredFactures.length > 0 ||
    filteredOrdres.length > 0 ||
    filteredDevis.length > 0;

  // Raccourci clavier global
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = useCallback(
    (type: string, id: string) => {
      onOpenChange(false);
      setSearch("");
      switch (type) {
        case "client":
          navigate(`/clients?id=${id}`);
          break;
        case "facture":
          navigate(`/factures?id=${id}`);
          break;
        case "ordre":
          navigate(`/ordres-travail?id=${id}`);
          break;
        case "devis":
          navigate(`/devis?id=${id}`);
          break;
      }
    },
    [navigate, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher clients, factures, ordres..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

        {filteredClients.length > 0 && (
          <CommandGroup heading="Clients">
            {filteredClients.slice(0, 5).map((client) => (
              <CommandItem
                key={`client-${client.id}`}
                value={`client-${client.name}`}
                onSelect={() => handleSelect("client", client.id)}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span>{client.name}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  Client
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredFactures.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Factures">
              {filteredFactures.slice(0, 5).map((facture) => (
                <CommandItem
                  key={`facture-${facture.id}`}
                  value={`facture-${facture.reference}-${facture.client}`}
                  onSelect={() => handleSelect("facture", facture.id)}
                  className="cursor-pointer"
                >
                  <Receipt className="mr-2 h-4 w-4 text-success" />
                  <div className="flex flex-col">
                    <span className="font-mono">{facture.reference}</span>
                    <span className="text-xs text-muted-foreground">
                      {facture.client}
                    </span>
                  </div>
                  <span className="ml-auto text-sm font-medium">
                    {formatCurrency(facture.montant)} FCFA
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredOrdres.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Ordres de travail">
              {filteredOrdres.slice(0, 5).map((ordre) => (
                <CommandItem
                  key={`ordre-${ordre.id}`}
                  value={`ordre-${ordre.reference}-${ordre.client}-${ordre.description}`}
                  onSelect={() => handleSelect("ordre", ordre.id)}
                  className="cursor-pointer"
                >
                  <Clipboard className="mr-2 h-4 w-4 text-warning" />
                  <div className="flex flex-col">
                    <span className="font-mono">{ordre.reference}</span>
                    <span className="text-xs text-muted-foreground">
                      {ordre.client} - {ordre.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredDevis.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Devis">
              {filteredDevis.slice(0, 5).map((devis) => (
                <CommandItem
                  key={`devis-${devis.id}`}
                  value={`devis-${devis.reference}-${devis.client}`}
                  onSelect={() => handleSelect("devis", devis.id)}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-mono">{devis.reference}</span>
                    <span className="text-xs text-muted-foreground">
                      {devis.client}
                    </span>
                  </div>
                  <span className="ml-auto text-sm font-medium">
                    {formatCurrency(devis.montant)} FCFA
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Navigation rapide">
              <CommandItem
                onSelect={() => {
                  onOpenChange(false);
                  navigate("/clients");
                }}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Voir tous les clients</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  onOpenChange(false);
                  navigate("/factures");
                }}
                className="cursor-pointer"
              >
                <Receipt className="mr-2 h-4 w-4" />
                <span>Voir toutes les factures</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  onOpenChange(false);
                  navigate("/ordres-travail");
                }}
                className="cursor-pointer"
              >
                <Clipboard className="mr-2 h-4 w-4" />
                <span>Voir tous les ordres de travail</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  onOpenChange(false);
                  navigate("/devis");
                }}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Voir tous les devis</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
