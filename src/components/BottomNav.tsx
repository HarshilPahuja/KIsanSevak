import { Home, Bell, FileText, BarChart3, MessageSquare, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { t } = useLanguage();
  
  const navItems = [
    { id: "home", labelKey: "nav.home", icon: Home },
    { id: "alerts", labelKey: "nav.alerts", icon: Bell },
    { id: "schemes", labelKey: "nav.schemes", icon: FileText },
    { id: "metrics", labelKey: "nav.metrics", icon: BarChart3 },
    { id: "chat", labelKey: "nav.chat", icon: MessageSquare },
    { id: "crops", labelKey: "nav.crops", icon: Sprout },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
