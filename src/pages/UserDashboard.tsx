import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Lock, Package, Wallet, Loader2, ShoppingBag,
  Eye, EyeOff, TrendingUp, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Plus, Camera, Trash2, PackageX
} from "lucide-react";
import { OrderChat } from "@/components/OrderChat";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type Profile = Tables<"profiles">;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  payment_submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  payment_confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  delivering: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  disputed: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  pending: "পেন্ডিং",
  payment_submitted: "পেমেন্ট জমা দেওয়া হয়েছে",
  payment_confirmed: "পেমেন্ট নিশ্চিত",
  delivering: "ডেলিভারি চলছে",
  delivered: "ডেলিভার্ড",
  completed: "সম্পন্ন",
  disputed: "ডিসপিউট",
  refunded: "রিফান্ড হয়েছে",
  cancelled: "বাতিল",
};

const paymentLabels: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  usdt: "USDT",
  trx: "TRX",
};

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    const load = async () => {
      setLoadingData(true);
      const [profRes, ordersRes, listingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders")
          .select("*")
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
        supabase.from("listings").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profRes.data) {
        setProfile(profRes.data);
        setFullName(profRes.data.full_name || "");
        setPhone(profRes.data.phone || "");
      }
      setOrders(ordersRes.data || []);
      setMyListings(listingsRes.data || []);
      setLoadingData(false);
    };
    load();
  }, [user, authLoading, navigate]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("user_id", user.id);
    setSavingProfile(false);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else toast({ title: "✅ প্রোফাইল আপডেট হয়েছে" });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "ত্রুটি", description: "শুধু ছবি আপলোড করুন।", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "ত্রুটি", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl + "?t=" + Date.now();

    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    setUploadingAvatar(false);
    toast({ title: "✅ প্রোফাইল ছবি আপডেট হয়েছে" });
  };

  const deleteAvatar = async () => {
    if (!user) return;
    setUploadingAvatar(true);
    // Try to remove old file
    await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`, `${user.id}/avatar.jpeg`]);
    await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    setProfile(prev => prev ? { ...prev, avatar_url: null } : prev);
    setUploadingAvatar(false);
    toast({ title: "প্রোফাইল ছবি মুছে ফেলা হয়েছে" });
  };

  const toggleStockOut = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
    const { error } = await supabase.from("listings").update({ status: newStatus as any }).eq("id", listingId);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setMyListings(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
      toast({ title: newStatus === 'sold' ? "স্টকআউট করা হয়েছে" : "আবার সক্রিয় করা হয়েছে" });
    }
  };

  const deleteListing = async (listingId: string) => {
    const { error } = await supabase.from("listings").update({ status: "removed" as any }).eq("id", listingId);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setMyListings(prev => prev.filter(l => l.id !== listingId));
      toast({ title: "লিস্টিং মুছে ফেলা হয়েছে" });
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "ত্রুটি", description: "নতুন পাসওয়ার্ড দুটো মিলছে না।", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "ত্রুটি", description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", variant: "destructive" });
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      toast({ title: "✅ পাসওয়ার্ড পরিবর্তন হয়েছে" });
      setNewPassword(""); setConfirmPassword("");
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const buyOrders = orders.filter(o => o.buyer_id === user.id);
  const sellOrders = orders.filter(o => o.seller_id === user.id);
  const totalSpent = buyOrders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.amount), 0);
  const totalEarned = sellOrders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.amount), 0);
  const pendingCount = orders.filter(o => ["pending","payment_submitted"].includes(o.status)).length;
  const completedCount = orders.filter(o => o.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">

        {/* Header with Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative group">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {(profile?.full_name || user.email || "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.full_name || user.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "মোট ব্যয়", value: `৳${totalSpent.toLocaleString()}`, icon: Wallet, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "মোট আয়", value: `৳${totalEarned.toLocaleString()}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "পেন্ডিং অর্ডার", value: pendingCount, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "সম্পন্ন অর্ডার", value: completedCount, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
          ].map((s, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6 bg-muted flex-wrap">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />প্রোফাইল</TabsTrigger>
            <TabsTrigger value="password" className="gap-2"><Lock className="w-4 h-4" />পাসওয়ার্ড</TabsTrigger>
            <TabsTrigger value="listings" className="gap-2"><ShoppingBag className="w-4 h-4" />আমার লিস্টিং ({myListings.length})</TabsTrigger>
            <TabsTrigger value="orders" className="gap-2"><Package className="w-4 h-4" />অর্ডার ({orders.length})</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> প্রোফাইল তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Avatar Upload */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group">
                    <Avatar className="w-20 h-20 border-2 border-primary/30">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {(profile?.full_name || user.email || "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 text-background" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">প্রোফাইল ছবি</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                        {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Camera className="w-3 h-3 mr-1" />}
                        আপলোড
                      </Button>
                      {profile?.avatar_url && (
                        <Button size="sm" variant="outline" className="text-xs h-7 text-destructive" onClick={deleteAvatar} disabled={uploadingAvatar}>
                          <Trash2 className="w-3 h-3 mr-1" /> মুছুন
                        </Button>
                      )}
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <form onSubmit={saveProfile} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label>ইমেইল</Label>
                    <Input value={user.email || ""} disabled className="opacity-60 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">পূর্ণ নাম</Label>
                    <Input id="fullName" placeholder="আপনার নাম লিখুন" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">ফোন নম্বর</Label>
                    <Input id="phone" placeholder="যেমন: 01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
                  </div>
                  <Button type="submit" className="gradient-primary text-primary-foreground border-0 font-semibold" disabled={savingProfile}>
                    {savingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />সংরক্ষণ...</> : "প্রোফাইল সংরক্ষণ"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PASSWORD TAB */}
          <TabsContent value="password">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> পাসওয়ার্ড পরিবর্তন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={changePassword} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="newPw">নতুন পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Input id="newPw" type={showNewPw ? "text" : "password"} placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNewPw(!showNewPw)}>
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPw">পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <div className="relative">
                      <Input id="confirmPw" type={showPw ? "text" : "password"} placeholder="পাসওয়ার্ড আবার লিখুন" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> পাসওয়ার্ড মিলছে না
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="gradient-primary text-primary-foreground border-0 font-semibold" disabled={savingPw}>
                    {savingPw ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />পরিবর্তন হচ্ছে...</> : "পাসওয়ার্ড পরিবর্তন করুন"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MY LISTINGS TAB */}
          <TabsContent value="listings">
            <div className="space-y-4">
              {myListings.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">আপনার কোনো লিস্টিং নেই</p>
                    <Link to="/create-listing">
                      <Button className="gradient-primary text-primary-foreground border-0">
                        <Plus className="w-4 h-4 mr-1" /> নতুন লিস্টিং তৈরি করুন
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {myListings.map(listing => (
                    <Card key={listing.id} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-sm font-bold text-foreground truncate">{listing.title}</h3>
                              <Badge variant="outline" className={`text-xs ${statusColors[listing.status] || ""}`}>
                                {listing.status === 'sold' ? 'স্টকআউট' : listing.status === 'active' ? 'সক্রিয়' : listing.status === 'removed' ? 'মুছে ফেলা' : listing.status}
                              </Badge>
                            </div>
                            <p className="text-lg font-extrabold text-primary">৳{Number(listing.price).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className={`text-xs h-8 gap-1 ${listing.status === 'sold' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'}`}
                              onClick={() => toggleStockOut(listing.id, listing.status)}
                              disabled={listing.status === 'removed'}
                            >
                              <PackageX className="w-3 h-3" />
                              {listing.status === 'sold' ? 'সক্রিয় করুন' : 'স্টকআউট'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => deleteListing(listing.id)}
                              disabled={listing.status === 'removed'}
                            >
                              <Trash2 className="w-3 h-3" /> মুছুন
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex justify-center pt-2">
                    <Link to="/create-listing">
                      <Button variant="outline" className="gap-2 border-primary/50 text-primary">
                        <Plus className="w-4 h-4" /> নতুন লিস্টিং তৈরি করুন
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">এখনো কোনো অর্ডার নেই</p>
                    <Link to="/marketplace">
                      <Button className="gradient-primary text-primary-foreground border-0">
                        মার্কেটপ্লেসে যান <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                orders.map(order => {
                  const isBuyer = order.buyer_id === user.id;
                  return (
                    <Card key={order.id} className="bg-card border-border">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className={`text-xs border ${statusColors[order.status] || ""}`}>
                                {statusLabels[order.status] || order.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {isBuyer ? "ক্রেতা" : "বিক্রেতা"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {paymentLabels[order.payment_method] || order.payment_method}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              অর্ডার #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            {order.payment_reference && (
                              <p className="text-xs text-muted-foreground">
                                রেফারেন্স: <span className="font-mono text-foreground">{order.payment_reference}</span>
                              </p>
                            )}
                            {order.admin_notes && (
                              <p className="text-xs mt-1 text-primary/80 bg-primary/5 rounded px-2 py-1 inline-block">
                                অ্যাডমিন নোট: {order.admin_notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-extrabold text-primary">৳{Number(order.amount).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(order.created_at).toLocaleDateString("bn-BD", {
                                year: "numeric", month: "long", day: "numeric"
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex items-center gap-1 text-xs">
                            {["pending","payment_submitted","payment_confirmed","delivering","completed"].map((s, idx) => {
                              const statuses = ["pending","payment_submitted","payment_confirmed","delivering","completed"];
                              const current = statuses.indexOf(order.status);
                              const isActive = idx <= current;
                              const isDone = idx < current;
                              return (
                                <div key={s} className="flex items-center gap-1 flex-1">
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${isDone ? "bg-primary" : isActive ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                                  {idx < statuses.length - 1 && (
                                    <div className={`h-px flex-1 ${isDone ? "bg-primary" : "bg-muted-foreground/20"}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                            <span>পেন্ডিং</span>
                            <span>পেমেন্ট</span>
                            <span>নিশ্চিত</span>
                            <span>ডেলিভারি</span>
                            <span>সম্পন্ন</span>
                          </div>
                        </div>

                        {/* Order Chat - collapsed by default */}
                        <div className="mt-4">
                          <OrderChat
                            orderId={order.id}
                            buyerId={order.buyer_id}
                            sellerId={order.seller_id}
                            orderStatus={order.status}
                            onOrderComplete={() => {
                              setOrders(prev => prev.map(o => o.id === order.id ? { ...o, buyer_confirmed: true, status: "completed" as any } : o));
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
