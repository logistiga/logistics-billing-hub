import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, FileSpreadsheet, Download, Calendar, Building, Landmark } from "lucide-react";

interface Banque {
  id: string;
  nom: string;
  compte: string;
}

interface ExportBanqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: "pdf" | "excel", dateDebut: string, dateFin: string, banques: string[]) => void;
  banques: Banque[];
  title: string;
}

export function ExportBanqueDialog({ 
  open, 
  onOpenChange, 
  onExport, 
  banques,
  title 
}: ExportBanqueDialogProps) {
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [periodeType, setPeriodeType] = useState("mois");
  const [selectedBanques, setSelectedBanques] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [dateDebut, setDateDebut] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [dateFin, setDateFin] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const handlePeriodeChange = (value: string) => {
    setPeriodeType(value);
    const today = new Date();
    let start = new Date();
    
    switch (value) {
      case "jour":
        start = today;
        break;
      case "semaine":
        start.setDate(today.getDate() - 7);
        break;
      case "mois":
        start.setDate(1);
        break;
      case "trimestre":
        start.setMonth(today.getMonth() - 3);
        start.setDate(1);
        break;
      case "annee":
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case "personnalise":
        return;
    }
    
    setDateDebut(start.toISOString().split("T")[0]);
    setDateFin(today.toISOString().split("T")[0]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedBanques([]);
    }
  };

  const handleBanqueToggle = (banqueId: string) => {
    setSelectAll(false);
    setSelectedBanques((prev) =>
      prev.includes(banqueId)
        ? prev.filter((id) => id !== banqueId)
        : [...prev, banqueId]
    );
  };

  const handleExport = () => {
    const banquesToExport = selectAll 
      ? banques.map((b) => b.id) 
      : selectedBanques;
    
    if (banquesToExport.length === 0) {
      return; // Au moins une banque doit être sélectionnée
    }
    
    onExport(format, dateDebut, dateFin, banquesToExport);
    onOpenChange(false);
  };

  const isValid = selectAll || selectedBanques.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exporter {title}
          </DialogTitle>
          <DialogDescription>
            Choisissez le format, la période et les banques à exporter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format d'export</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as "pdf" | "excel")}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="pdf" id="pdf" className="peer sr-only" />
                <Label
                  htmlFor="pdf"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileText className="mb-2 h-6 w-6 text-destructive" />
                  <span className="font-medium">PDF</span>
                  <span className="text-xs text-muted-foreground">Document formaté</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="excel" id="excel" className="peer sr-only" />
                <Label
                  htmlFor="excel"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileSpreadsheet className="mb-2 h-6 w-6 text-emerald-500" />
                  <span className="font-medium">Excel</span>
                  <span className="text-xs text-muted-foreground">Tableur (.xlsx)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Bank selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Banques à exporter
            </Label>
            <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-banks"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  htmlFor="all-banks"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Building className="h-4 w-4 text-primary" />
                  Toutes les banques (export global)
                </Label>
              </div>
              
              <div className="h-px bg-border my-2" />
              
              {banques.map((banque) => (
                <div key={banque.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bank-${banque.id}`}
                    checked={!selectAll && selectedBanques.includes(banque.id)}
                    onCheckedChange={() => handleBanqueToggle(banque.id)}
                    disabled={selectAll}
                  />
                  <Label
                    htmlFor={`bank-${banque.id}`}
                    className={`text-sm leading-none flex flex-col ${selectAll ? "opacity-50" : ""}`}
                  >
                    <span className="font-medium">{banque.nom}</span>
                    <span className="text-xs text-muted-foreground font-mono">{banque.compte}</span>
                  </Label>
                </div>
              ))}
            </div>
            {!isValid && (
              <p className="text-xs text-destructive">Veuillez sélectionner au moins une banque</p>
            )}
          </div>

          {/* Period selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Période</Label>
            <Select value={periodeType} onValueChange={handlePeriodeChange}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jour">Aujourd'hui</SelectItem>
                <SelectItem value="semaine">7 derniers jours</SelectItem>
                <SelectItem value="mois">Ce mois</SelectItem>
                <SelectItem value="trimestre">Ce trimestre</SelectItem>
                <SelectItem value="annee">Cette année</SelectItem>
                <SelectItem value="personnalise">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date début</Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => {
                  setDateDebut(e.target.value);
                  setPeriodeType("personnalise");
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date fin</Label>
              <Input
                id="dateFin"
                type="date"
                value={dateFin}
                onChange={(e) => {
                  setDateFin(e.target.value);
                  setPeriodeType("personnalise");
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleExport} className="gap-2" disabled={!isValid}>
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
