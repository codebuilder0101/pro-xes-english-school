import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Star, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import heroPanelLifestyle from "@/assets/hero-panel-lifestyle.jpg";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-bold mb-6">
              <Star className="w-4 h-4 fill-current" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              {t("hero.title.1")}{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                {t("hero.title.highlight")}
              </span>{" "}
              {t("hero.title.2")}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button variant="hero" size="lg" className="h-14 px-8 text-base" asChild>
                <Link to="/auth/sign-up">{t("hero.cta")}</Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="h-14 px-8">
                <Play className="w-5 h-5 fill-current" />
                {t("hero.cta2")}
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background gradient-hero" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">2.500+</span> {t("hero.social")}
                </p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in group" style={{ animationDelay: "0.3s" }}>
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-muted shadow-elevated ring-1 ring-black/5 min-h-[300px] md:min-h-[380px] lg:min-h-[420px]">
              <img
                src={heroPanelLifestyle}
                alt={t("hero.panel.imageAlt")}
                width={1600}
                height={1067}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              {/* Darken top-left (sky) and bottom edge so white copy stays readable; photo unchanged underneath */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/82 via-black/30 via-50% to-black/75"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(95%_65%_at_0%_0%,rgba(0,0,0,0.55),transparent_58%)]"
                aria-hidden
              />
              <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(16,185,129,0.18),transparent_55%)]" aria-hidden />
              <div className="relative z-10 flex min-h-[300px] md:min-h-[380px] lg:min-h-[420px] flex-col items-start justify-start text-left p-7 pt-8 md:p-10 md:pt-10 text-white">
                <p className="mb-3 inline-flex max-w-fit items-center rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-md shadow-sm sm:text-[11px] [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                  {t("hero.panel.locations")}
                </p>
                <h2 className="max-w-[min(100%,12rem)] text-xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)] md:max-w-md md:text-xl lg:text-[1.5rem]">
                  {t("hero.panel.title")}
                </h2>
                <p className="mt-4 max-w-md text-base font-black leading-snug text-white md:mt-5 md:text-lg lg:text-xl [text-shadow:0_2px_18px_rgba(0,0,0,0.8)]">
                  {t("hero.panel.slogan.before1")}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-elevated p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-foreground">150+</p>
                  <p className="text-xs text-muted-foreground">{t("hero.tutorsOnline")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
