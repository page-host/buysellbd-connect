import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2, X, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface SupportMessage {
  id: string;
  user_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (lang === "bn") {
    if (mins < 1) return "এইমাত্র";
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ঘণ্টা আগে`;
    return `${Math.floor(hrs / 24)} দিন আগে`;
  }
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SupportChat() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if user is admin
  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  const quickMessages = [t("support.quick1"), t("support.quick2"), t("support.quick3"), t("support.quick4")];

  // Reactively compute unread count whenever messages change
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const count = messages.filter(m => !m.is_read && m.sender_id !== user.id).length;
    setUnreadCount(count);
  }, [messages, user]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("support_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchMessages();

    const channel = supabase
      .channel(`support-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` }, (payload: any) => {
        const newMsg = payload.new as SupportMessage;
        if (newMsg.sender_id === user.id) return;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` }, (payload: any) => {
        const updated = payload.new as SupportMessage;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Mark messages as read when chat is open
  const markingRef = useRef(false);
  useEffect(() => {
    if (!open || !user || markingRef.current) return;
    const unread = messages.filter(m => !m.is_read && m.sender_id !== user.id);
    if (unread.length === 0) return;
    markingRef.current = true;

    const markRead = async () => {
      try {
        const results = await Promise.all(
          unread.map(m => (supabase as any).from("support_messages").update({ is_read: true }).eq("id", m.id))
        );
        // Check if any updates failed
        const allSuccess = results.every((r: any) => !r.error);
        if (allSuccess) {
          setMessages(prev => prev.map(m => m.sender_id !== user.id ? { ...m, is_read: true } : m));
        } else {
          // Re-fetch to get actual DB state
          await fetchMessages();
        }
      } catch {
        await fetchMessages();
      } finally {
        markingRef.current = false;
      }
    };
    markRead();
  }, [open, user, messages, fetchMessages]);

  const sendMessage = async (msgText?: string) => {
    const text = (msgText || newMessage).trim();
    if (!text || !user) return;
    setNewMessage("");
    setSending(true);

    const tempId = crypto.randomUUID();
    const optimistic: SupportMessage = { id: tempId, user_id: user.id, sender_id: user.id, message: text, is_read: false, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);

    const { data, error } = await (supabase as any).from("support_messages").insert({ user_id: user.id, sender_id: user.id, message: text }).select().single();
    setSending(false);
    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  // Don't render support chat for admin users
  if (isAdmin) return null;

  if (!user) {
    return (
      <>
        {!open && (
          <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
            <Headphones className="w-6 h-6 text-primary-foreground" />
          </button>
        )}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} transition={{ duration: 0.2 }} className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "480px" }}>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gradient-primary rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-primary-foreground" />
                  <h4 className="text-sm font-bold text-primary-foreground">{t("support.title")}</h4>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: "250px" }}>
                <Headphones className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">{t("support.login_msg")}</p>
                <Link to="/login">
                  <Button className="gradient-primary text-primary-foreground border-0">{t("nav.login")}</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      {!open && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <Headphones className="w-6 h-6 text-primary-foreground" />
          {unreadCount > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {unreadCount}
            </motion.span>
          )}
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} transition={{ duration: 0.2 }} className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "520px" }}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gradient-primary rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Headphones className="w-5 h-5 text-primary-foreground" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-foreground">{t("support.title")}</h4>
                  <p className="text-[10px] text-primary-foreground/70">{t("support.subtitle")}</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "250px", maxHeight: "340px" }}>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Headphones className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{t("support.welcome")}</p>
                  <p className="text-xs text-muted-foreground mb-4">{t("support.welcome_msg")}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickMessages.map((qm, i) => (
                      <button key={i} onClick={() => sendMessage(qm)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors">
                        {qm}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_id === user.id;
                  const showTime = idx === 0 || new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 300000;
                  return (
                    <div key={msg.id}>
                      {showTime && <p className="text-center text-[10px] text-muted-foreground/60 my-2">{timeAgo(msg.created_at, lang)}</p>}
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"}`}>
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 px-1">
                          <span className="text-[9px] text-muted-foreground/60">
                            {new Date(msg.created_at).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && <span className="text-[9px] text-muted-foreground/60">{msg.is_read ? "✓✓" : "✓"}</span>}
                        </div>
                      </motion.div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <Input
                  placeholder={t("support.input_placeholder")}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="text-sm rounded-full bg-secondary/50"
                />
                <Button size="icon" className="gradient-primary text-primary-foreground border-0 shrink-0 rounded-full" onClick={() => sendMessage()} disabled={sending || !newMessage.trim()}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
