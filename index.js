import express from "express";
import mongoose from "mongoose";
import Lab5 from "./Lab5/index.js";
import cors from "cors";
import session from "express-session";
import "dotenv/config";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import UserModel from "./Kambaz/Users/model.js"; // import your User model for test route

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";

mongoose.connect(CONNECTION_STRING);

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const app = express();

app.use(cors({
  credentials: true,
  origin: process.env.NETLIFY_URL || "http://localhost:5173",
}));   

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}

app.use(express.json());   
app.use(session(sessionOptions));

// Simple test route to check DB connection and fetch 2 users
app.get('/test-db', async (req, res) => {
  try {
    const users = await UserModel.find().limit(2);
    res.json(users);
  } catch (error) {
    console.error('DB test failed:', error);
    res.status(500).send('DB test failed');
  }
});

Lab5(app);
UserRoutes(app);  
CourseRoutes(app);    
ModuleRoutes(app);               

app.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});
