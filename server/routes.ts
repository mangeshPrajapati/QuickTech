import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { randomBytes } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as fs from "fs";

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const randomName = randomBytes(16).toString("hex");
    cb(null, `${randomName}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to check if user is authenticated
function isAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Helper function to check if user is admin
function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.get("/api/services/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const services = await storage.getServicesByCategory(category);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services by category" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the order belongs to the user or if the user is an admin
      if (order.user_id !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Upload documents and create order
  app.post("/api/orders", isAuthenticated, upload.array("documents", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Parse and validate order data
      const orderData = JSON.parse(req.body.orderData);
      const validationResult = insertOrderSchema.safeParse({
        ...orderData,
        user_id: req.user!.id,
        documents: files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        }))
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          errors: validationResult.error.errors 
        });
      }

      const order = await storage.createOrder(validationResult.data);
      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Admin routes
  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.patch("/api/admin/orders/:id/payment", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Invalid payment status" });
      }
      
      const updatedOrder = await storage.updatePaymentStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Payment processing route for Indian payment methods
  app.post("/api/payment/process", isAuthenticated, async (req, res) => {
    try {
      const { orderId, paymentMethod } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ 
          success: false,
          message: "Order ID is required" 
        });
      }
      
      if (!paymentMethod) {
        return res.status(400).json({ 
          success: false,
          message: "Payment method is required" 
        });
      }
      
      // Validate payment method
      const validPaymentMethods = ['upi', 'netbanking', 'card', 'wallet'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid payment method"
        });
      }

      const order = await storage.getOrder(parseInt(orderId));
      if (!order) {
        return res.status(404).json({ 
          success: false,
          message: "Order not found" 
        });
      }
      
      // Check if the order belongs to the current user
      if (order.user_id !== req.user!.id) {
        return res.status(403).json({ 
          success: false,
          message: "Not authorized to pay for this order" 
        });
      }
      
      // Check if the order is already paid
      if (order.payment_status === "completed") {
        return res.status(400).json({ 
          success: false,
          message: "Order is already paid" 
        });
      }

      // For now, simulate payment processing
      // In a real application, this would connect to a payment gateway API
      
      // Payment simulation logic (success rate 100% for now)
      const isPaymentSuccessful = true;
      
      if (!isPaymentSuccessful) {
        return res.status(400).json({
          success: false,
          message: "Payment failed. Please try again."
        });
      }
      
      // Mark the payment as completed
      const updatedOrder = await storage.updatePaymentStatus(order.id, "completed");
      
      res.json({
        success: true,
        message: "Payment processed successfully",
        order: updatedOrder
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ 
        success: false,
        message: "Error processing payment" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
