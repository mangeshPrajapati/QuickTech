import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, Service, User } from "@shared/schema";
import OrderStatusBadge from "@/components/order/order-status-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  MoreVertical, 
  Clock, 
  CheckCircle, 
  Ban, 
  ExternalLink, 
  FileText,
  Download,
  File,
  UserCircle
} from "lucide-react";

interface OrderListProps {
  orders: Order[];
  onUpdate: () => void;
}

export default function OrderList({ orders, onUpdate }: OrderListProps) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all services to display service names
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Get service name by ID
  const getServiceName = (serviceId: number) => {
    const service = services?.find(s => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };

  // Update order status
  const updateOrderStatus = async (orderId: number, status: string) => {
    setIsUpdating(true);
    
    try {
      await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      
      toast({
        title: "Status updated",
        description: `Order #${orderId} has been marked as ${status}.`,
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating the order status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format document file info
  const formatDocuments = (documents: any[]) => {
    return documents.map((doc, index) => ({
      id: index + 1,
      name: doc.originalname,
      size: formatFileSize(doc.size),
      type: doc.mimetype,
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{getServiceName(order.service_id)}</TableCell>
                <TableCell>{order.user_id}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      order.payment_status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.payment_status === "completed" ? "Paid" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>₹{order.total_amount}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      
                      {order.status === "pending" && (
                        <DropdownMenuItem 
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          disabled={isUpdating}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as Processing
                        </DropdownMenuItem>
                      )}
                      
                      {(order.status === "pending" || order.status === "processing") && (
                        <DropdownMenuItem 
                          onClick={() => updateOrderStatus(order.id, "completed")}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      
                      {order.status !== "cancelled" && order.status !== "completed" && (
                        <DropdownMenuItem 
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          disabled={isUpdating}
                          className="text-red-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{getServiceName(selectedOrder.service_id)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.created_at).toLocaleDateString()} at {new Date(selectedOrder.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Status</p>
                  <div>
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <Badge 
                    variant="outline" 
                    className={
                      selectedOrder.payment_status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {selectedOrder.payment_status === "completed" ? "Paid" : "Pending"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">User ID</p>
                  <div className="flex items-center">
                    <UserCircle className="h-4 w-4 mr-1" />
                    <p className="font-medium">{selectedOrder.user_id}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{selectedOrder.total_amount}</p>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h3 className="text-base font-medium mb-2">Uploaded Documents</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formatDocuments(selectedOrder.documents).map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center">
                            <File className="h-4 w-4 mr-2 text-blue-500" />
                            {doc.name}
                          </TableCell>
                          <TableCell>{doc.type.split('/')[1].toUpperCase()}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Download</span>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-base font-medium mb-2">Special Instructions</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <div className="flex flex-1 justify-start">
                  {selectedOrder.status === "pending" && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "processing");
                        setIsDetailsOpen(false);
                      }}
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      Mark as Processing
                    </Button>
                  )}
                  
                  {(selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "completed");
                        setIsDetailsOpen(false);
                      }}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700 ml-2"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Mark as Completed
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
