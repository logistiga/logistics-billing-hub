import { OrdreTravailForm } from "@/components/ordres-travail/OrdreTravailForm";

export default function NouvelOTTransport() {
  return (
    <OrdreTravailForm
      type="Transport"
      title="Nouvel ordre de transport"
      subtitle="Créez un ordre de travail pour une prestation de transport (import, export, vrac, etc.)"
      showTransportSection={true}
      backPath="/ordres-travail/transport"
    />
  );
}
