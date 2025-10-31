import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";
import { Badge } from "./ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface AlertsScreenProps {
  onBack: () => void;
  location?: string;
  currentCrops?: string[];
}

const AlertsScreen = ({ onBack, location }: AlertsScreenProps) => {
  const { allAlerts, isLoading, error, refresh } = useWeatherAlerts({ location });
  const { t } = useLanguage();

  const getSeverityBadge = (severity: 'urgent' | 'warning' | 'normal') => {
    const variants = {
      urgent: { variant: 'destructive' as const, textKey: 'alerts.severity.urgent' },
      warning: { variant: 'default' as const, textKey: 'alerts.severity.warning' },
      normal: { variant: 'secondary' as const, textKey: 'alerts.severity.info' },
    };
    const config = variants[severity];
    return (
      <Badge variant={config.variant} className="text-xs">
        {t(config.textKey)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card px-6 py-4 border-b border-border flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('nav.alerts')}</h1>
        </header>
        <div className="px-6 py-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{t('home.weather.alerts')}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} className="flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            {t('common.refresh')}
          </Button>
        </div>
      </header>

      <div className="px-6 py-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{t('common.unable.load.alerts')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {allAlerts.length === 0 && !error && (
          <Alert>
            <AlertTitle>{t('common.no.active.alerts')}</AlertTitle>
            <AlertDescription>
              {t('common.no.active.alerts.desc')}
            </AlertDescription>
          </Alert>
        )}

        {allAlerts.length > 0 && (
          <Accordion type="single" collapsible className="space-y-3">
            {allAlerts.map((alert) => (
              <AccordionItem
                key={alert.id}
                value={`alert-${alert.id}`}
                className="bg-card rounded-lg border border-border"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                      {alert.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mr-2">{alert.time}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {alert.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default AlertsScreen;
