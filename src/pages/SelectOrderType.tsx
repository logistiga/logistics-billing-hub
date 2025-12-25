import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, Forklift, Warehouse, Car } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const orderTypes = [
  {
    id: "transport",
    label: "Transport",
    description: "Import, Export, Local, Exceptionnel",
    icon: Truck,
    color: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
    iconBg: "bg-amber-500",
    path: "/ordres-travail/nouveau/transport",
    available: true,
  },
  {
    id: "manutention",
    label: "Manutention",
    description: "Chargement, Déchargement, Empotage, Dépotage",
    icon: Forklift,
    color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    iconBg: "bg-blue-500",
    path: "/ordres-travail/nouveau/manutention",
    available: false, // À venir
  },
  {
    id: "stockage",
    label: "Stockage",
    description: "Entreposage, Magasinage, Gardiennage",
    icon: Warehouse,
    color: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
    iconBg: "bg-purple-500",
    path: "/ordres-travail/nouveau/stockage",
    available: false, // À venir
  },
  {
    id: "location",
    label: "Location",
    description: "Engins, Véhicules, Équipements",
    icon: Car,
    color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
    iconBg: "bg-green-500",
    path: "/ordres-travail/nouveau/location",
    available: false, // À venir
  },
];

export default function SelectOrderType() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ordres-travail")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Nouvel ordre de travail
            </h1>
            <p className="text-muted-foreground mt-1">
              Sélectionnez le type d'ordre que vous souhaitez créer
            </p>
          </div>
        </div>

        {/* Type selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orderTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${type.color} border-2 ${
                  !type.available ? "opacity-60" : ""
                }`}
                onClick={() => type.available && navigate(type.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${type.iconBg} text-white`}>
                      <type.icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{type.label}</h3>
                        {!type.available && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            Bientôt
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-80 mt-1">{type.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
