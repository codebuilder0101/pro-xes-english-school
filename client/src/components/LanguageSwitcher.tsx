import { useLanguage } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-bold uppercase">{language === "pt" ? "EN" : "PT"}</span>
    </Button>
  );
};

export default LanguageSwitcher;
