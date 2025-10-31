import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface SchemesScreenProps {
  onBack: () => void;
}

const SchemesScreen = ({ onBack }: SchemesScreenProps) => {
  const { t, language } = useLanguage();
  // Mapping: scheme key -> [eligibilityURL, applyURL]
  const schemeLinks: Record<string, [string, string]> = {
    'pm.kisan': [
      'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx',
      'https://pmkisan.gov.in/RegistrationFormupdated.aspx',
    ],
    'rythu.bandhu': [
      'https://rythubharosa.telangana.gov.in/gos_circulars.aspx',
      'https://rythubharosa.telangana.gov.in/Forms.aspx',
    ],
    'pmfby': [
      'https://pmfby.gov.in/guidelines',
      'https://pmfby.gov.in/farmerLogin',
    ],
  };

  const schemes = [
    {
      id: 1,
      key: 'pm.kisan' as const,
      titleKey: 'schemes.pm.kisan',
      descKey: 'schemes.pm.kisan.desc',
      launchedYear: 2019,
      icon: "🌾",
    },
    {
      id: 2,
      key: 'rythu.bandhu' as const,
      titleKey: 'schemes.rythu.bandhu',
      descKey: 'schemes.rythu.bandhu.desc',
      launchedYear: 2018,
      icon: "💰",
    },
    {
      id: 3,
      key: 'pmfby' as const,
      titleKey: 'schemes.crop.insurance',
      descKey: 'schemes.crop.insurance.desc',
      launchedYear: 2016,
      icon: "🛡️",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card px-6 py-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('nav.schemes')}</h1>
      </header>

      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('common.recent.schemes')}</h2>
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <Card key={scheme.id} className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                  {scheme.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">{t(scheme.titleKey)}</h3>
                  <p className="text-xs text-primary">
                    {language === 'en' 
                      ? `${t('schemes.launched.in')} ${scheme.launchedYear}`
                      : `${scheme.launchedYear} ${t('schemes.launched.in')}`
                    }
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t(scheme.descKey)}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const links = schemeLinks[scheme.key];
                    if (links?.[0]) window.open(links[0], '_blank');
                  }}
                >
                  {t('common.check.eligibility')}
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    const links = schemeLinks[scheme.key];
                    if (links?.[1]) window.open(links[1], '_blank');
                  }}
                >
                  {t('common.apply.now')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchemesScreen;
