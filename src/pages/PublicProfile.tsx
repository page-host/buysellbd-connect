import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const [profRes, ordersRes, listingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("orders").select("id, status, seller_id, buyer_id")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
      supabase.from("listings").select("id, title, description, category, custom_category, price, currency, seller_id, status, verified, images, followers_count, account_age, platform_url, created_at, updated_at").eq("seller_id", userId!).eq("status", "active").order("created_at", { ascending: false }),
    ]);
    setProfile(profRes.data);
    setListings(listingsRes.data || []);

    const allOrders = ordersRes.data || [];
    const completed = allOrders.filter(o => o.status === "completed").length;
    setTotalOrders(allOrders.length);
    setCompletedOrders(completed);
    setCompletionRate(allOrders.length > 0 ? Math.round((completed / allOrders.length) * 100) : 0);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">প্রোফাইল পাওয়া যায়নি</h1>
          <Link to="/marketplace"><Button>মার্কেটপ্লেসে ফিরে যান</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> মার্কেটপ্লেসে ফিরে যান
          </Link>

          {/* Profile Card */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/30">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {(profile.full_name || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-extrabold text-foreground mb-1">{profile.full_name || "ব্যবহারকারী"}</h1>
              <p className="text-sm text-muted-foreground mb-4">
                যোগদান: {new Date(profile.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long" })}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-secondary/50 text-center">
                  <p className="text-2xl font-extrabold text-primary">{completionRate}%</p>
                  <p className="text-xs text-muted-foreground">সম্পন্ন হার</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 text-center">
                  <p className="text-2xl font-extrabold text-foreground">{completedOrders}</p>
                  <p className="text-xs text-muted-foreground">সম্পন্ন অর্ডার</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 text-center">
                  <p className="text-2xl font-extrabold text-foreground">{listings.length}</p>
                  <p className="text-xs text-muted-foreground">সক্রিয় লিস্টিং</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Listings */}
          <h2 className="text-lg font-bold text-foreground mb-4">সক্রিয় লিস্টিং</h2>
          {listings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">কোনো সক্রিয় লিস্টিং নেই</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {listings.map(listing => (
                <Link key={listing.id} to={`/listing/${listing.id}`}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer mb-3">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{listing.title}</h3>
                        <p className="text-xs text-muted-foreground">{listing.category === 'other' ? listing.custom_category : listing.category}</p>
                      </div>
                      <p className="text-lg font-extrabold text-primary">৳{Number(listing.price).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
