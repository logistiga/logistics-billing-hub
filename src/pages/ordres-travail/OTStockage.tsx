import { Warehouse } from "lucide-react";
import { OrdresTravailList } from "@/components/ordres-travail/OrdresTravailList";

export default function OTStockage() {
  return (
    <OrdresTravailList
      type="Stockage"
      title="Stockage"
      icon={Warehouse}
    />
  );
}
