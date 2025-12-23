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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, FileSpreadsheet, Download, Calendar } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: "pdf" | "excel", dateDebut: string, dateFin: string) => void;
  title: string;
}

export function ExportDialog({ open, onOpenChange, onExport, title }: ExportDialogProps) {
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [periodeType, setPeriodeType] = useState("mois");
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

  const handleExport = () => {
    onExport(format, dateDebut, dateFin);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exporter {title}
          </DialogTitle>
          <DialogDescription>
            Choisissez le format et la période d'exportation
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
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
