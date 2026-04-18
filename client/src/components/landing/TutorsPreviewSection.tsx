import { Star, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import sarahImg from "@/assets/tutor-sarah.jpg";
import jamesImg from "@/assets/tutor-james.jpg";
import anaImg from "@/assets/tutor-ana.jpg";
import emilyImg from "@/assets/tutor-emily.jpg";
import flagUS from "@/assets/flag-us.png";
import flagGB from "@/assets/flag-gb.png";
import flagBR from "@/assets/flag-br.png";
import flagCA from "@/assets/flag-ca.png";

const tutors = [
  { name: "Sarah M.", country: "US", flag: flagUS, avatar: sarahImg, age: 28, rating: 4.9, reviews: 142, specialty: "Travel", price: "R$ 35", native: true },
  { name: "James K.", country: "GB", flag: flagGB, avatar: jamesImg, age: 34, rating: 4.8, reviews: 98, specialty: "Business", price: "R$ 40", native: true },
  { name: "Ana L.", country: "BR", flag: flagBR, avatar: anaImg, age: 26, rating: 4.7, reviews: 67, specialty: "Conversation", price: "R$ 25", native: false },
  { name: "Emily R.", country: "CA", flag: flagCA, avatar: emilyImg, age: 31, rating: 5.0, reviews: 203, specialty: "Pronunciation", price: "R$ 45", native: true },
];

const TutorsPreviewSection = () => {
  const { t } = useLanguage();

  return (
    <section id="tutors" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-primary font-bold text-sm mb-3 block">{t("tutors.label")}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t("tutors.title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("tutors.subtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.map((tu) => (
            <div key={tu.name} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={tu.avatar}
                  alt={tu.name}
                  loading="lazy"
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-foreground flex items-center gap-1.5">
                    <span className="truncate">{tu.name}</span>
                    <img
                      src={tu.flag}
                      alt={tu.country}
                      width={20}
                      height={14}
                      className="h-3.5 w-auto rounded-sm border border-border/50 shadow-sm"
                    />
                  </h4>
                  <p className="text-xs text-muted-foreground">{tu.age} {t("tutors.years")} • {tu.native ? t("tutors.native") : t("tutors.nonNative")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(tu.rating) ? "fill-secondary text-secondary" : "text-muted"}`} />
                ))}
                <span className="text-sm font-bold text-foreground ml-1">{tu.rating}</span>
                <span className="text-xs text-muted-foreground">({tu.reviews})</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {tu.specialty}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tu.price}/15min</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">{t("tutors.schedule")}</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TutorsPreviewSection;
