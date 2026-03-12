import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, CreditCard, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      step: "০১",
      icon: Search,
      title: t("hiw.step1_title"),
      desc: t("hiw.step1_desc"),
      details: [t("hiw.step1_d1"), t("hiw.step1_d2"), t("hiw.step1_d3")],
    },
    {
      step: "০২",
      icon: CreditCard,
      title: t("hiw.step2_title"),
      desc: t("hiw.step2_desc"),
      details: [t("hiw.step2_d1"), t("hiw.step2_d2"), t("hiw.step2_d3")],
    },
    {
      step: "০৩",
      icon: CheckCircle2,
      title: t("hiw.step3_title"),
      desc: t("hiw.step3_desc"),
      details: [t("hiw.step3_d1"), t("hiw.step3_d2"), t("hiw.step3_d3")],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-foreground mb-3">{t("hiw.title")}</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{t("hiw.subtitle")}</p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ delay: i * 0.15, duration: 0.4 }}>
                <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                  <span className="text-7xl font-extrabold text-primary/5 absolute top-2 right-6">{item.step}</span>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                      <ul className="space-y-2">
                        {item.details.map((d) => (
                          <li key={d} className="flex items-center gap-2 text-sm text-foreground">
                            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="text-center mt-12">
            <Link to="/marketplace">
              <Button size="lg" className="gradient-primary text-primary-foreground border-0 font-bold px-8 rounded-xl gap-2">
                {t("hiw.browse_btn")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
