import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="gradient-hero rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-accent-foreground mb-4">{t("cta.title")}</h2>
            <p className="text-lg text-accent-foreground/80 mb-8 max-w-lg mx-auto">{t("cta.subtitle")}</p>
            <Button variant="warm" size="lg" className="h-14 px-8 text-base">
              {t("cta.button")}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
