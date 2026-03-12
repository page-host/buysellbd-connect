import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/eye.png";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SAEM Logo" className="h-20 w-auto object-contain mix-blend-multiply" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.desc")}</p>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-sm mb-4">{t("footer.marketplace")}</h4>
            <ul className="space-y-2">
              {[
                { label: t("cat.facebook_page"), href: "/marketplace?category=facebook_page" },
                { label: t("cat.youtube_channel"), href: "/marketplace?category=youtube_channel" },
                { label: t("cat.instagram"), href: "/marketplace?category=instagram" },
                { label: t("cat.twitter"), href: "/marketplace?category=twitter" },
                { label: t("cat.linkedin"), href: "/marketplace?category=linkedin" },
                { label: t("cat.gaming_id"), href: "/marketplace?category=gaming_id" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-sm mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2">
              {[
                { label: t("nav.how_it_works"), href: "/how-it-works" },
                { label: t("footer.escrow"), href: "/how-it-works" },
                { label: t("footer.privacy"), href: "/contact" },
                { label: t("nav.contact"), href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground text-sm mb-4">{t("footer.payment_methods")}</h4>
            <div className="flex flex-wrap gap-2">
              {["বিকাশ", "নগদ", "রকেট", "USDT", "TRX"].map((method) => (
                <span key={method} className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
