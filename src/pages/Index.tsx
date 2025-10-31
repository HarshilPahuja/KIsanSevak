import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import AlertsScreen from "@/components/AlertsScreen";
import SchemesScreen from "@/components/SchemesScreen";
import MetricsScreen from "@/components/MetricsScreen";
import ChatScreen from "@/components/ChatScreen";
import CropsScreen from "@/components/CropsScreen";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [farmerName, setFarmerName] = useState("Farmer");
  
  // Mock user crops data - in real app, this would come from the database
  const userCrops = ['rice', 'tomatoes', 'wheat'];

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen farmerName={farmerName} />;
      case "alerts":
        return <AlertsScreen onBack={() => setActiveTab("home")} />;
      case "schemes":
        return <SchemesScreen onBack={() => setActiveTab("home")} />;
      case "metrics":
        return <MetricsScreen onBack={() => setActiveTab("home")} farmerName={farmerName} />;
      case "chat":
        return <ChatScreen onBack={() => setActiveTab("home")} />;
      case "crops":
        return <CropsScreen onBack={() => setActiveTab("home")} onNameChange={setFarmerName} currentName={farmerName} />;
      default:
        return <HomeScreen farmerName={farmerName} />;
    }
  };

  return (
    <div className="max-w-lg mx-auto relative">
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
