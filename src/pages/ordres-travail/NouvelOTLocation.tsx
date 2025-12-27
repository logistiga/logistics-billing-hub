import { OrdreTravailForm } from "@/components/ordres-travail/OrdreTravailForm";

export default function NouvelOTLocation() {
  return (
    <OrdreTravailForm
      type="Location"
      title="Nouvel ordre de location"
      subtitle="Créez un ordre de travail pour une location d'engin, véhicule, grue ou chariot élévateur"
      showTransportSection={false}
      backPath="/ordres-travail/location"
    />
  );
}
