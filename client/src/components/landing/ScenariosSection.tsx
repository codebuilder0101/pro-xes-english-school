import airportImg from "@/assets/scenario-airport.jpg";
import cafeImg from "@/assets/scenario-cafe.jpg";
import shopImg from "@/assets/scenario-shop.jpg";
import hotelImg from "@/assets/scenario-hotel.jpg";
import restaurantImg from "@/assets/scenario-restaurant.jpg";
import { MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ScenariosSection = () => {
  const { t } = useLanguage();

  const scenarios = [
    { titleKey: "scenarios.airport" as const, subKey: "scenarios.airport.sub" as const, image: airportImg, phrases: 12, color: "bg-accent" },
    { titleKey: "scenarios.cafe" as const, subKey: "scenarios.cafe.sub" as const, image: cafeImg, phrases: 8, color: "bg-secondary" },
    { titleKey: "scenarios.shop" as const, subKey: "scenarios.shop.sub" as const, image: shopImg, phrases: 10, color: "bg-energy" },
    { titleKey: "scenarios.hotel" as const, subKey: "scenarios.hotel.sub" as const, image: hotelImg, phrases: 9, color: "bg-warm" },
    { titleKey: "scenarios.restaurant" as const, subKey: "scenarios.restaurant.sub" as const, image: restaurantImg, phrases: 11, color: "bg-primary" },
  ];

  return (
    <section id="scenarios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-3">
            <MapPin className="w-4 h-4" /> {t("scenarios.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("scenarios.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("scenarios.subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((s, i) => (
            <div key={s.titleKey} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 cursor-pointer" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="relative h-44 overflow-hidden">
                <img src={s.image} alt={t(s.titleKey)} loading="lazy" width={640} height={512} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-lg font-extrabold text-card">{t(s.titleKey)}</h3>
                  <p className="text-sm text-card/80">{t(s.subKey)}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>{s.phrases} {t("scenarios.dialogues")}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color} text-card`}>{t("scenarios.practice")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScenariosSection;
