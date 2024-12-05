const express = require("express");
const connectDB = require("./config/db");
const userRoute = require("./routes/userRoute");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// Define Routes
app.use("/api", userRoute);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use(errorHandler);

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await connectDB;
    console.log("Connected to DB !");
  } catch (err) {
    console.log("Something went wrong while connecting to DB !");
  }
  console.log(`Server is runing on port ${PORT}`);
});
