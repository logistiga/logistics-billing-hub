import { ArrowLeft, FileText, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
  ordreNumero?: string;
  fromDevisNumber?: string | null;
  lastSaved?: Date | null;
  backPath?: string;
}

export function FormHeader({
  title,
  subtitle,
  ordreNumero,
  fromDevisNumber,
  lastSaved,
  backPath = "/ordres-travail",
}: FormHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {title}
          </h1>
          {ordreNumero && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {ordreNumero}
            </Badge>
          )}
          {fromDevisNumber && (
            <Badge className="bg-cyan-500/20 text-cyan-600 border-cyan-500/30">
              <FileText className="h-3 w-3 mr-1" />
              Depuis {fromDevisNumber}
            </Badge>
          )}
          {lastSaved && (
            <Badge variant="outline" className="text-muted-foreground border-muted">
              <Save className="h-3 w-3 mr-1" />
              Brouillon sauvegardé
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
