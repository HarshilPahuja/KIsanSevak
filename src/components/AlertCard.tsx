import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

interface AlertCardProps {
  title: string;
  description: string;
  severity: "urgent" | "warning" | "normal";
  icon: string;
}

const AlertCard = ({ title, description, severity, icon }: AlertCardProps) => {
  const severityStyles = {
    urgent: "border-l-4 border-l-destructive bg-destructive/10",
    warning: "border-l-4 border-l-warning bg-warning/10",
    normal: "border-l-4 border-l-primary bg-primary/10",
  };

  const severityLabels = {
    urgent: "URGENT",
    warning: "WARNING",
    normal: "INFO",
  };

  const severityColors = {
    urgent: "text-destructive",
    warning: "text-warning",
    normal: "text-primary",
  };

  return (
    <Card className={cn("p-4", severityStyles[severity])}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-bold", severityColors[severity])}>
              {severityLabels[severity]}
            </span>
          </div>
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default AlertCard;
