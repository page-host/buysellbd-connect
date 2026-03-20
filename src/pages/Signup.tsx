import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import logo from "@/assets/eye.png";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisposableEmail(email)) {
      toast({ title: "ত্রুটি", description: "অস্থায়ী/ফেক ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করা যাবে না।", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "সাইন আপ ব্যর্থ", description: error.message, variant: "destructive" });
    } else if (data.session) {
      toast({ title: "সাইন আপ সফল!" });
      navigate("/");
    } else {
      setShowConfirmDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="SAEM Logo" className="h-20 w-auto object-contain mix-blend-multiply" />
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">{t("signup.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("signup.subtitle")}</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("signup.name")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder={t("signup.name_placeholder")} className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("signup.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("signup.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder={t("signup.password_placeholder")} className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 font-semibold" disabled={loading}>
              {loading ? t("signup.loading") : t("signup.btn")}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{lang === "bn" ? "অথবা" : "or"}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 font-semibold gap-2"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin },
              });
              if (error) {
                toast({ title: "Google সাইন আপ ব্যর্থ", description: error.message, variant: "destructive" });
              }
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {lang === "bn" ? "Google দিয়ে সাইন আপ" : "Sign up with Google"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("signup.has_account")}{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">{t("signup.login_link")}</Link>
          </p>
        </div>
      </div>

      {/* Email Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {lang === "bn" ? "📧 ইমেইল যাচাই করুন" : "📧 Verify Your Email"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-base mt-2 space-y-3">
                <p>
                  {lang === "bn"
                    ? `আমরা ${email} এ একটি যাচাই লিংক পাঠিয়েছি।`
                    : `We've sent a verification link to ${email}.`}
                </p>
                <p className="text-muted-foreground text-sm">
                  {lang === "bn"
                    ? "আপনার ইমেইল চেক করুন এবং লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন। ইমেইল না পেলে স্প্যাম ফোল্ডারও দেখুন!"
                    : "Check your inbox and click the link to activate your account. Don't forget to check your spam folder!"}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              className="w-full gradient-primary text-primary-foreground border-0 font-semibold"
              onClick={() => {
                setShowConfirmDialog(false);
                navigate("/login");
              }}
            >
              {lang === "bn" ? "বুঝেছি, লগইন পেজে যাই" : "Got it, go to Login"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
