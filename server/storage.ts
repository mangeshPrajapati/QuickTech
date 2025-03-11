import { users, type User, type InsertUser, services, type Service, type InsertService, orders, type Order, type InsertOrder } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private orders: Map<number, Order>;
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private serviceIdCounter: number;
  private orderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.orders = new Map();
    this.userIdCounter = 1;
    this.serviceIdCounter = 1;
    this.orderIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Pre-populate services
    this.initializeServices();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      role: "user", 
      created_at: now 
    };
    this.users.set(id, user);
    return user;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.category === category
    );
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const now = new Date();
    const service: Service = { ...insertService, id, created_at: now };
    this.services.set(id, service);
    return service;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.user_id === userId
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: "pending", 
      payment_status: "pending", 
      created_at: now, 
      updated_at: now 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status, 
      updated_at: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      payment_status: status, 
      updated_at: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Pre-populate services
  private initializeServices() {
    const services: InsertService[] = [
      {
        name: "Aadhaar Card",
        description: "New applications, corrections, updates and more for your Aadhaar card.",
        category: "Identity",
        price: 500,
        processing_time: "2-3 days",
        requirements: "Address proof, identity proof, and recent photograph",
        icon: "fa-id-card",
        badge: "Fast Processing",
        badge_color: "green"
      },
      {
        name: "PAN Card",
        description: "Apply for new PAN card, correction in existing card and PAN-Aadhaar linking.",
        category: "Identity",
        price: 750,
        processing_time: "4-5 days",
        requirements: "Identity proof, address proof, and recent photograph",
        icon: "fa-credit-card",
        badge: "Government Authorized",
        badge_color: "blue"
      },
      {
        name: "Driving License",
        description: "New learner's license, permanent license, renewals and international permits.",
        category: "Licenses",
        price: 1200,
        processing_time: "7-10 days",
        requirements: "Age proof, address proof, identity proof, and medical certificate",
        icon: "fa-id-badge",
        badge: "Complete Assistance",
        badge_color: "yellow"
      },
      {
        name: "CSC Services",
        description: "All Common Service Center (CSC) services including certificates and registrations.",
        category: "Government",
        price: 600,
        processing_time: "3-5 days",
        requirements: "Varies depending on specific service required",
        icon: "fa-building",
        badge: "Multiple Services",
        badge_color: "purple"
      },
      {
        name: "Passport",
        description: "New passport application, renewal and other passport-related services.",
        category: "Travel",
        price: 2500,
        processing_time: "10-15 days",
        requirements: "Address proof, identity proof, birth certificate, and photographs",
        icon: "fa-passport",
        badge: "Priority Service",
        badge_color: "red"
      },
      {
        name: "Certificates",
        description: "Birth, death, income, caste, domicile and other essential certificates.",
        category: "Government",
        price: 400,
        processing_time: "2-4 days",
        requirements: "Supporting documents depending on certificate type",
        icon: "fa-scroll",
        badge: "Digital Delivery",
        badge_color: "green"
      },
      {
        name: "Property Documents",
        description: "Land records, property registration, mutation and related services.",
        category: "Property",
        price: 3000,
        processing_time: "15-20 days",
        requirements: "Property details, ownership proof, and identity documents",
        icon: "fa-house-user",
        badge: "Expert Assistance",
        badge_color: "blue"
      },
      {
        name: "Business Services",
        description: "GST registration, company registration, MSME registration and more.",
        category: "Business",
        price: 5000,
        processing_time: "7-14 days",
        requirements: "Business details, address proof, and identity documents",
        icon: "fa-briefcase",
        badge: "Business Solutions",
        badge_color: "indigo"
      }
    ];

    services.forEach(service => {
      this.createService(service);
    });
  }
}

export const storage = new MemStorage();
