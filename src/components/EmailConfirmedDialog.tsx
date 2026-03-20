import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const EmailConfirmedDialog = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();

  useEffect(() => {
    // Supabase appends hash params like #access_token=...&type=signup
    const hash = window.location.hash;
    if (hash && hash.includes("type=signup")) {
      setOpen(true);
      // Clean the URL hash
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl">
            {lang === "bn" ? "🎉 ইমেইল যাচাই সফল!" : "🎉 Email Verified!"}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-base mt-2 space-y-2">
              <p>
                {lang === "bn"
                  ? "আপনার ইমেইল সফলভাবে যাচাই হয়েছে। এখন আপনি লগইন করে আপনার অ্যাকাউন্টে প্রবেশ করতে পারবেন।"
                  : "Your email has been verified successfully. You can now log in to access your account."}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Button
            className="w-full gradient-primary text-primary-foreground border-0 font-semibold"
            onClick={() => {
              setOpen(false);
              navigate("/login");
            }}
          >
            {lang === "bn" ? "লগইন করুন" : "Log In Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
