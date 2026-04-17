import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const PricingSection = () => {
  const { t } = useLanguage();

  const plans = [
    {
      nameKey: "pricing.monthly" as const,
      price: "R$ 14",
      periodKey: "pricing.month" as const,
      features: ["pricing.f.all_scenarios", "pricing.f.ai_unlimited", "pricing.f.corrections", "pricing.f.progress", "pricing.f.chat", "pricing.f.correction_writing_pronunciation"] as const,
      popular: false,
    },
    {
      nameKey: "pricing.semester" as const,
      price: "R$ 19",
      periodKey: "pricing.month" as const,
      badgeKey: "pricing.popular" as const,
      features: [
        "pricing.f.everything_monthly",
        "pricing.f.priority",
        "pricing.f.articles",
        "pricing.f.correction_writing_pronunciation",
        "pricing.f.semester_free_tutor_30",
        "pricing.f.save35",
      ] as const,
      popular: true,
    },
    {
      nameKey: "pricing.annual" as const,
      price: "R$ 29",
      periodKey: "pricing.month" as const,
      features: [
        "pricing.f.everything_semester",
        "pricing.f.free_session",
        "pricing.f.correction_writing_pronunciation",
        "pricing.f.certificate",
        "pricing.f.early_access",
        "pricing.f.save52",
      ] as const,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-secondary font-bold text-sm mb-3 block">{t("pricing.label")}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("pricing.title")}</h2>
          <p className="text-muted-foreground">{t("pricing.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.nameKey} className={`relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${plan.popular ? "bg-card shadow-elevated border-2 border-primary scale-105" : "bg-card shadow-card border border-border"}`}>
              {plan.badgeKey && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {t(plan.badgeKey)}
                </span>
              )}
              <h3 className="text-lg font-extrabold text-foreground mb-1">{t(plan.nameKey)}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{t(plan.periodKey)}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {t(f)}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "hero" : "outline"} className="w-full">{t("pricing.cta")}</Button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">{t("pricing.footer")}</p>
      </div>
    </section>
  );
};

export default PricingSection;
