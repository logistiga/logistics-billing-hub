import { Truck } from "lucide-react";
import { OrdresTravailList } from "@/components/ordres-travail/OrdresTravailList";

export default function OTTransport() {
  return (
    <OrdresTravailList
      type="Transport"
      title="Transport"
      icon={Truck}
    />
  );
}
