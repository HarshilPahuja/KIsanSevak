import { ArrowLeft, Send, Mic, Image as ImageIcon, FileText, BarChart, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "./ui/use-toast";
import { sendTextMessage, analyzeImage, sendMessageWithImage } from "@/lib/gemini";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatScreenProps {
  onBack: () => void;
}

interface Message {
  id: number;
  type: "user" | "assistant";
  text: string;
  image?: string;
}

const ChatScreen = ({ onBack }: ChatScreenProps) => {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "assistant",
      text: t('chat.welcome'),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + " " + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast({
          title: t('chat.voice.failed'),
          description: t('chat.voice.try.again'),
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage) return;
    if (isLoading) return;

    const newMessage: Message = {
      id: Date.now(),
      type: "user",
      text: message.trim(),
      ...(selectedImage && { image: selectedImage }),
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message.trim();
    const currentImage = selectedImage;
    setMessage("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let aiResponse: string;
      
      if (currentImage && currentMessage) {
        // Both text and image provided
        aiResponse = await sendMessageWithImage(currentMessage, currentImage);
      } else if (currentImage) {
        // Only image provided
        aiResponse = await analyzeImage(currentImage);
      } else {
        // Only text provided
        aiResponse = await sendTextMessage(currentMessage);
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: "assistant",
        text: aiResponse,
      }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: "assistant",
        text: t('chat.ai.trouble'),
      }]);
      
      toast({
        title: t('chat.ai.error'),
        description: t('chat.ai.error.desc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: t('chat.voice.not.supported'),
        description: t('chat.voice.browser.not.support'),
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card px-6 py-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{t('chat.title')}</h1>
        </div>
      </header>

      <ScrollArea className="flex-1 h-0 px-6 py-6 pb-32" ref={scrollAreaRef}>
        <div className="space-y-4">

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.type === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[80%] ${
                  msg.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                } rounded-2xl p-4`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Crop"
                    className="w-full rounded-lg mb-2 max-w-xs"
                  />
                )}
                {msg.text && <p className="text-sm">{msg.text}</p>}
              </div>
              {msg.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ml-2 flex-shrink-0">
                  <span className="text-sm">👨‍🌾</span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-card text-card-foreground rounded-2xl p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{t('chat.ai.thinking')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img src={selectedImage} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-10 w-10 ${isRecording ? 'text-destructive' : ''}`}
              onClick={toggleRecording}
            >
              <Mic className="w-5 h-5" />
            </Button>

          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('chat.placeholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-card border-border"
            />
            <Button 
              size="icon" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
