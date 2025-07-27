const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');

const express = require('express');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');

const main = require('./config/dataBase');
const redisClient = require('./config/redis');

const authRouter = require('./routes/authRoutes');
const shopeRouter = require('./routes/shopRoutes');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const {rateLimiter} = require("./middleware");

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));


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


