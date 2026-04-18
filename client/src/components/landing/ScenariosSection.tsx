import airportImg from "@/assets/scenario-airport.jpg";
import cafeImg from "@/assets/scenario-cafe.jpg";
import shopImg from "@/assets/scenario-shop.jpg";
import hotelImg from "@/assets/scenario-hotel.jpg";
import restaurantImg from "@/assets/scenario-restaurant.jpg";
import businessImg from "@/assets/scenario-business.jpg";
import hospitalImg from "@/assets/scenario-hospital.jpg";
import policeImg from "@/assets/scenario-police.jpg";
import pharmacyImg from "@/assets/scenario-pharmacy.jpg";
import bankImg from "@/assets/scenario-bank.jpg";
import transportImg from "@/assets/scenario-transport.jpg";
import universityImg from "@/assets/scenario-university.jpg";
import musicImg from "@/assets/scenario-music.jpg";
import airbnbImg from "@/assets/scenario-airbnb.jpg";
import uberImg from "@/assets/scenario-uber.jpg";
import carRentalImg from "@/assets/scenario-carrental.jpg";
import touristImg from "@/assets/scenario-tourist.jpg";
import gymImg from "@/assets/scenario-gym.jpg";
import smallTalkImg from "@/assets/scenario-smalltalk.jpg";
import meetingImg from "@/assets/scenario-meeting.jpg";
import friendsImg from "@/assets/scenario-friends.jpg";
import datingImg from "@/assets/scenario-dating.jpg";
import beachImg from "@/assets/scenario-beach.jpg";
import trafficImg from "@/assets/scenario-traffic.jpg";
import churchImg from "@/assets/scenario-church.jpg";
import bbqImg from "@/assets/scenario-bbq.jpg";
import libraryImg from "@/assets/scenario-library.jpg";
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
    { titleKey: "scenarios.business" as const, subKey: "scenarios.business.sub" as const, image: businessImg, phrases: 10, color: "bg-accent" },
    { titleKey: "scenarios.hospital" as const, subKey: "scenarios.hospital.sub" as const, image: hospitalImg, phrases: 9, color: "bg-secondary" },
    { titleKey: "scenarios.police" as const, subKey: "scenarios.police.sub" as const, image: policeImg, phrases: 8, color: "bg-primary" },
    { titleKey: "scenarios.pharmacy" as const, subKey: "scenarios.pharmacy.sub" as const, image: pharmacyImg, phrases: 9, color: "bg-energy" },
    { titleKey: "scenarios.bank" as const, subKey: "scenarios.bank.sub" as const, image: bankImg, phrases: 10, color: "bg-warm" },
    { titleKey: "scenarios.transport" as const, subKey: "scenarios.transport.sub" as const, image: transportImg, phrases: 11, color: "bg-accent" },
    { titleKey: "scenarios.university" as const, subKey: "scenarios.university.sub" as const, image: universityImg, phrases: 12, color: "bg-secondary" },
    { titleKey: "scenarios.music" as const, subKey: "scenarios.music.sub" as const, image: musicImg, phrases: 8, color: "bg-energy" },
    { titleKey: "scenarios.airbnb" as const, subKey: "scenarios.airbnb.sub" as const, image: airbnbImg, phrases: 9, color: "bg-warm" },
    { titleKey: "scenarios.uber" as const, subKey: "scenarios.uber.sub" as const, image: uberImg, phrases: 8, color: "bg-primary" },
    { titleKey: "scenarios.carRental" as const, subKey: "scenarios.carRental.sub" as const, image: carRentalImg, phrases: 8, color: "bg-accent" },
    { titleKey: "scenarios.tourist" as const, subKey: "scenarios.tourist.sub" as const, image: touristImg, phrases: 10, color: "bg-secondary" },
    { titleKey: "scenarios.gym" as const, subKey: "scenarios.gym.sub" as const, image: gymImg, phrases: 8, color: "bg-energy" },
    { titleKey: "scenarios.smallTalk" as const, subKey: "scenarios.smallTalk.sub" as const, image: smallTalkImg, phrases: 12, color: "bg-warm" },
    { titleKey: "scenarios.meeting" as const, subKey: "scenarios.meeting.sub" as const, image: meetingImg, phrases: 10, color: "bg-primary" },
    { titleKey: "scenarios.friends" as const, subKey: "scenarios.friends.sub" as const, image: friendsImg, phrases: 10, color: "bg-accent" },
    { titleKey: "scenarios.dating" as const, subKey: "scenarios.dating.sub" as const, image: datingImg, phrases: 9, color: "bg-secondary" },
    { titleKey: "scenarios.beach" as const, subKey: "scenarios.beach.sub" as const, image: beachImg, phrases: 8, color: "bg-energy" },
    { titleKey: "scenarios.traffic" as const, subKey: "scenarios.traffic.sub" as const, image: trafficImg, phrases: 7, color: "bg-warm" },
    { titleKey: "scenarios.church" as const, subKey: "scenarios.church.sub" as const, image: churchImg, phrases: 7, color: "bg-primary" },
    { titleKey: "scenarios.bbq" as const, subKey: "scenarios.bbq.sub" as const, image: bbqImg, phrases: 9, color: "bg-accent" },
    { titleKey: "scenarios.library" as const, subKey: "scenarios.library.sub" as const, image: libraryImg, phrases: 8, color: "bg-secondary" },
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
