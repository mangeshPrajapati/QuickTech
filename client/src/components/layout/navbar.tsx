import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bolt } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Contact", href: "/#contact" },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <Bolt className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-xl text-primary-800 ml-2">QuickTech</span>
              </div>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    location === item.href || 
                    (item.href.startsWith("/#") && location === "/")
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}>
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <a className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </a>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <a className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                      Admin
                    </a>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <a className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                    Login
                  </a>
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary-700 hover:bg-primary-800">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="pt-2 pb-3 space-y-1">
                  {navItems.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <a 
                        className={cn(
                          "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                          location === item.href ||
                          (item.href.startsWith("/#") && location === "/")
                            ? "bg-primary-50 border-primary-500 text-primary-700"
                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                        )}
                        onClick={closeMobileMenu}
                      >
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4 space-x-4">
                    {user ? (
                      <>
                        <Link href="/dashboard">
                          <a 
                            className="text-gray-500 hover:text-gray-700 block py-2 text-base font-medium"
                            onClick={closeMobileMenu}
                          >
                            Dashboard
                          </a>
                        </Link>
                        {user.role === "admin" && (
                          <Link href="/admin">
                            <a 
                              className="text-gray-500 hover:text-gray-700 block py-2 text-base font-medium"
                              onClick={closeMobileMenu}
                            >
                              Admin
                            </a>
                          </Link>
                        )}
                        <Button 
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                          disabled={logoutMutation.isPending}
                          className="w-full"
                        >
                          {logoutMutation.isPending ? "Logging out..." : "Logout"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth">
                          <a 
                            className="text-gray-500 hover:text-gray-700 block py-2 text-base font-medium"
                            onClick={closeMobileMenu}
                          >
                            Login
                          </a>
                        </Link>
                        <Link href="/auth">
                          <Button 
                            className="w-full bg-primary-700 hover:bg-primary-800"
                            onClick={closeMobileMenu}
                          >
                            Sign Up
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
