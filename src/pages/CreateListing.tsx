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

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
          <h1 className="text-2xl font-bold text-foreground mb-4">লগইন করুন</h1>
          <p className="text-muted-foreground mb-4">লিস্টিং তৈরি করতে আপনাকে লগইন করতে হবে।</p>
          <Link to="/login"><Button className="gradient-primary text-primary-foreground border-0">লগইন করুন</Button></Link>
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
          <p className="text-muted-foreground mb-4">আপনার অ্যাকাউন্ট সীমাবদ্ধ করা হয়েছে। আপনি বাই-সেল বা লিস্টিং করতে পারবেন না।</p>
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
            <ArrowLeft className="w-4 h-4" /> মার্কেটপ্লেসে ফিরে যান
          </Link>

          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-foreground">নতুন লিস্টিং তৈরি করুন</h1>
                <p className="text-sm text-muted-foreground">আপনার অ্যাকাউন্ট বিক্রি করতে তথ্য দিন</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>ক্যাটাগরি *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook_page">ফেসবুক পেজ</SelectItem>
                    <SelectItem value="youtube_channel">ইউটিউব চ্যানেল</SelectItem>
                    <SelectItem value="instagram">ইনস্টাগ্রাম</SelectItem>
                    <SelectItem value="gaming_id">গেমিং আইডি</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {category === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customCat">ক্যাটাগরির নাম *</Label>
                  <Input id="customCat" placeholder="যেমন: TikTok, Twitter, Domain" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required maxLength={100} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">শিরোনাম *</Label>
                <Input id="title" placeholder="যেমন: Tech News Bangladesh" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">বিবরণ</Label>
                <Textarea id="desc" placeholder="অ্যাকাউন্টের বিস্তারিত তথ্য লিখুন..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">প্ল্যাটফর্ম লিংক</Label>
                <Input id="url" placeholder="https://..." value={platformUrl} onChange={(e) => setPlatformUrl(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">মূল্য (৳) *</Label>
                <Input id="price" type="number" min="1" step="0.01" placeholder="যেমন: 45000" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInfo">পেমেন্ট তথ্য (গোপনীয়)</Label>
                <Textarea
                  id="paymentInfo"
                  placeholder="আপনার পেমেন্ট তথ্য লিখুন (যেমন: বিকাশ নম্বর, নগদ নম্বর ইত্যাদি)। এটি শুধুমাত্র অ্যাডমিন দেখতে পারবে।"
                  value={paymentInfo}
                  onChange={(e) => setPaymentInfo(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">🔒 এই তথ্য শুধুমাত্র অর্ডার হলে অ্যাডমিনের কাছে দৃশ্যমান হবে।</p>
              </div>

              <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground border-0 font-bold text-base" disabled={loading}>
                {loading ? "তৈরি হচ্ছে..." : "লিস্টিং প্রকাশ করুন"}
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
