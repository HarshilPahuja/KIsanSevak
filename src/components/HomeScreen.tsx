import { Bell } from "lucide-react";
import AlertCard from "./AlertCard";
import WeatherReport from "./WeatherReport";
import MarketPricesSection from "./MarketPricesSection";
import LanguageToggle from "./LanguageToggle";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";
import { useLanguage } from "@/contexts/LanguageContext";

interface HomeScreenProps {
  farmerName: string;
}

const HomeScreen = ({ farmerName }: HomeScreenProps) => {
  // Get top 2 severe weather alerts
  const { topAlerts } = useWeatherAlerts();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card px-6 py-6 border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold text-foreground">{t('app.name')}</h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Bell className="w-6 h-6 text-foreground" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('home.greeting')}, {farmerName}!</h2>
          <p className="text-sm text-muted-foreground">{t('home.subtitle')}</p>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Weather Report */}
        <WeatherReport className="mb-6" />

        {/* Market Prices */}
        <MarketPricesSection className="mb-6" />

        {/* Weather Alerts */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('home.weather.alerts')}</h3>
          <div className="space-y-4">
            {topAlerts.length > 0 ? (
              topAlerts.map((alert) => (
                <AlertCard 
                  key={alert.id} 
                  title={alert.title}
                  description={alert.description}
                  severity={alert.severity}
                  icon={alert.icon}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-muted-foreground">
                  {t('home.no.alerts')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
