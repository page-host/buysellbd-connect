import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Send, Loader2, X, Headphones } from "lucide-react";

interface SupportMessage {
  id: string;
  user_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function SupportChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("support_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data);
      setUnreadCount(data.filter((m: SupportMessage) => !m.is_read && m.sender_id !== user.id).length);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchMessages();

    const channel = supabase
      .channel(`support-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` },
        () => fetchMessages()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!open || !user) return;
    const unread = messages.filter(m => !m.is_read && m.sender_id !== user.id);
    if (unread.length > 0) {
      Promise.all(
        unread.map(m => (supabase as any).from("support_messages").update({ is_read: true }).eq("id", m.id))
      ).then(() => {
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        setUnreadCount(0);
      });
    }
  }, [open, messages, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    const { error } = await (supabase as any).from("support_messages").insert({
      user_id: user.id,
      sender_id: user.id,
      message: newMessage.trim(),
    });
    setSending(false);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      setNewMessage("");
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Headphones className="w-6 h-6 text-primary-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "480px" }}>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-bold text-foreground">লাইভ সাপোর্ট</h4>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "250px", maxHeight: "340px" }}>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">আপনার সমস্যা লিখুন। অ্যাডমিন শীঘ্রই উত্তর দেবেন।</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${isMe ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                        {isMe ? "আপনি" : "সাপোর্ট"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${isMe ? "bg-primary/10 text-foreground" : "bg-secondary text-foreground"}`}>
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                    {isMe && (
                      <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                        {msg.is_read ? "সিন ✓✓" : "সেন্ট ✓"}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-border p-3">
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
        </div>
      )}
    </>
  );
}
