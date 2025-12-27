import { Forklift } from "lucide-react";
import { OrdresTravailList } from "@/components/ordres-travail/OrdresTravailList";

export default function OTManutention() {
  return (
    <OrdresTravailList
      type="Manutention"
      title="Manutention"
      icon={Forklift}
    />
  );
}
