import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Wallet, TrendingUp, Clock, Send, Loader2, Banknote
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WithdrawalRequest {
  id: string;
  method: string;
  account: string;
  amount: number;
  status: "pending" | "completed" | "cancelled";
  date: string;
}

interface WalletPayoutsProps {
  totalEarned: number;
  pendingPayout: number;
}

const methodLabels: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "পেন্ডিং", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  completed: { label: "সম্পন্ন", className: "bg-green-500/20 text-green-500 border-green-500/30" },
  cancelled: { label: "বাতিল", className: "bg-red-500/20 text-red-500 border-red-500/30" },
};

export function WalletPayouts({ totalEarned, pendingPayout }: WalletPayoutsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [method, setMethod] = useState("bkash");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Demo history — in production this would come from a DB table
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);

  const withdrawable = totalEarned - pendingPayout;

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!account.trim() || account.trim().length < 11) {
      toast({ title: "ত্রুটি", description: "সঠিক অ্যাকাউন্ট নম্বর দিন (কমপক্ষে ১১ সংখ্যা)।", variant: "destructive" });
      return;
    }
    if (!amt || amt < 100) {
      toast({ title: "ত্রুটি", description: "সর্বনিম্ন উত্তোলন ১০০ টাকা।", variant: "destructive" });
      return;
    }
    if (amt > withdrawable) {
      toast({ title: "ত্রুটি", description: "উত্তোলনযোগ্য ব্যালেন্সের বেশি।", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));

    const newRequest: WithdrawalRequest = {
      id: crypto.randomUUID(),
      method,
      account: account.trim(),
      amount: amt,
      status: "pending",
      date: new Date().toLocaleDateString("bn-BD"),
    };
    setHistory(prev => [newRequest, ...prev]);
    setSubmitting(false);
    setModalOpen(false);
    setAccount("");
    setAmount("");
    toast({ title: "✅ উত্তোলন অনুরোধ জমা দেওয়া হয়েছে", description: "অ্যাডমিন শীঘ্রই প্রসেস করবে।" });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "মোট আয়", value: `৳${totalEarned.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "উত্তোলনযোগ্য ব্যালেন্স", value: `৳${Math.max(0, withdrawable).toLocaleString()}`, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
          { label: "পেন্ডিং পেআউট", value: `৳${pendingPayout.toLocaleString()}`, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        ].map((s, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Withdraw Button */}
      <div className="flex justify-end">
        <Button className="gradient-primary text-primary-foreground border-0 font-semibold gap-2" onClick={() => setModalOpen(true)}>
          <Send className="w-4 h-4" /> টাকা উত্তোলন করুন
        </Button>
      </div>

      {/* History Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" /> উত্তোলনের ইতিহাস
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-12 text-center">
              <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">এখনও কোনো উত্তোলন অনুরোধ নেই।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>মেথড</TableHead>
                    <TableHead>অ্যাকাউন্ট</TableHead>
                    <TableHead>পরিমাণ</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(row => {
                    const st = statusConfig[row.status];
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="text-sm">{row.date}</TableCell>
                        <TableCell className="text-sm font-medium">{methodLabels[row.method] || row.method}</TableCell>
                        <TableCell className="text-sm font-mono">{row.account}</TableCell>
                        <TableCell className="text-sm font-bold">৳{row.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${st.className}`}>{st.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> টাকা উত্তোলন
            </DialogTitle>
            <DialogDescription>
              উত্তোলনযোগ্য ব্যালেন্স: <span className="font-bold text-foreground">৳{Math.max(0, withdrawable).toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Method */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">পেমেন্ট মেথড</Label>
              <RadioGroup value={method} onValueChange={setMethod} className="flex gap-3">
                {(["bkash", "nagad", "rocket"] as const).map(m => (
                  <label
                    key={m}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      method === m
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <RadioGroupItem value={m} className="sr-only" />
                    <span className="text-sm font-medium">{methodLabels[m]}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="withdraw-account">অ্যাকাউন্ট নম্বর</Label>
              <Input
                id="withdraw-account"
                placeholder="01XXXXXXXXX"
                value={account}
                onChange={e => setAccount(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={15}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">পরিমাণ (৳)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="সর্বনিম্ন ১০০"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={100}
                max={withdrawable}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">বাতিল</Button>
            </DialogClose>
            <Button
              className="gradient-primary text-primary-foreground border-0 font-semibold gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "জমা হচ্ছে..." : "জমা দিন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
