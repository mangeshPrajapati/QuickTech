import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

interface OrderStatusBadgeProps {
  status: string;
  size?: "default" | "sm" | "lg";
}

const statusVariants = cva("", {
  variants: {
    status: {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      processing: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      completed: "bg-green-100 text-green-800 hover:bg-green-100",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    size: {
      default: "px-2.5 py-0.5 text-xs",
      sm: "px-2 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    },
  },
  defaultVariants: {
    status: "pending",
    size: "default",
  },
});

export default function OrderStatusBadge({ status, size = "default" }: OrderStatusBadgeProps) {
  // Make sure status is one of the valid statuses
  const validStatus = ["pending", "processing", "completed", "cancelled"].includes(status) 
    ? (status as OrderStatus) 
    : "pending";
  
  // Get status label
  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  return (
    <Badge 
      variant="outline"
      className={statusVariants({ status: validStatus, size })}
    >
      {getStatusLabel(validStatus)}
    </Badge>
  );
}
