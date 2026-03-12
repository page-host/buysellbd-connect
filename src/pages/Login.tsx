import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/eye.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisposableEmail(email)) {
      toast({ title: "ত্রুটি", description: "অস্থায়ী/ফেক ইমেইল ব্যবহার করা যাবে না।", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "লগইন ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="SAEM Logo" className="h-20 w-auto object-contain mix-blend-multiply" />
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">{t("login.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("login.subtitle")}</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("login.forgot")}</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground border-0 font-semibold" disabled={loading}>
              {loading ? t("login.loading") : t("login.btn")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("login.no_account")}{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">{t("login.signup_link")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
