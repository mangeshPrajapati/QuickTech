import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

// Helper function to get icon component by name
const getIconByName = (iconName: string) => {
  return <span className={`fas ${iconName} text-xl`}></span>
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Fetch all services
  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Filter services based on search query and category
  const filteredServices = services?.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = services ? 
    ["all", ...new Set(services.map(service => service.category))] : 
    ["all"];

  return (
    <>
      <Navbar />
      
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Our Document Services
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Choose from our comprehensive range of document processing services
            </p>
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Services Grid */}
          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">Error loading services. Please try again later.</p>
              </div>
            ) : filteredServices && filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map(service => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-primary-100 rounded-md p-3 text-primary-600">
                          {getIconByName(service.icon)}
                        </div>
                        <CardTitle>{service.name}</CardTitle>
                      </div>
                      {service.badge && (
                        <Badge variant="outline" className={`bg-${service.badge_color}-100 text-${service.badge_color}-800 self-start mt-2`}>
                          {service.badge}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-700 mb-4">
                        {service.description}
                      </CardDescription>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Category:</span>
                          <span>{service.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Processing Time:</span>
                          <span>{service.processing_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Price:</span>
                          <span>₹{service.price}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/services/${service.id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services match your search. Try a different query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
