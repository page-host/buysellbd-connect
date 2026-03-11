import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Send, Key, Loader2, ShieldCheck, CheckCircle2, AlertTriangle, MessageSquare, X, Check, CheckCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OrderChatProps {
  orderId: string;
  buyerId: string;
  sellerId: string;
  orderStatus: string;
  onOrderComplete?: () => void;
  isAdminView?: boolean;
}

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  is_credentials: boolean;
  is_read: boolean;
  created_at: string;
}

export function OrderChat({ orderId, buyerId, sellerId, orderStatus, onOrderComplete, isAdminView = false }: OrderChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCredential, setIsCredential] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBuyer = user?.id === buyerId;
  const isSeller = user?.id === sellerId;
  const isParticipant = isBuyer || isSeller;

  const hasCredentials = messages.some(m => m.is_credentials);
  const isCompleted = ["completed", "refunded", "cancelled"].includes(orderStatus);

  // Unread = messages sent by the OTHER party that I haven't read
  const unreadCount = user ? messages.filter(m => m.sender_id !== user.id && !m.is_read).length : 0;

  const fetchMessages = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("order_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_messages", filter: `order_id=eq.${orderId}` },
        () => fetchMessages()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when chat is open (not for admin)
  useEffect(() => {
    if (!chatOpen || !user || isAdminView) return;
    const unread = messages.filter(m => m.sender_id !== user.id && !m.is_read);
    if (unread.length > 0) {
      Promise.all(
        unread.map(m => (supabase as any).from("order_messages").update({ is_read: true }).eq("id", m.id))
      ).then(() => {
        setMessages(prev => prev.map(m => m.sender_id !== user.id ? { ...m, is_read: true } : m));
      });
    }
  }, [chatOpen, messages, user, isAdminView]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);

    if (isCredential && isSeller) {
      await supabase.from("orders").update({ status: "delivering" as any }).eq("id", orderId);
    }

    const { error } = await (supabase as any).from("order_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      message: newMessage.trim(),
      is_credentials: isCredential,
    });
    setSending(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      setNewMessage("");
      setIsCredential(false);
    }
  };

  const confirmOrder = async () => {
    if (!user) return;

    await (supabase as any).from("order_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      message: "✅ ক্রেতা অর্ডার কনফার্ম করেছে। অর্ডার সম্পন্ন হয়েছে!",
      is_credentials: false,
    });

    // Notify seller
    const { data: orderData } = await supabase.from("orders").select("seller_id, id").eq("id", orderId).maybeSingle();
    if (orderData) {
      await supabase.rpc("create_notification", {
        _user_id: orderData.seller_id,
        _title: "✅ অর্ডার সম্পন্ন",
        _message: `অর্ডার #${orderData.id.slice(0, 8).toUpperCase()} সম্পন্ন হয়েছে। ক্রেতা ক্রেডেনশিয়াল কনফার্ম করেছে।`,
        _type: "order",
        _reference_id: orderData.id,
      });
    }

    const { error } = await supabase
      .from("orders")
      .update({ buyer_confirmed: true, status: "completed" as any })
      .eq("id", orderId);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ অর্ডার সম্পন্ন হয়েছে!" });
      onOrderComplete?.();
    }
  };

  const submitReport = async () => {
    if (!reportMessage.trim() || !user) return;
    setReportSending(true);
    const { error } = await (supabase as any).from("reports").insert({
      order_id: orderId,
      reporter_id: user.id,
      message: reportMessage.trim(),
    });
    setReportSending(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ রিপোর্ট পাঠানো হয়েছে", description: "অ্যাডমিন শীঘ্রই দেখবেন।" });
      setReportMessage("");
      setReportOpen(false);
    }
  };

  const getSenderLabel = (senderId: string) => {
    if (senderId === buyerId) return "ক্রেতা";
    if (senderId === sellerId) return "বিক্রেতা";
    return "সিস্টেম";
  };

  const getSenderColor = (senderId: string) => {
    if (senderId === buyerId) return "bg-blue-500/20 text-blue-400";
    if (senderId === sellerId) return "bg-emerald-500/20 text-emerald-400";
    return "bg-primary/20 text-primary";
  };

  const getMessageStatus = (msg: Message) => {
    if (!user || msg.sender_id !== user.id) return null;
    if (msg.is_read) {
      return <span className="text-[9px] text-primary flex items-center gap-0.5"><CheckCheck className="w-3 h-3" /> সিন</span>;
    }
    return <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Check className="w-3 h-3" /> সেন্ট</span>;
  };

  const canChat = ["payment_confirmed", "delivering", "delivered", "disputed"].includes(orderStatus);

  // Collapsed view
  if (!chatOpen && !isAdminView) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => setChatOpen(true)}
        >
          <MessageSquare className="w-4 h-4" />
          💬 চ্যাট খুলুন
          {unreadCount > 0 && (
            <Badge variant="secondary" className="h-5 min-w-[20px] p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
              {unreadCount}
            </Badge>
          )}
        </Button>
        {isCompleted && (
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
            ✅ সম্পন্ন
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          💬 অর্ডার চ্যাট
          {isAdminView && <Badge variant="outline" className="text-[10px]">শুধু দেখার জন্য</Badge>}
          {isCompleted && <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/30">সম্পন্ন</Badge>}
        </h4>
        <div className="flex items-center gap-2">
          {canChat && isSeller && (
            <Badge variant="outline" className="text-xs gap-1 bg-accent/10 text-accent border-accent/20">
              <Key className="w-3 h-3" /> ক্রেডেনশিয়াল পাঠাতে পারেন
            </Badge>
          )}
          {isParticipant && canChat && (
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <AlertTriangle className="w-3 h-3" /> রিপোর্ট
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" /> সমস্যা রিপোর্ট করুন
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  আপনার সমস্যা বিস্তারিত লিখুন। অ্যাডমিন দেখে সমাধান করবেন।
                </p>
                <Textarea
                  placeholder="আপনার সমস্যা বর্ণনা করুন..."
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  rows={4}
                />
                <Button
                  className="gradient-primary text-primary-foreground border-0"
                  onClick={submitReport}
                  disabled={reportSending || !reportMessage.trim()}
                >
                  {reportSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  রিপোর্ট পাঠান
                </Button>
              </DialogContent>
            </Dialog>
          )}
          {!isAdminView && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setChatOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="h-64 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {canChat ? "এখনো কোনো মেসেজ নেই। কথোপকথন শুরু করুন!" : "পেমেন্ট কনফার্ম হলে চ্যাট সক্রিয় হবে।"}
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSenderColor(msg.sender_id)}`}>
                    {getSenderLabel(msg.sender_id)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.is_credentials
                      ? "bg-accent/10 border border-accent/30 text-foreground"
                      : isMe
                      ? "bg-primary/10 text-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.is_credentials && (
                    <div className="flex items-center gap-1 text-[10px] text-accent font-semibold mb-1">
                      <Key className="w-3 h-3" /> অ্যাকাউন্ট ক্রেডেনশিয়াল
                    </div>
                  )}
                  <p className={`whitespace-pre-wrap break-words ${msg.is_credentials ? "font-mono text-xs" : ""}`}>
                    {msg.message}
                  </p>
                </div>
                {/* Message status - only show for own messages, not in admin view */}
                {!isAdminView && getMessageStatus(msg)}
              </div>
            );
          })
        )}
      </div>

      {/* Buyer confirm button */}
      {isBuyer && hasCredentials && !isCompleted && (
        <div className="border-t border-border p-3 bg-accent/5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              সেলার ক্রেডেনশিয়াল পাঠিয়েছে। চেক করে কনফার্ম করুন।
            </p>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground border-0 text-xs gap-1 shrink-0"
              onClick={confirmOrder}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> কনফার্ম করুন
            </Button>
          </div>
        </div>
      )}

      {/* Chat input */}
      {canChat && isParticipant && !isCompleted ? (
        <div className="border-t border-border p-3">
          {isSeller && (
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCredential}
                onChange={(e) => setIsCredential(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Key className="w-3 h-3" /> ক্রেডেনশিয়াল হিসেবে পাঠান (ইউজারনেম/পাসওয়ার্ড)
              </span>
            </label>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="মেসেজ লিখুন..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="text-sm"
            />
            <Button
              size="icon"
              className="gradient-primary text-primary-foreground border-0 shrink-0"
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="border-t border-border p-3 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            অর্ডার সম্পন্ন হয়েছে — চ্যাট বন্ধ
          </p>
        </div>
      ) : !canChat ? (
        <div className="border-t border-border p-3 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            পেমেন্ট কনফার্ম হলে চ্যাট সক্রিয় হবে
          </p>
        </div>
      ) : isAdminView ? (
        <div className="border-t border-border p-3 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            অ্যাডমিন শুধু চ্যাট দেখতে পারবেন, মেসেজ পাঠাতে পারবেন না
          </p>
        </div>
      ) : null}
    </div>
  );
}
