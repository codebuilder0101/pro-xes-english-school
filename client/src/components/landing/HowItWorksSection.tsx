import { UserPlus, Globe, MessageSquare, Trophy } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: UserPlus, titleKey: "how.step1.title" as const, descKey: "how.step1.desc" as const, color: "gradient-primary" },
    { icon: Globe, titleKey: "how.step2.title" as const, descKey: "how.step2.desc" as const, color: "gradient-hero" },
    { icon: MessageSquare, titleKey: "how.step3.title" as const, descKey: "how.step3.desc" as const, color: "gradient-warm" },
    { icon: Trophy, titleKey: "how.step4.title" as const, descKey: "how.step4.desc" as const, color: "gradient-primary" },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-accent font-bold text-sm mb-3 block">{t("how.label")}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("how.title")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.titleKey} className="text-center group">
              <div className="relative mb-6">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="text-lg font-extrabold text-foreground mb-2">{t(step.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
