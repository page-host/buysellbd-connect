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
import logo from "@/assets/eye.png";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      toast({ title: "সাইন আপ সফল!", description: "লগইন করুন।" });
      navigate("/login");
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

          <p className="text-center text-sm text-muted-foreground">
            {t("signup.has_account")}{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">{t("signup.login_link")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
