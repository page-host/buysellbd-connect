import { Search, Facebook, Youtube, Instagram, Gamepad2, ShieldCheck, Lock, Banknote, Users, ArrowRight, TrendingUp, MoreHorizontal, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { TrustBadge } from "@/components/TrustBadge";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const categories = [
    { icon: Facebook, label: t("cat.facebook_page"), count: 0, color: "#1877F2", slug: "facebook_page" },
    { icon: Instagram, label: t("cat.instagram"), count: 0, color: "#E4405F", slug: "instagram" },
    { icon: Youtube, label: t("cat.youtube_channel"), count: 0, color: "#FF0000", slug: "youtube_channel" },
    { icon: Twitter, label: t("cat.twitter"), count: 0, color: "#1DA1F2", slug: "twitter" },
    { icon: Linkedin, label: t("cat.linkedin"), count: 0, color: "#0A66C2", slug: "linkedin" },
    { icon: Gamepad2, label: t("cat.gaming_id"), count: 0, color: "#9146FF", slug: "gaming_id" },
    { icon: MoreHorizontal, label: t("cat.other"), count: 0, color: "#6B7280", slug: "other" },
  ];

  const trustFeatures = [
    { icon: Lock, title: t("trust.escrow_title"), description: t("trust.escrow_desc") },
    { icon: ShieldCheck, title: t("trust.verified_title"), description: t("trust.verified_desc") },
    { icon: Banknote, title: t("trust.payment_title"), description: t("trust.payment_desc") },
  ];

  const handleSearch = () => {
    navigate(`/marketplace${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-2xl">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-xs font-semibold mb-6 border border-primary/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t("hero.badge")}
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
              style={{ color: "hsl(0 0% 98%)" }}
            >
              {t("hero.title")}{" "}
              <span className="text-accent">{t("hero.title_highlight")}</span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg mb-8 leading-relaxed"
              style={{ color: "hsl(220 14% 75%)" }}
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t("hero.search_placeholder")}
                  className="pl-12 h-12 bg-card/10 border-border/30 text-primary-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button size="lg" className="h-12 px-8 gradient-primary text-primary-foreground border-0 rounded-xl font-semibold" onClick={handleSearch}>
                {t("hero.search_btn")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">{t("section.categories")}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{t("section.categories_sub")}</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.slug} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.4 }}>
                <Link to={`/marketplace?category=${cat.slug}`}>
                  <CategoryCard {...cat} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">{t("section.trust")}</h2>
            <p className="text-muted-foreground">{t("section.trust_sub")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {trustFeatures.map((f) => (
              <TrustBadge key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">{t("section.how")}</h2>
            <p className="text-muted-foreground">{t("section.how_sub")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "০১", title: t("how.step1_title"), desc: t("how.step1_desc") },
              { step: "০২", title: t("how.step2_title"), desc: t("how.step2_desc") },
              { step: "০৩", title: t("how.step3_title"), desc: t("how.step3_desc") },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ delay: i * 0.15, duration: 0.4 }}>
                <div className="glass-card p-6 text-center relative overflow-hidden">
                  <span className="text-6xl font-extrabold text-primary/10 absolute top-2 right-4">
                    {item.step}
                  </span>
                  <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/how-it-works">
              <Button variant="outline" className="gap-2">
                {t("how.learn_more")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "hsl(0 0% 98%)" }}>
              {t("cta.title")}
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "hsl(220 14% 70%)" }}>
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/create-listing">
                <Button size="lg" className="gradient-accent text-accent-foreground border-0 font-bold px-8 rounded-xl">
                  {t("cta.seller_btn")}
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-border/30 font-bold px-8 rounded-xl" style={{ color: "hsl(0 0% 90%)", borderColor: "hsl(220 14% 40%)" }}>
                  {t("cta.browse_btn")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
