import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import aiRoutes from "./routes/aiRoutes.js"; 
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://smart-learn-hub-web.vercel.app',
  'https://smart-learn-hub-isqlbv085-rohit-s-projects-ecacb526.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow server-to-server or curl requests

    const allowedOrigins = [
      "http://localhost:3000",
      "https://smart-learn-hub-web.vercel.app",
      "https://smart-learn-hub-isqlbv085-rohit-s-projects-ecacb526.vercel.app"
    ];

    // Allow any vercel preview deployment
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) || 
      /\.onrender\.com$/.test(origin) // also allow your Render backend domain
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
if (noteRoutes) app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Global error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
});

async function start(){
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }  
} 

start();
