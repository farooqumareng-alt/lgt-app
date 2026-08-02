import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  INVOICED: "Invoiced — Awaiting Payment",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const variant = status === "CANCELLED" || status === "REFUNDED" ? "muted" : "outline";
  return <Badge variant={variant}>{LABELS[status] ?? status}</Badge>;
}
