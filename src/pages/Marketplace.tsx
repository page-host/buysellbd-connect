import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Facebook, Youtube, Instagram, Gamepad2, SlidersHorizontal, MoreHorizontal, PackageX, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const Marketplace = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { t } = useLanguage();

  const categoryMeta: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    facebook_page: { icon: <Facebook className="w-5 h-5" />, label: t("cat.facebook_page"), color: "#1877F2" },
    youtube_channel: { icon: <Youtube className="w-5 h-5" />, label: t("cat.youtube_channel"), color: "#FF0000" },
    instagram: { icon: <Instagram className="w-5 h-5" />, label: t("cat.instagram"), color: "#E4405F" },
    twitter: { icon: <Twitter className="w-5 h-5" />, label: t("cat.twitter"), color: "#1DA1F2" },
    linkedin: { icon: <Linkedin className="w-5 h-5" />, label: t("cat.linkedin"), color: "#0A66C2" },
    gaming_id: { icon: <Gamepad2 className="w-5 h-5" />, label: t("cat.gaming_id"), color: "#9146FF" },
    other: { icon: <MoreHorizontal className="w-5 h-5" />, label: t("cat.other"), color: "#6B7280" },
  };

  useEffect(() => {
    fetchListings();
  }, [category, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("id, title, description, category, custom_category, price, currency, seller_id, status, verified, images, followers_count, account_age, platform_url, created_at, updated_at")
      .in("status", ["active", "sold"]);

    if (category !== "all") {
      query = query.eq("category", category as any);
    }

    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "price_low") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price_high") {
      query = query.order("price", { ascending: false });
    }

    const { data, error } = await query;
    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div {...fadeUp} className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">{t("mp.title")}</h1>
            <p className="text-muted-foreground">{t("mp.subtitle")}</p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div {...fadeUp} className="glass-card p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("mp.search_placeholder")}
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t("cl.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cat.all")}</SelectItem>
                  <SelectItem value="facebook_page">{t("cat.facebook_page")}</SelectItem>
                  <SelectItem value="instagram">{t("cat.instagram")}</SelectItem>
                  <SelectItem value="youtube_channel">{t("cat.youtube_channel")}</SelectItem>
                  <SelectItem value="twitter">{t("cat.twitter")}</SelectItem>
                  <SelectItem value="linkedin">{t("cat.linkedin")}</SelectItem>
                  <SelectItem value="gaming_id">{t("cat.gaming_id")}</SelectItem>
                  <SelectItem value="other">{t("cat.other")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("mp.sort_newest")}</SelectItem>
                  <SelectItem value="price_low">{t("mp.sort_price_low")}</SelectItem>
                  <SelectItem value="price_high">{t("mp.sort_price_high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="h-4 bg-secondary rounded mb-3 w-3/4" />
                  <div className="h-3 bg-secondary rounded mb-2 w-1/2" />
                  <div className="h-8 bg-secondary rounded mt-4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">{t("mp.no_listings")}</p>
              <Link to="/create-listing">
                <Button className="gradient-primary text-primary-foreground border-0">
                  {t("mp.create_new")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((listing, i) => {
                const meta = categoryMeta[listing.category] || categoryMeta.other;
                const displayLabel = listing.category === 'other' && listing.custom_category ? listing.custom_category : meta.label;
                return (
                  <motion.div key={listing.id} {...fadeUp} transition={{ delay: i * 0.05, duration: 0.3 }}>
                    <Link to={`/listing/${listing.id}`}>
                      <div className={`glass-card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform ${listing.status === 'sold' ? 'opacity-75' : ''}`}>
                        <div className={`h-1.5 ${listing.status === 'sold' ? 'bg-muted-foreground/40' : 'gradient-primary'}`} />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}15`, color: meta.color }}>
                                {meta.icon}
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.color }}>{displayLabel}</p>
                                <h3 className="text-sm font-bold text-foreground line-clamp-1">{listing.title}</h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {listing.status === 'sold' && (
                                <Badge variant="destructive" className="gap-1 text-xs">
                                  <PackageX className="w-3 h-3" /> {t("mp.stockout")}
                                </Badge>
                              )}
                              {listing.verified && (
                                <Badge variant="secondary" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
                                  <ShieldCheck className="w-3 h-3" /> {t("general.verified")}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {listing.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">{t("mp.price")}</p>
                              <p className="text-lg font-extrabold text-primary">৳{Number(listing.price).toLocaleString()}</p>
                            </div>
                            {listing.status === 'sold' ? (
                              <Button size="sm" variant="outline" disabled className="text-muted-foreground">
                                {t("mp.stockout")}
                              </Button>
                            ) : (
                              <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                                {t("mp.details")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace;
