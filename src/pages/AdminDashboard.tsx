import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, Package, Users, MessageSquare, BarChart3, Loader2, Trash2, ChevronDown, AlertTriangle, Ban, Headphones, Download, FileSpreadsheet, FileText } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { OrderChat } from "@/components/OrderChat";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

type Order = Tables<"orders">;
type Listing = Tables<"listings">;
type Profile = Tables<"profiles">;
type ContactMessage = Tables<"contact_messages">;
type UserRole = Tables<"user_roles">;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  payment_submitted: "bg-blue-500/20 text-blue-400",
  payment_confirmed: "bg-emerald-500/20 text-emerald-400",
  delivering: "bg-purple-500/20 text-purple-400",
  delivered: "bg-cyan-500/20 text-cyan-400",
  completed: "bg-green-500/20 text-green-400",
  disputed: "bg-red-500/20 text-red-400",
  refunded: "bg-orange-500/20 text-orange-400",
  cancelled: "bg-muted text-muted-foreground",
  active: "bg-green-500/20 text-green-400",
  sold: "bg-blue-500/20 text-blue-400",
  removed: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "পেন্ডিং",
  payment_submitted: "পেমেন্ট জমা",
  payment_confirmed: "পেমেন্ট কনফার্ম",
  delivering: "ডেলিভারিং",
  delivered: "ডেলিভার্ড",
  completed: "সম্পন্ন",
  disputed: "ডিসপিউটেড",
  refunded: "রিফান্ডেড",
  cancelled: "বাতিল",
  active: "সক্রিয়",
  sold: "বিক্রিত",
  removed: "মুছে ফেলা",
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const adminCheckDone = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (adminCheckDone.current) return;
    adminCheckDone.current = true;

    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (!data) { navigate("/"); toast({ title: "অ্যাক্সেস নেই", description: "আপনি অ্যাডমিন নন।", variant: "destructive" }); }
      else setIsAdmin(true);
      setChecking(false);
    });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoadingData(true);
      const [o, l, p, r, m, rp, sp] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("listings").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("reports").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("support_messages").select("*").order("created_at", { ascending: true }),
      ]);
      setOrders(o.data || []);
      setListings(l.data || []);
      setProfiles(p.data || []);
      setRoles(r.data || []);
      setMessages(m.data || []);
      setReports((rp.data as any[]) || []);
      
      // Group support messages by user_id
      const allSupport = (sp.data as any[]) || [];
      const grouped: Record<string, any[]> = {};
      allSupport.forEach(msg => {
        if (!grouped[msg.user_id]) grouped[msg.user_id] = [];
        grouped[msg.user_id].push(msg);
      });
      setSupportChats(Object.entries(grouped).map(([userId, msgs]) => ({
        userId,
        messages: msgs,
        unread: msgs.filter((m: any) => !m.is_read && m.sender_id === userId).length,
        lastMessage: msgs[msgs.length - 1],
      })));
      
      setLoadingData(false);
    };
    load();

    // Realtime for support messages
    const supportChannel = supabase
      .channel("admin-support-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_messages" }, (payload: any) => {
        const msg = payload.new as any;
        if (!msg) return;
        setSupportChats((prev: any[]) => {
          const existing = prev.find(c => c.userId === msg.user_id);
          if (payload.eventType === "INSERT") {
            if (existing) {
              const alreadyExists = existing.messages.some((m: any) => m.id === msg.id);
              if (alreadyExists) return prev;
              return prev.map(c => c.userId === msg.user_id ? {
                ...c,
                messages: [...c.messages, msg],
                unread: c.unread + (msg.sender_id === msg.user_id ? 1 : 0),
                lastMessage: msg,
              } : c);
            } else {
              return [...prev, { userId: msg.user_id, messages: [msg], unread: msg.sender_id === msg.user_id ? 1 : 0, lastMessage: msg }];
            }
          }
          if (payload.eventType === "UPDATE" && existing) {
            return prev.map(c => c.userId === msg.user_id ? {
              ...c,
              messages: c.messages.map((m: any) => m.id === msg.id ? msg : m),
              unread: c.messages.map((m: any) => m.id === msg.id ? msg : m).filter((m: any) => !m.is_read && m.sender_id === m.user_id).length,
            } : c);
          }
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(supportChannel); };
  }, [isAdmin]);

  const updateOrderStatus = async (id: string, status: string) => {
    const order = orders.find(o => o.id === id);
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
      toast({ title: "আপডেট হয়েছে" });

      // Notify buyer when payment is confirmed
      if (status === "payment_confirmed" && order) {
        const shortId = id.slice(0, 8).toUpperCase();
        await supabase.rpc("create_notification", {
          _user_id: order.buyer_id,
          _title: "✅ পেমেন্ট কনফার্ম হয়েছে",
          _message: `আপনার অর্ডার #${shortId} এর পেমেন্ট কনফার্ম হয়েছে। সেলার শীঘ্রই ডেলিভারি করবে।`,
          _type: "order",
          _reference_id: id,
        });
        const { data: buyerNotif } = await supabase.from("notifications").select("id").eq("user_id", order.buyer_id).eq("type", "order").order("created_at", { ascending: false }).limit(1);
        if (buyerNotif?.[0]) {
          await (supabase as any).from("notifications").update({
            title_en: "✅ Payment Confirmed",
            message_en: `Payment for order #${shortId} has been confirmed. Seller will deliver soon.`,
          }).eq("id", buyerNotif[0].id);
        }
      }
    }
  };

  const updateOrderNotes = async (id: string, notes: string) => {
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", id);
  };

  const updateListingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: status as any } : l));
      toast({ title: "আপডেট হয়েছে" });
    }
  };

  const toggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.from("listings").update({ verified: !current }).eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setListings(prev => prev.map(l => l.id === id ? { ...l, verified: !current } : l));
      toast({ title: !current ? "ভেরিফাইড করা হয়েছে" : "ভেরিফিকেশন সরানো হয়েছে" });
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const existing = roles.find(r => r.user_id === userId);
    if (existing) {
      const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("id", existing.id);
      if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
      else {
        setRoles(prev => prev.map(r => r.id === existing.id ? { ...r, role: newRole as any } : r));
        toast({ title: "রোল আপডেট হয়েছে" });
      }
    }
  };

  const toggleRestriction = async (userId: string, currentlyRestricted: boolean | null, reason?: string) => {
    const newVal = !currentlyRestricted;
    const updateData: any = { is_restricted: newVal };
    if (newVal && reason) updateData.restriction_reason = reason;
    if (!newVal) updateData.restriction_reason = null;
    
    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", userId);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setProfiles(prev => prev.map(p => p.user_id === userId ? { ...p, is_restricted: newVal, restriction_reason: newVal ? reason : null } as any : p));
      
      // Send notification to the user
      await supabase.rpc("create_notification", {
        _user_id: userId,
        _title: newVal ? "🚫 অ্যাকাউন্ট সীমাবদ্ধ" : "✅ সীমাবদ্ধতা সরানো হয়েছে",
        _message: newVal ? `আপনার অ্যাকাউন্ট সীমাবদ্ধ করা হয়েছে। কারণ: ${reason || "নিয়ম লঙ্ঘন"}` : "আপনার অ্যাকাউন্টের সীমাবদ্ধতা সরানো হয়েছে। আপনি এখন বাই-সেল করতে পারবেন।",
        _type: "restriction",
        _reference_id: userId,
      });
      // Update English columns
      const { data: notifData } = await supabase.from("notifications").select("id").eq("user_id", userId).eq("type", "restriction").order("created_at", { ascending: false }).limit(1);
      if (notifData?.[0]) {
        await (supabase as any).from("notifications").update({
          title_en: newVal ? "🚫 Account Restricted" : "✅ Restriction Removed",
          message_en: newVal ? `Your account has been restricted. Reason: ${reason || "Policy violation"}` : "Your account restriction has been removed. You can now buy and sell.",
        }).eq("id", notifData[0].id);
      }
      
      toast({ title: newVal ? "🚫 ইউজার সীমাবদ্ধ করা হয়েছে" : "✅ সীমাবদ্ধতা সরানো হয়েছে" });
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else {
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: "মুছে ফেলা হয়েছে" });
    }
  };

  const getProfileName = (userId: string) => {
    const p = profiles.find(p => p.user_id === userId);
    return p?.full_name || userId.slice(0, 8);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "buyer";

  const orderColumns = [
    { header: "Date", key: "created_at", transform: (v: any) => new Date(v).toLocaleDateString() },
    { header: "Buyer", key: "buyer_id", transform: (v: any) => getProfileName(v) },
    { header: "Seller", key: "seller_id", transform: (v: any) => getProfileName(v) },
    { header: "Amount", key: "amount", transform: (v: any) => `৳${Number(v).toLocaleString()}` },
    { header: "Payment Method", key: "payment_method" },
    { header: "Reference", key: "payment_reference", transform: (v: any) => v || "—" },
    { header: "Status", key: "status" },
    { header: "Notes", key: "admin_notes", transform: (v: any) => v || "" },
  ];

  const userColumns = [
    { header: "Name", key: "full_name", transform: (v: any) => v || "—" },
    { header: "Phone", key: "phone", transform: (v: any) => v || "—" },
    { header: "Joined", key: "created_at", transform: (v: any) => new Date(v).toLocaleDateString() },
    { header: "Role", key: "user_id", transform: (v: any) => getUserRole(v) },
    { header: "Restricted", key: "is_restricted", transform: (v: any) => v ? "Yes" : "No" },
  ];

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.amount), 0);
  const pendingOrders = orders.filter(o => ["pending", "payment_submitted"].includes(o.status)).length;
  const activeListings = listings.filter(l => l.status === "active").length;
  const openReports = reports.filter(r => r.status === 'open').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">{t("admin.title")}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: t("admin.total_orders"), value: orders.length, icon: Package },
            { label: t("admin.pending_orders"), value: pendingOrders, icon: Package },
            { label: t("admin.active_listings"), value: activeListings, icon: BarChart3 },
            { label: t("admin.total_revenue"), value: `৳${totalRevenue.toLocaleString()}`, icon: BarChart3 },
            { label: t("admin.open_reports"), value: openReports, icon: AlertTriangle },
          ].map((s, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loadingData ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="orders">
            <TabsList className="mb-6 bg-muted flex-wrap">
              <TabsTrigger value="orders">{t("admin.orders_tab")} ({orders.length})</TabsTrigger>
              <TabsTrigger value="listings">{t("admin.listings_tab")} ({listings.length})</TabsTrigger>
              <TabsTrigger value="users">{t("admin.users_tab")} ({profiles.length})</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {t("admin.reports_tab")} ({reports.length})
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-1">
                <Headphones className="w-3.5 h-3.5" /> {t("admin.support_tab")} ({supportChats.reduce((s, c) => s + c.unread, 0)})
              </TabsTrigger>
              <TabsTrigger value="messages">{t("admin.messages_tab")} ({messages.length})</TabsTrigger>
            </TabsList>

            {/* ORDERS TAB */}
            <TabsContent value="orders">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("admin.all_orders")}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => exportToExcel(orders, orderColumns, "orders-export")}>
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => exportToPDF(orders, orderColumns, "All Orders", "orders-export")}>
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? <p className="text-muted-foreground text-center py-8">{t("admin.no_orders")}</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("admin.date")}</TableHead>
                            <TableHead>{t("admin.buyer")}</TableHead>
                            <TableHead>{t("admin.seller")}</TableHead>
                            <TableHead>{t("admin.amount")}</TableHead>
                            <TableHead>{t("admin.payment")}</TableHead>
                            <TableHead>{t("admin.reference")}</TableHead>
                            <TableHead>{t("admin.status")}</TableHead>
                            <TableHead>{t("admin.notes")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map(order => (
                            <React.Fragment key={order.id}>
                            <TableRow>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(order.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</TableCell>
                              <TableCell className="text-sm">{getProfileName(order.buyer_id)}</TableCell>
                              <TableCell className="text-sm">{getProfileName(order.seller_id)}</TableCell>
                              <TableCell className="font-semibold">৳{Number(order.amount).toLocaleString()}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{order.payment_method}</Badge></TableCell>
                              <TableCell className="text-xs max-w-[120px] truncate">{order.payment_reference || "—"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                    {order.status === "payment_submitted" && (
                                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateOrderStatus(order.id, "payment_confirmed")}>
                                      {t("admin.confirm_payment")}
                                    </Button>
                                  )}
                                  <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {["pending","payment_submitted","payment_confirmed","delivering","delivered","completed","disputed","refunded","cancelled"].map(s => (
                                        <SelectItem key={s} value={s}>{t(`status.${s}`) !== `status.${s}` ? t(`status.${s}`) : s}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Textarea
                                    className="min-w-[150px] text-xs h-8"
                                    placeholder={t("admin.admin_notes")}
                                    defaultValue={order.admin_notes || ""}
                                    onBlur={(e) => updateOrderNotes(order.id, e.target.value)}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 shrink-0"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                  >
                                    {t("admin.chat")}
                                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedOrder === order.id && (
                              <TableRow>
                                <TableCell colSpan={8} className="p-4 space-y-3">
                                  {(() => {
                                    const listing = listings.find(l => l.id === order.listing_id);
                                    const paymentInfo = (listing as any)?.payment_info;
                                    return paymentInfo ? (
                                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-xs font-semibold text-amber-400 mb-1">{t("admin.seller_payment_info")}</p>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{paymentInfo}</p>
                                      </div>
                                    ) : null;
                                  })()}
                                  <OrderChat
                                    orderId={order.id}
                                    buyerId={order.buyer_id}
                                    sellerId={order.seller_id}
                                    orderStatus={order.status}
                                    isAdminView={true}
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* LISTINGS TAB */}
            <TabsContent value="listings">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>{t("admin.all_listings")}</CardTitle></CardHeader>
                <CardContent>
                  {listings.length === 0 ? <p className="text-muted-foreground text-center py-8">{t("admin.no_listings")}</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("admin.title_col")}</TableHead>
                            <TableHead>{t("admin.category")}</TableHead>
                            <TableHead>{t("admin.price")}</TableHead>
                            <TableHead>{t("admin.seller")}</TableHead>
                            <TableHead>{t("admin.verified")}</TableHead>
                            <TableHead>{t("admin.status")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {listings.map(listing => (
                            <TableRow key={listing.id}>
                              <TableCell className="font-medium max-w-[200px] truncate">{listing.title}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{listing.category}</Badge></TableCell>
                              <TableCell className="font-semibold">৳{Number(listing.price).toLocaleString()}</TableCell>
                              <TableCell className="text-sm">{getProfileName(listing.seller_id)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant={listing.verified ? "default" : "outline"} className="text-xs h-7" onClick={() => toggleVerified(listing.id, listing.verified)}>
                                  {listing.verified ? t("admin.verified_btn") : t("admin.verify_btn")}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`text-xs ${statusColors[listing.status] || ""}`}>
                                    {t(`status.${listing.status}`) !== `status.${listing.status}` ? t(`status.${listing.status}`) : listing.status}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={() => updateListingStatus(listing.id, "removed")}
                                    disabled={listing.status === "removed"}
                                  >
                                    <Trash2 className="w-3 h-3" /> {t("admin.delete_btn")}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* USERS TAB */}
            <TabsContent value="users">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("admin.all_users")}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => exportToExcel(profiles, userColumns, "users-export")}>
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => exportToPDF(profiles, userColumns, "All Users", "users-export")}>
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {profiles.length === 0 ? <p className="text-muted-foreground text-center py-8">{t("admin.no_users")}</p> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("admin.name")}</TableHead>
                            <TableHead>{t("admin.phone")}</TableHead>
                            <TableHead>{t("admin.joined")}</TableHead>
                            <TableHead>{t("admin.role")}</TableHead>
                            <TableHead>{t("admin.restricted")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profiles.map(profile => (
                            <TableRow key={profile.id}>
                              <TableCell className="font-medium">{profile.full_name || "—"}</TableCell>
                              <TableCell className="text-sm">{profile.phone || "—"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{new Date(profile.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</TableCell>
                              <TableCell>
                                <Select value={getUserRole(profile.user_id)} onValueChange={(v) => changeUserRole(profile.user_id, v)}>
                                  <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="buyer">Buyer</SelectItem>
                                    <SelectItem value="seller">Seller</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={!!profile.is_restricted}
                                      onCheckedChange={() => {
                                        if (!profile.is_restricted) {
                                          const reason = prompt("রেস্ট্রিকশনের কারণ লিখুন:");
                                          if (reason) toggleRestriction(profile.user_id, profile.is_restricted, reason);
                                        } else {
                                          toggleRestriction(profile.user_id, profile.is_restricted);
                                        }
                                      }}
                                    />
                                    {profile.is_restricted && (
                                      <Badge variant="destructive" className="text-xs gap-1">
                                        <Ban className="w-3 h-3" /> {t("admin.restricted_badge")}
                                      </Badge>
                                    )}
                                  </div>
                                  {profile.is_restricted && (profile as any).restriction_reason && (
                                    <p className="text-[10px] text-destructive/80">{t("admin.restriction_reason")}: {(profile as any).restriction_reason}</p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* REPORTS TAB */}
            <TabsContent value="reports">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> {t("admin.all_reports")}</CardTitle></CardHeader>
                <CardContent>
                  {reports.length === 0 ? <p className="text-muted-foreground text-center py-8">{t("admin.no_reports")}</p> : (
                    <div className="space-y-4">
                      {reports.map((report: any) => (
                        <div key={report.id} className="p-4 rounded-lg border border-border bg-muted/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline" className={`text-xs ${report.status === 'open' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                                  {report.status === 'open' ? t("admin.report_open") : t("admin.report_resolved")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {t("admin.reporter")}: <span className="text-foreground font-medium">{getProfileName(report.reporter_id)}</span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {t("dash.order_id")} #{report.order_id?.slice(0, 8).toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-foreground mb-2">{report.message}</p>
                              <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</p>

                              {report.admin_reply && (
                                <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                                  <p className="text-xs text-primary font-semibold mb-1">{t("admin.admin_reply")}</p>
                                  <p className="text-sm text-foreground">{report.admin_reply}</p>
                                </div>
                              )}

                              <div className="mt-3 flex items-center gap-2">
                                <Textarea
                                  className="text-xs min-h-[60px]"
                                  placeholder={t("admin.reply_placeholder")}
                                  defaultValue={report.admin_reply || ""}
                                  id={`reply-${report.id}`}
                                />
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={async () => {
                                      const reply = (document.getElementById(`reply-${report.id}`) as HTMLTextAreaElement)?.value;
                                      const { error } = await supabase.from("reports").update({ admin_reply: reply, status: 'resolved' } as any).eq("id", report.id);
                                      if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
                                      else {
                                        setReports(prev => prev.map(r => r.id === report.id ? { ...r, admin_reply: reply, status: 'resolved' } : r));
                                        toast({ title: "উত্তর পাঠানো হয়েছে" });
                                      }
                                    }}
                                  >
                                    {t("admin.reply_btn")}
                                  </Button>
                                  {report.status === 'open' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7"
                                      onClick={async () => {
                                        await supabase.from("reports").update({ status: 'resolved' } as any).eq("id", report.id);
                                        setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r));
                                        toast({ title: "সমাধান করা হয়েছে" });
                                      }}
                                    >
                                      {t("admin.resolve_btn")}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SUPPORT TAB */}
            <TabsContent value="support">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="flex items-center gap-2"><Headphones className="w-5 h-5 text-primary" /> {t("admin.support_title")}</CardTitle></CardHeader>
                <CardContent>
                  {supportChats.length === 0 ? <p className="text-muted-foreground text-center py-8">{t("admin.no_support")}</p> : (
                    <div className="space-y-4">
                      {supportChats.map((chat: any) => {
                        const userName = getProfileName(chat.userId);
                        return (
                          <details key={chat.userId} className="group">
                            <summary className="cursor-pointer p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-foreground text-sm">{userName}</span>
                                {chat.unread > 0 && (
                                  <Badge variant="destructive" className="text-[10px]">{chat.unread} {t("admin.unread")}</Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {chat.lastMessage ? new Date(chat.lastMessage.created_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US") : ""}
                              </span>
                            </summary>
                            <div className="mt-2 border border-border rounded-lg overflow-hidden">
                              <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                                {chat.messages.map((msg: any) => {
                                  const isUser = msg.sender_id === chat.userId;
                                  return (
                                    <div key={msg.id} className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}>
                                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 mb-0.5 ${isUser ? "bg-blue-500/20 text-blue-400" : "bg-primary/20 text-primary"}`}>
                                        {isUser ? userName : t("admin.admin_label")}
                                      </Badge>
                                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${isUser ? "bg-secondary text-foreground" : "bg-primary/10 text-foreground"}`}>
                                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[9px] text-muted-foreground">
                                          {new Date(msg.created_at).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {!isUser && (
                                          <span className={`text-[9px] ${msg.is_read ? "text-green-400" : "text-muted-foreground/60"}`}>
                                            {msg.is_read ? "✓✓ Seen" : "✓ Sent"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="border-t border-border p-3 flex gap-2">
                                <input
                                  type="text"
                                  placeholder={t("admin.support_reply_placeholder")}
                                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  id={`support-reply-${chat.userId}`}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      const input = e.target as HTMLInputElement;
                                      if (!input.value.trim()) return;
                                      await (supabase as any).from("support_messages").insert({
                                        user_id: chat.userId,
                                        sender_id: user!.id,
                                        message: input.value.trim(),
                                      });
                                      input.value = "";
                                      // Refresh
                                      const { data } = await (supabase as any).from("support_messages").select("*").eq("user_id", chat.userId).order("created_at", { ascending: true });
                                      setSupportChats((prev: any[]) => prev.map(c => c.userId === chat.userId ? { ...c, messages: data || c.messages, unread: 0 } : c));
                                      // Mark as read
                                      await (supabase as any).from("support_messages").update({ is_read: true }).eq("user_id", chat.userId).eq("sender_id", chat.userId).eq("is_read", false);
                                    }
                                  }}
                                />
                                <Button size="sm" className="text-xs" onClick={async () => {
                                  const input = document.getElementById(`support-reply-${chat.userId}`) as HTMLInputElement;
                                  if (!input?.value.trim()) return;
                                  await (supabase as any).from("support_messages").insert({
                                    user_id: chat.userId,
                                    sender_id: user!.id,
                                    message: input.value.trim(),
                                  });
                                  input.value = "";
                                  const { data } = await (supabase as any).from("support_messages").select("*").eq("user_id", chat.userId).order("created_at", { ascending: true });
                                  setSupportChats((prev: any[]) => prev.map(c => c.userId === chat.userId ? { ...c, messages: data || c.messages, unread: 0 } : c));
                                  await (supabase as any).from("support_messages").update({ is_read: true }).eq("user_id", chat.userId).eq("sender_id", chat.userId).eq("is_read", false);
                                }}>
                                  {t("admin.send_btn")}
                                </Button>
                              </div>
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MESSAGES TAB */}
            <TabsContent value="messages">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle>{t("admin.contact_messages")}</CardTitle></CardHeader>
                <CardContent>
                  {messages.length === 0 ? <p className="text-muted-foreground text-center py-8">{t("admin.no_messages")}</p> : (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div key={msg.id} className="p-4 rounded-lg border border-border bg-muted/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">{msg.name}</span>
                                <span className="text-xs text-muted-foreground">{msg.email}</span>
                              </div>
                              {msg.subject && <p className="text-sm font-medium text-foreground mb-1">{msg.subject}</p>}
                              <p className="text-sm text-muted-foreground">{msg.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteMessage(msg.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
