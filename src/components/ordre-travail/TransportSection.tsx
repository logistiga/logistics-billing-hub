import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { partenaireStore } from "@/lib/partenaireStore";
import { TransportData, transportSubTypes } from "./types";

interface TransportSectionProps {
  data: TransportData;
  onChange: (field: keyof TransportData, value: string | number) => void;
}

export function TransportSection({ data, onChange }: TransportSectionProps) {
  const compagniesMaritimes = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getCompagnies,
    partenaireStore.getCompagnies
  );
  const transitairesList = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getTransitaires,
    partenaireStore.getTransitaires
  );
  const representantsList = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getRepresentants,
    partenaireStore.getRepresentants
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 border rounded-lg p-4 border-amber-200 bg-amber-50/50"
    >
      {/* Type de transport */}
      <div className="space-y-2">
        <Label>Type de transport *</Label>
        <Select value={data.transportType} onValueChange={(v) => onChange("transportType", v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            {transportSubTypes.map((st) => (
              <SelectItem key={st.key} value={st.key}>{st.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trajet */}
      <div className="border rounded-lg p-4 border-border bg-background">
        <h4 className="font-medium mb-3 text-foreground">Trajet</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Point de départ (A)</Label>
            <Input 
              placeholder="Ex: Port d'Owendo" 
              value={data.pointDepart}
              onChange={(e) => onChange("pointDepart", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Point d'arrivée (B)</Label>
            <Input 
              placeholder="Ex: Port-Gentil"
              value={data.pointArrivee}
              onChange={(e) => onChange("pointArrivee", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section Import */}
      {data.transportType === "import" && (
        <div className="border rounded-lg p-4 border-blue-200 bg-blue-50">
          <h4 className="font-medium mb-3 text-blue-700">Import sur Libreville</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>N° Connaissement (BL) *</Label>
              <Input 
                placeholder="BL-XXXX"
                value={data.numeroConnaissement}
                onChange={(e) => onChange("numeroConnaissement", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Navire</Label>
              <Input 
                placeholder="Nom du navire"
                value={data.navire}
                onChange={(e) => onChange("navire", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Compagnie Maritime *</Label>
              <Select value={data.compagnieMaritime} onValueChange={(v) => onChange("compagnieMaritime", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir une compagnie" />
                </SelectTrigger>
                <SelectContent>
                  {compagniesMaritimes.map((comp) => (
                    <SelectItem key={comp.id} value={comp.nom}>
                      {comp.nom} ({comp.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transitaire *</Label>
              <Select value={data.transitaire} onValueChange={(v) => onChange("transitaire", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir un transitaire" />
                </SelectTrigger>
                <SelectContent>
                  {transitairesList.map((trans) => (
                    <SelectItem key={trans.id} value={trans.nom}>
                      {trans.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Représentant</Label>
              <Select value={data.representant} onValueChange={(v) => onChange("representant", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir un représentant" />
                </SelectTrigger>
                <SelectContent>
                  {representantsList.map((rep) => (
                    <SelectItem key={rep.id} value={`${rep.prenom} ${rep.nom}`}>
                      {rep.prenom} {rep.nom} {rep.transitaire && `(${rep.transitaire})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prime Transitaire (FCFA)</Label>
              <Input 
                type="number" 
                placeholder="0"
                value={data.primeTransitaire || ""}
                onChange={(e) => onChange("primeTransitaire", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Section Export */}
      {data.transportType === "export" && (
        <div className="border rounded-lg p-4 border-green-200 bg-green-50">
          <h4 className="font-medium mb-3 text-green-700">Export</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Destination finale *</Label>
              <Input 
                placeholder="Ex: Douala, Cameroun"
                value={data.destinationFinale}
                onChange={(e) => onChange("destinationFinale", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>N° Booking</Label>
              <Input 
                placeholder="Booking number"
                value={data.numeroBooking}
                onChange={(e) => onChange("numeroBooking", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Compagnie Maritime</Label>
              <Select value={data.compagnieMaritime} onValueChange={(v) => onChange("compagnieMaritime", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir une compagnie" />
                </SelectTrigger>
                <SelectContent>
                  {compagniesMaritimes.map((comp) => (
                    <SelectItem key={comp.id} value={comp.nom}>
                      {comp.nom} ({comp.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transitaire</Label>
              <Select value={data.transitaire} onValueChange={(v) => onChange("transitaire", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir un transitaire" />
                </SelectTrigger>
                <SelectContent>
                  {transitairesList.map((trans) => (
                    <SelectItem key={trans.id} value={trans.nom}>
                      {trans.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Section Exceptionnel */}
      {data.transportType === "exceptionnel" && (
        <div className="border rounded-lg p-4 border-amber-200 bg-amber-50">
          <h4 className="font-medium mb-3 text-amber-700">Transport Exceptionnel</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Poids total (tonnes)</Label>
              <Input 
                placeholder="0"
                value={data.poidsTotal}
                onChange={(e) => onChange("poidsTotal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Dimensions (L x l x H)</Label>
              <Input 
                placeholder="Ex: 12m x 3m x 4m"
                value={data.dimensions}
                onChange={(e) => onChange("dimensions", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type d'escorte</Label>
              <Select value={data.typeEscorte} onValueChange={(v) => onChange("typeEscorte", v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aucune">Aucune</SelectItem>
                  <SelectItem value="Véhicule pilote">Véhicule pilote</SelectItem>
                  <SelectItem value="Escorte police">Escorte police</SelectItem>
                  <SelectItem value="Escorte gendarmerie">Escorte gendarmerie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Autorisation spéciale</Label>
              <Input 
                placeholder="N° autorisation"
                value={data.autorisationSpeciale}
                onChange={(e) => onChange("autorisationSpeciale", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date d'enlèvement</Label>
          <Input 
            type="date"
            value={data.dateEnlevement}
            onChange={(e) => onChange("dateEnlevement", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Date de livraison prévue</Label>
          <Input 
            type="date"
            value={data.dateLivraison}
            onChange={(e) => onChange("dateLivraison", e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );
}
