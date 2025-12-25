import { useState, useEffect } from "react";
import { toast } from "sonner";
import { clientsService, type Client } from "@/services/api";
import { taxesService, type TaxAPI } from "@/services/api/taxes.service";

export function useOrdreTravailData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [taxes, setTaxes] = useState<TaxAPI[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(true);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        const response = await clientsService.getAll({ per_page: 100 });
        setClients(response.data || []);
      } catch (error) {
        console.error("Erreur chargement clients:", error);
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Fetch taxes
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        setIsLoadingTaxes(true);
        const taxesList = await taxesService.getAll();
        const activeTaxes = taxesList.filter(t => t.is_active);
        setTaxes(activeTaxes);
      } catch (error) {
        console.error("Erreur chargement taxes:", error);
      } finally {
        setIsLoadingTaxes(false);
      }
    };
    fetchTaxes();
  }, []);

  // Get default tax IDs
  const getDefaultTaxIds = () => {
    return taxes.filter(t => t.is_default).map(t => t.id);
  };

  return {
    clients,
    taxes,
    isLoadingClients,
    isLoadingTaxes,
    getDefaultTaxIds,
  };
}
