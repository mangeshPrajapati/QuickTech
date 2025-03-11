import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, ChevronRight, AlertCircle, FileText, Clock, DollarSign, CheckCircle } from "lucide-react";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch service details
  const { data: service, isLoading, error } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
  });

  const handleOrderNow = () => {
    if (user) {
      // Navigate to dashboard with service selected
      navigate(`/dashboard?service=${id}`);
    } else {
      // Redirect to auth page
      navigate("/auth");
    }
  };

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

  if (error || !service) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/services")}>Browse All Services</Button>
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
          <nav className="flex items-center text-sm font-medium mb-6">
            <Button variant="link" onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-700">
              Home
            </Button>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <Button variant="link" onClick={() => navigate("/services")} className="text-gray-500 hover:text-gray-700">
              Services
            </Button>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            <span className="text-gray-900">{service.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Details */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-4 text-primary-600">
                    <i className={`fas ${service.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                    <p className="text-gray-600">{service.category}</p>
                  </div>
                </div>
                
                {service.badge && (
                  <Badge variant="outline" className={`bg-${service.badge_color}-100 text-${service.badge_color}-800 mb-4`}>
                    {service.badge}
                  </Badge>
                )}

                <div className="prose max-w-none mt-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-700">{service.description}</p>
                  
                  <h2 className="text-lg font-semibold mt-6 mb-3">Required Documents</h2>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700">{service.requirements}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Processing Time</p>
                        <p className="text-gray-800">{service.processing_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-green-700 font-medium">Service Fee</p>
                        <p className="text-gray-800">₹{service.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What documents do I need to submit?</AccordionTrigger>
                    <AccordionContent>
                      {service.requirements}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How long does the process take?</AccordionTrigger>
                    <AccordionContent>
                      This service typically takes {service.processing_time} to process after we receive all required documents. Urgent processing options may be available for an additional fee.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>What happens after I submit my documents?</AccordionTrigger>
                    <AccordionContent>
                      After submission, our team reviews your documents and begins processing. You can track the status of your application from your dashboard. We'll notify you of any updates or additional requirements.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Are there any additional fees?</AccordionTrigger>
                    <AccordionContent>
                      The price displayed (₹{service.price}) includes our service fee. Government fees or taxes may apply separately and will be clearly communicated before payment.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>What format should I upload my documents in?</AccordionTrigger>
                    <AccordionContent>
                      Please upload documents in PDF, JPG, or PNG format. Each file should be clear, complete, and under 5MB in size. Ensure all text is legible and the entire document is visible.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-span-1">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between pb-4 border-b border-gray-200">
                      <span className="text-gray-600">Service</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex justify-between pb-4 border-b border-gray-200">
                      <span className="text-gray-600">Processing Time</span>
                      <span>{service.processing_time}</span>
                    </div>
                    <div className="flex justify-between pb-4 border-b border-gray-200 text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold">₹{service.price}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-lg" 
                    onClick={handleOrderNow}
                  >
                    {user ? "Order Now" : "Sign In to Order"}
                  </Button>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>24/7 Customer Support</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>100% Satisfaction Guarantee</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                      <p>Need help with this service? Call us at +91 98765 43210 or contact our support team.</p>
                    </div>
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
