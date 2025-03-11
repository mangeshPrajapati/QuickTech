import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bolt, MapPin, Phone, Mail } from "lucide-react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedin 
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900" id="contact">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <Bolt className="h-6 w-6 text-orange-500" />
              <span className="font-bold text-xl text-white ml-2">QuickTech</span>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              QuickTech provides fast, reliable document processing services for all your essential government and personal documents.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Services
            </h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/services"><a className="text-base text-gray-400 hover:text-white">Aadhaar Card</a></Link></li>
              <li><Link href="/services"><a className="text-base text-gray-400 hover:text-white">PAN Card</a></Link></li>
              <li><Link href="/services"><a className="text-base text-gray-400 hover:text-white">Driving License</a></Link></li>
              <li><Link href="/services"><a className="text-base text-gray-400 hover:text-white">CSC Services</a></Link></li>
              <li><Link href="/services"><a className="text-base text-gray-400 hover:text-white">Passport</a></Link></li>
              <li><Link href="/services"><a className="text-base text-gray-400 hover:text-white">Business Documents</a></Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-base text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Partners</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Press</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 text-orange-500 mr-3" />
                <span>123 Main Street, New Delhi, India</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 text-orange-500 mr-3" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 text-orange-500 mr-3" />
                <span>info@quicktech.com</span>
              </li>
              <li className="mt-6">
                <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Subscribe</h4>
                <div className="mt-2 flex flex-col sm:flex-row lg:flex-col xl:flex-row">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="px-4 py-2 text-gray-800 w-full sm:max-w-xs rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button 
                    className="mt-2 sm:mt-0 sm:ml-2 lg:mt-2 lg:ml-0 xl:mt-0 xl:ml-2 px-4 py-2 bg-primary-600 hover:bg-primary-700"
                  >
                    Subscribe
                  </Button>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} QuickTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
