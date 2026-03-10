import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, LogOut, User, ShieldCheck, CheckCircle2, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navLinks = [
  { label: "হোম", href: "/" },
  { label: "মার্কেটপ্লেস", href: "/marketplace" },
  { label: "কিভাবে কাজ করে", href: "/how-it-works" },
  { label: "যোগাযোগ", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        setIsAdmin(!!data);
      });
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        setProfile(data);
      });
      supabase.from("orders").select("id, status")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .then(({ data }) => {
          const orders = data || [];
          setCompletedOrders(orders.filter(o => o.status === "completed").length);
          setPendingOrders(orders.filter(o => !["completed", "cancelled", "refunded"].includes(o.status)).length);
        });
    } else {
      setIsAdmin(false);
      setProfile(null);
    }
  }, [user]);

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long" })
    : "";

  const ProfileDropdown = () => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <Avatar className="w-9 h-9 border-2 border-primary/30 cursor-pointer hover:border-primary/60 transition-colors">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {(profile?.full_name || user?.email || "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="text-center mb-3">
          <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-primary/30">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {(profile?.full_name || user?.email || "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-bold text-foreground">{profile?.full_name || user?.email?.split("@")[0]}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-muted-foreground">সম্পন্ন অর্ডার:</span>
            <span className="font-bold text-foreground ml-auto">{completedOrders}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-muted-foreground">চলমান অর্ডার:</span>
            <span className="font-bold text-foreground ml-auto">{pendingOrders}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">যোগদান:</span>
            <span className="font-bold text-foreground ml-auto">{joinDate}</span>
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-1">
          <Link to="/dashboard" className="block">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs h-8">
              <User className="w-3.5 h-3.5" /> ড্যাশবোর্ড
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs h-8 text-primary">
                <ShieldCheck className="w-3.5 h-3.5" /> অ্যাডমিন
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs h-8 text-destructive" onClick={signOut}>
            <LogOut className="w-3.5 h-3.5" /> লগআউট
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">SAEM</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">লগইন</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-primary text-primary-foreground border-0">সাইন আপ</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <ProfileDropdown />}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">লগইন</Button>
                  </Link>
                  <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full gradient-primary text-primary-foreground border-0">সাইন আপ</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
