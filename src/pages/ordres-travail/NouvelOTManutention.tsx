import { OrdreTravailForm } from "@/components/ordres-travail/OrdreTravailForm";

export default function NouvelOTManutention() {
  return (
    <OrdreTravailForm
      type="Manutention"
      title="Nouvel ordre de manutention"
      subtitle="Créez un ordre de travail pour une prestation de manutention (chargement, déchargement, empotage, dépotage)"
      showTransportSection={false}
      backPath="/ordres-travail/manutention"
    />
  );
}
