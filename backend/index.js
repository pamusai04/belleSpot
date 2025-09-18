
const mongoose = require('mongoose');

const express = require('express');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const session = require('express-session'); 

const main = require('./src/config/dataBase');
const redisClient = require('./src/config/redis');

const authRouter = require('./src/routes/authRoutes');
const shopeRouter = require('./src/routes/shopRoutes');
const userRouter = require('./src/routes/userRoutes');
const adminRouter = require('./src/routes/adminRoutes');
const {rateLimiter} = require("./src/middleware");

const cors = require('cors');
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://bellespot.onrender.com'
  
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};


app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(rateLimiter);


app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/shop", shopeRouter); 
app.use("/admin", adminRouter);

const initializeConnections = async () => {
  try {
    await main();
    console.log("✅ MongoDB connected");
  } catch (mongoError) {
    console.error("❌ MongoDB connection failed:", mongoError);
  }

  try {
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (redisError) {
    console.error("❌ Redis connection failed:", redisError);
  }
  
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
    
  });
};
initializeConnections();


