import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import xesAvatar from "@/assets/xes-avatar.jpeg";

const FooterSection = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={xesAvatar} alt="XES" className="w-8 h-8 rounded-lg object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="text-base font-extrabold">XES</span>
                <span className="text-[10px] opacity-70">X English School</span>
              </div>
            </div>
            <p className="text-sm opacity-70">{t("footer.desc")}</p>
            <p className="text-xs opacity-50 mt-2 italic">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="font-bold mb-3">{t("footer.platform")}</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="/#scenarios" className="hover:opacity-100 transition-opacity">{t("nav.scenarios")}</a></li>
              <li><a href="/#tutors" className="hover:opacity-100 transition-opacity">{t("nav.tutors")}</a></li>
              <li><a href="/#pricing" className="hover:opacity-100 transition-opacity">{t("nav.pricing")}</a></li>
              <li><Link to="/chat" className="hover:opacity-100 transition-opacity">{t("nav.chat")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t("footer.help")}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t("footer.contact")}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t("footer.faq")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t("footer.terms")}</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">{t("footer.privacy")}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 pt-6 text-center text-sm opacity-50">
          © 2026 XES X English School. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
