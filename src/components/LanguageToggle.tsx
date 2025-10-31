import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-foreground hover:bg-accent"
    >
      <Languages className="w-4 h-4" />
      <span className="text-xs font-medium">
        {language === 'en' ? 'मराठी' : 'English'}
      </span>
    </Button>
  );
};

export default LanguageToggle;