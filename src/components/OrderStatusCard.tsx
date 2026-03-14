import { Badge } from "@/components/ui/badge";
import { OrderChat } from "@/components/OrderChat";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import {
  Clock, CreditCard, ShieldCheck, Truck, CheckCircle2, AlertTriangle, RotateCcw, XCircle
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

interface OrderStatusCardProps {
  order: Order;
  userId: string;
  onOrderComplete: (orderId: string) => void;
}

const statusSteps = ["pending", "payment_submitted", "payment_confirmed", "delivering", "completed"];

const statusConfig: Record<string, { icon: React.ReactNode; label: string; labelEn: string; bg: string; text: string; border: string }> = {
  pending: { icon: <Clock className="w-3.5 h-3.5" />, label: "পেন্ডিং", labelEn: "Pending", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20" },
  payment_submitted: { icon: <CreditCard className="w-3.5 h-3.5" />, label: "পেমেন্ট জমা", labelEn: "Payment Sent", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/20" },
  payment_confirmed: { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "পেমেন্ট নিশ্চিত", labelEn: "Confirmed", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20" },
  delivering: { icon: <Truck className="w-3.5 h-3.5" />, label: "ডেলিভারি চলছে", labelEn: "Delivering", bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-500/20" },
  delivered: { icon: <Truck className="w-3.5 h-3.5" />, label: "ডেলিভার্ড", labelEn: "Delivered", bg: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-500/20" },
  completed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "সম্পন্ন", labelEn: "Completed", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20" },
  disputed: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "ডিসপিউট", labelEn: "Disputed", bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-500/20" },
  refunded: { icon: <RotateCcw className="w-3.5 h-3.5" />, label: "রিফান্ড", labelEn: "Refunded", bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-500/20" },
  cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, label: "বাতিল", labelEn: "Cancelled", bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

const accentColors: Record<string, { from: string; via: string; border: string; glow: string }> = {
  pending: { from: "from-amber-400/60", via: "via-amber-500", border: "border-amber-300/30 dark:border-amber-500/20", glow: "rgba(245,158,11,0.08)" },
  payment_submitted: { from: "from-blue-400/60", via: "via-blue-500", border: "border-blue-300/30 dark:border-blue-500/20", glow: "rgba(59,130,246,0.08)" },
  payment_confirmed: { from: "from-emerald-400/60", via: "via-emerald-500", border: "border-emerald-300/30 dark:border-emerald-500/20", glow: "rgba(16,185,129,0.08)" },
  delivering: { from: "from-violet-400/60", via: "via-violet-500", border: "border-violet-300/30 dark:border-violet-500/20", glow: "rgba(139,92,246,0.08)" },
  delivered: { from: "from-cyan-400/60", via: "via-cyan-500", border: "border-cyan-300/30 dark:border-cyan-500/20", glow: "rgba(6,182,212,0.08)" },
  completed: { from: "from-green-400/60", via: "via-green-500", border: "border-green-300/30 dark:border-green-500/20", glow: "rgba(34,197,94,0.08)" },
  disputed: { from: "from-red-400/60", via: "via-red-500", border: "border-red-300/30 dark:border-red-500/20", glow: "rgba(239,68,68,0.08)" },
  refunded: { from: "from-orange-400/60", via: "via-orange-500", border: "border-orange-300/30 dark:border-orange-500/20", glow: "rgba(249,115,22,0.08)" },
  cancelled: { from: "from-muted-foreground/30", via: "via-muted-foreground/50", border: "border-border", glow: "rgba(0,0,0,0.03)" },
};

export function OrderStatusCard({ order, userId, onOrderComplete }: OrderStatusCardProps) {
  const { t, lang } = useLanguage();
  const isBuyer = order.buyer_id === userId;
  const config = statusConfig[order.status] || statusConfig.pending;
  const accent = accentColors[order.status] || accentColors.pending;
  const currentStepIndex = statusSteps.indexOf(order.status);
  const progressPercent = order.status === "completed" ? 100
    : order.status === "disputed" || order.status === "refunded" || order.status === "cancelled" ? 0
    : Math.max(0, ((currentStepIndex) / (statusSteps.length - 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl bg-card border ${accent.border} overflow-hidden`}
      style={{ boxShadow: `0 10px 30px ${accent.glow}, 0 4px 12px rgba(0,0,0,0.04)` }}
    >
      {/* Top accent line - color based on status */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent.from} ${accent.via} ${accent.from}`} />

      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Status & role badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md ${config.bg} ${config.text} border ${config.border}`}>
                {config.icon}
                <span>{lang === "bn" ? config.label : config.labelEn}</span>
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-secondary/80 text-secondary-foreground backdrop-blur-sm border border-border/30">
                {isBuyer ? t("dash.buyer") : t("dash.seller")}
              </div>
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-secondary/80 text-secondary-foreground backdrop-blur-sm border border-border/30">
                {t(`payment.${order.payment_method}`) !== `payment.${order.payment_method}` ? t(`payment.${order.payment_method}`) : order.payment_method}
              </div>
            </div>

            {/* Order ID */}
            <p className="text-xs text-muted-foreground font-mono tracking-wide">
              {t("dash.order_id")} <span className="text-foreground/70">#{order.id.slice(0, 8).toUpperCase()}</span>
            </p>

            {/* Payment reference */}
            {order.payment_reference && (
              <p className="text-xs text-muted-foreground">
                {t("dash.reference")}: <span className="font-mono text-foreground/80 bg-secondary/60 px-1.5 py-0.5 rounded">{order.payment_reference}</span>
              </p>
            )}

            {/* Admin notes */}
            {order.admin_notes && (
              <div className="inline-flex items-start gap-1.5 text-xs text-primary bg-primary/5 border border-primary/10 rounded-xl px-3 py-1.5">
                <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{t("dash.admin_note")}: {order.admin_notes}</span>
              </div>
            )}
          </div>

          {/* Amount & date */}
          <div className="text-right shrink-0 space-y-1">
            <p className="text-3xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ৳{Number(order.amount).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {new Date(order.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                year: "numeric", month: "short", day: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {!["disputed", "refunded", "cancelled"].includes(order.status) && (
          <div className="mb-5">
            {/* Bar */}
            <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/80"
                style={{
                  boxShadow: progressPercent > 0 ? "0 0 12px hsl(var(--primary) / 0.4), 0 0 4px hsl(var(--primary) / 0.3)" : "none"
                }}
              />
            </div>

            {/* Step labels */}
            <div className="flex justify-between mt-2.5">
              {statusSteps.map((s, idx) => {
                const isActive = idx <= currentStepIndex;
                const stepConf = statusConfig[s];
                return (
                  <div key={s} className="flex flex-col items-center gap-1" style={{ width: `${100 / statusSteps.length}%` }}>
                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      isActive
                        ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                        : "bg-muted-foreground/20"
                    }`} />
                    <span className={`text-[9px] leading-tight text-center transition-colors ${
                      isActive ? "text-foreground/80 font-medium" : "text-muted-foreground/50"
                    }`}>
                      {lang === "bn" ? (
                        idx === 0 ? t("dash.status_pending") :
                        idx === 1 ? t("dash.status_payment") :
                        idx === 2 ? t("dash.status_confirmed") :
                        idx === 3 ? t("dash.status_delivery") :
                        t("dash.status_completed")
                      ) : stepConf.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Chat */}
        <div className="mt-1">
          <OrderChat
            orderId={order.id}
            buyerId={order.buyer_id}
            sellerId={order.seller_id}
            orderStatus={order.status}
            onOrderComplete={() => onOrderComplete(order.id)}
          />
        </div>
      </div>
    </motion.div>
  );
}
