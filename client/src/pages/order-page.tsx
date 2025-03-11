import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order, Service } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import OrderStatusBadge from "@/components/order/order-status-badge";
import PaymentForm from "@/components/payment-form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ArrowLeft, 
  ChevronRight, 
  CalendarDays, 
  File, 
  Download, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  FileText,
  CreditCard
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch order details
  const { 
    data: order, 
    isLoading: isOrderLoading, 
    error: orderError 
  } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
  });

  // Fetch service details if order exists
  const { 
    data: service, 
    isLoading: isServiceLoading, 
    error: serviceError 
  } = useQuery<Service>({
    queryKey: [`/api/services/${order?.service_id}`],
    enabled: !!order,
  });

  const isLoading = isOrderLoading || (!!order && isServiceLoading);
  const error = orderError || serviceError;

  // Handle payment success
  const handlePaymentSuccess = () => {
    if (!order) return;
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    
    // Close the payment dialog
    setIsPaymentDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Payment successful",
      description: "Your payment has been processed successfully.",
    });
    
    // Redirect to order success page
    navigate(`/order-success?orderId=${order.id}`);
  };
  
  // Handle payment error
  const handlePaymentError = (error: Error) => {
    toast({
      title: "Payment failed",
      description: error.message || "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      // Make API request to cancel order
      await apiRequest("PATCH", `/api/admin/orders/${order.id}/status`, {
        status: "cancelled"
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to cancel order",
        description: "There was an error cancelling your order. Please try again.",
        variant: "destructive",
      });
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

  // Check if order can be cancelled
  const canCancelOrder = order && ["pending", "processing"].includes(order.status);
  
  // Check if payment is required
  const requiresPayment = order && order.payment_status === "pending";

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Button variant="link" className="gap-1 p-0" onClick={() => navigate("/")}>
                    <span>Home</span>
                  </Button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Button variant="link" className="gap-1 p-0" onClick={() => navigate("/dashboard")}>
                    <span>Dashboard</span>
                  </Button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  Order #{order.id}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Order Details */}
            <div className="w-full md:w-2/3">
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
                    <CardDescription>
                      {service?.name || "Document Service"} - Created on {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <OrderStatusBadge status={order.status} size="lg" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Service Details</h3>
                      <p className="font-medium">{service?.name || "Document Service"}</p>
                      <p className="text-sm text-gray-600">{service?.description}</p>
                      <div className="flex gap-4 text-sm mt-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{service?.processing_time}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span>₹{order.total_amount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Order Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Order Placed</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex">
                          <div className={`flex-shrink-0 h-6 w-6 rounded-full ${order.status !== "pending" ? "bg-green-100" : "bg-gray-100"} flex items-center justify-center`}>
                            {order.status !== "pending" ? (
                              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Processing</p>
                            <p className="text-xs text-gray-500">
                              {order.status === "pending" ? "Waiting to start" : 
                               order.status === "processing" ? "In progress" :
                               order.status === "completed" ? "Completed" :
                               "Cancelled"}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          <div className={`flex-shrink-0 h-6 w-6 rounded-full ${order.status === "completed" ? "bg-green-100" : "bg-gray-100"} flex items-center justify-center`}>
                            {order.status === "completed" ? (
                              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">Completed</p>
                            <p className="text-xs text-gray-500">
                              {order.status === "completed" ? "Your documents are ready" : "Waiting for processing to complete"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents */}
                  <div className="mt-8">
                    <h3 className="text-base font-medium mb-3">Uploaded Documents</h3>
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
                          {formatDocuments(order.documents).map((doc) => (
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
                  {order.notes && (
                    <div className="mt-8">
                      <h3 className="text-base font-medium mb-3">Special Instructions</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Required Documents Notice */}
              {service && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-md text-blue-800">
                      <h4 className="font-medium mb-2">The following documents are required for this service:</h4>
                      <p className="text-sm">{service.requirements}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Payment and Action Sidebar */}
            <div className="w-full md:w-1/3">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.payment_status === "completed" ? "Paid" : "Pending"}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Service fee</span>
                      <span>₹{order.total_amount}</span>
                    </div>
                    <div className="flex justify-between py-2 font-medium text-lg">
                      <span>Total</span>
                      <span>₹{order.total_amount}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {requiresPayment && (
                      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Complete Payment</DialogTitle>
                            <DialogDescription>
                              Make a payment to process your document order
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-2">
                            <div className="bg-gray-50 p-4 rounded-md mb-4">
                              <h3 className="font-medium mb-2">Order Summary</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Service:</span>
                                  <span>{service?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Order ID:</span>
                                  <span>#{order.id}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Amount:</span>
                                  <span>₹{order.total_amount}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* New Indian payment form component */}
                            <PaymentForm 
                              orderId={order.id}
                              amount={order.total_amount}
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {canCancelOrder && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                            Cancel Order
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel your document processing order. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Nevermind</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={handleCancelOrder}
                            >
                              Cancel Order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
