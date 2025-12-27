import { OrdreTravailForm } from "@/components/ordres-travail/OrdreTravailForm";

export default function NouvelOTStockage() {
  return (
    <OrdreTravailForm
      type="Stockage"
      title="Nouvel ordre de stockage"
      subtitle="Créez un ordre de travail pour une prestation de stockage (entrepôt, plein air, frigorifique)"
      showTransportSection={false}
      backPath="/ordres-travail/stockage"
    />
  );
}
