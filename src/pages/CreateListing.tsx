import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [price, setPrice] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [restricted, setRestricted] = useState(false);

  // Check restriction
  useState(() => {
    if (user) {
      supabase.from("profiles").select("is_restricted").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data?.is_restricted) setRestricted(true);
      });
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("cl.login_required")}</h1>
          <p className="text-muted-foreground mb-4">{t("cl.login_msg")}</p>
          <Link to="/login"><Button className="gradient-primary text-primary-foreground border-0">{t("nav.login")}</Button></Link>
        </div>
      </div>
    );
  }

  if (restricted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">🚫 অ্যাক্সেস সীমাবদ্ধ</h1>
          <p className="text-muted-foreground mb-4">আপনার অ্যাকাউন্ট সীমাবদ্ধ করা হয়েছে।</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast({ title: "ত্রুটি", description: "ক্যাটাগরি নির্বাচন করুন।", variant: "destructive" });
      return;
    }
    if (category === "other" && !customCategory.trim()) {
      toast({ title: "ত্রুটি", description: "অন্যান্য ক্যাটাগরির নাম লিখুন।", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("listings").insert({
      seller_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category as any,
      custom_category: category === "other" ? customCategory.trim() : null,
      platform_url: platformUrl.trim() || null,
      price: parseFloat(price),
      payment_info: paymentInfo.trim() || null,
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল!", description: "আপনার লিস্টিং তৈরি হয়েছে।" });
      navigate("/marketplace");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("cl.back")}
          </Link>

          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-foreground">{t("cl.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("cl.subtitle")}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>{t("cl.category")} *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("cl.category_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook_page">{t("cat.facebook_page")}</SelectItem>
                    <SelectItem value="instagram">{t("cat.instagram")}</SelectItem>
                    <SelectItem value="youtube_channel">{t("cat.youtube_channel")}</SelectItem>
                    <SelectItem value="twitter">{t("cat.twitter")}</SelectItem>
                    <SelectItem value="linkedin">{t("cat.linkedin")}</SelectItem>
                    <SelectItem value="gaming_id">{t("cat.gaming_id")}</SelectItem>
                    <SelectItem value="other">{t("cat.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {category === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customCat">{t("cl.custom_cat")} *</Label>
                  <Input id="customCat" placeholder={t("cl.custom_cat_placeholder")} value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required maxLength={100} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">{t("cl.listing_title")} *</Label>
                <Input id="title" placeholder={t("cl.listing_title_placeholder")} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">{t("cl.description")}</Label>
                <Textarea id="desc" placeholder={t("cl.description_placeholder")} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">{t("cl.platform_url")}</Label>
                <Input id="url" placeholder="https://..." value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t("cl.price")} *</Label>
                <Input id="price" type="number" min="1" step="0.01" placeholder={t("cl.price_placeholder")} value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo">{t("cl.payment_info")}</Label>
                <Textarea
                  id="paymentInfo"
                  placeholder={t("cl.payment_info_placeholder")}
                  value={paymentInfo}
                  onChange={(e) => setPaymentInfo(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">{t("cl.payment_info_note")}</p>
              </div>

              <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground border-0 font-bold text-base" disabled={loading}>
                {loading ? t("cl.submitting") : t("cl.submit")}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateListing;
