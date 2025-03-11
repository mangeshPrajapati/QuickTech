import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Order } from "@shared/schema";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import OrderList from "@/components/admin/order-list";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  ArrowUpDown, 
  Loader2, 
  AlertCircle, 
  Search, 
  Calendar, 
  Users, 
  FileText, 
  ClipboardCheck, 
  AlertTriangle, 
  Ban
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // Fetch all orders for admin
  const { 
    data: orders, 
    isLoading, 
    error,
    refetch: refetchOrders
  } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Filter and sort orders
  const filteredOrders = orders ? orders.filter(order => {
    // Filter by status
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query (by order ID or user ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return order.id.toString().includes(query) || 
             order.user_id.toString().includes(query);
    }
    
    return true;
  }).sort((a, b) => {
    // Sort orders
    switch (sortBy) {
      case "date-asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "date-desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "id-asc":
        return a.id - b.id;
      case "id-desc":
        return b.id - a.id;
      default:
        return 0;
    }
  }) : [];

  // Calculate dashboard stats
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === "pending").length || 0,
    processing: orders?.filter(o => o.status === "processing").length || 0,
    completed: orders?.filter(o => o.status === "completed").length || 0,
    cancelled: orders?.filter(o => o.status === "cancelled").length || 0,
    unpaid: orders?.filter(o => o.payment_status === "pending").length || 0,
  };

  if (!user || user.role !== "admin") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Access Denied</CardTitle>
              <CardDescription className="text-center">
                You don't have permission to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-2">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold">{stats.total}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-yellow-100 text-yellow-600 mr-3">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <h3 className="text-2xl font-bold">{stats.pending}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-purple-100 text-purple-600 mr-3">
                    <Loader2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Processing</p>
                    <h3 className="text-2xl font-bold">{stats.processing}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold">{stats.completed}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-red-100 text-red-600 mr-3">
                    <Ban className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cancelled</p>
                    <h3 className="text-2xl font-bold">{stats.cancelled}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-orange-100 text-orange-600 mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unpaid</p>
                    <h3 className="text-2xl font-bold">{stats.unpaid}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="all-orders">
            <TabsList className="mb-6">
              <TabsTrigger value="all-orders">All Orders</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-orders">
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    Manage and process all document service orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by ID..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full md:w-44">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger className="w-full md:w-44">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Newest first</SelectItem>
                        <SelectItem value="date-asc">Oldest first</SelectItem>
                        <SelectItem value="id-desc">ID (high to low)</SelectItem>
                        <SelectItem value="id-asc">ID (low to high)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-500 gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <p>Error loading orders. Please try again.</p>
                    </div>
                  ) : filteredOrders.length > 0 ? (
                    <OrderList orders={filteredOrders} onUpdate={refetchOrders} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium mb-1">No orders found</h3>
                      <p className="text-gray-500">
                        {searchQuery ? 
                          "No orders match your search criteria." : 
                          "There are no orders in the system yet."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Orders</CardTitle>
                  <CardDescription>
                    View all successfully completed document service orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-500 gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <p>Error loading orders. Please try again.</p>
                    </div>
                  ) : orders?.filter(o => o.status === "completed").length ? (
                    <OrderList 
                      orders={orders.filter(o => o.status === "completed")} 
                      onUpdate={refetchOrders}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <ClipboardCheck className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium mb-1">No completed orders</h3>
                      <p className="text-gray-500">There are no completed orders yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Orders</CardTitle>
                  <CardDescription>
                    Orders that need to be processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-500 gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <p>Error loading orders. Please try again.</p>
                    </div>
                  ) : orders?.filter(o => o.status === "pending").length ? (
                    <OrderList 
                      orders={orders.filter(o => o.status === "pending")} 
                      onUpdate={refetchOrders}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium mb-1">No pending orders</h3>
                      <p className="text-gray-500">There are no orders waiting to be processed.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="processing">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Orders</CardTitle>
                  <CardDescription>
                    Orders that are currently being processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-500 gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <p>Error loading orders. Please try again.</p>
                    </div>
                  ) : orders?.filter(o => o.status === "processing").length ? (
                    <OrderList 
                      orders={orders.filter(o => o.status === "processing")} 
                      onUpdate={refetchOrders}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Loader2 className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium mb-1">No processing orders</h3>
                      <p className="text-gray-500">There are no orders currently being processed.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
