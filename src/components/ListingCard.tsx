import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ListingCardProps {
  type: string;
  typeIcon: React.ReactNode;
  title: string;
  price: string;
  verified: boolean;
}

export function ListingCard({
  type,
  typeIcon,
  title,
  price,
  verified,
}: ListingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card overflow-hidden group cursor-pointer"
    >
      <div className="h-1.5 gradient-primary" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {typeIcon}
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                {type}
              </p>
              <h3 className="text-sm font-bold text-foreground line-clamp-1">
                {title}
              </h3>
            </div>
          </div>
          {verified && (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">মূল্য</p>
            <p className="text-lg font-extrabold text-gradient-primary">{price}</p>
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0 shadow-lg">
            বিস্তারিত দেখুন
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
