import { Package } from "lucide-react";
import { OrdresTravailList } from "@/components/ordres-travail/OrdresTravailList";

export default function OTLocation() {
  return (
    <OrdresTravailList
      type="Location"
      title="Location"
      icon={Package}
    />
  );
}
