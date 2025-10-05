const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const app = express();

const { sequelize, connectDB } = require("./config/db");
const initializeTables = require("./utils/initializeTables");
const dashboardRoutes = require("./routes/admin/dashboardRoutes");
const menuRoutes = require("./routes/admin/menuRoutes");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const reservationRoutes = require("./routes/staff/reservationRoutes");
const tableRoutes = require("./routes/staff/tableRoutes");
const userProfile = require("./routes/usersRoutes");
const orderItemRoutes = require("./routes/staff/orderItemRoutes");
const billRoutes = require("./routes/staff/billRoutes");

const menuController = require("./controllers/menuController");
const paymentRoutes = require("./routes/staff/paymentRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

app.use(cors());
app.use(express.json());

// Endpoint để lấy Cloudinary upload preset
app.get("/cloudinary-upload-preset", (req, res) => {
  try {
    const preset = {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    };
    res.status(200).json(preset);
  } catch (error) {
    console.error("Error fetching Cloudinary preset:", error.message);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin Cloudinary",
      error: error.message,
    });
  }
});

app.use("/dashboard", dashboardRoutes);
app.use("/menu", menuRoutes);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/reservation", reservationRoutes);
app.use("/table", tableRoutes);
app.use("/user", userProfile);
app.use("/order-item", orderItemRoutes);
app.use("/bill", billRoutes);
app.use("/user", userProfile );
app.use('/order-item', orderItemRoutes);
app.use("/bill", billRoutes); 
app.use("/payment", paymentRoutes); 
app.use("/chatbot", chatbotRoutes);

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Đã xảy ra lỗi server!" });
});

// Khởi động server
async function startServer() {
  try {
    await connectDB();
    await initializeTables();

    // const Menu = require("./models/Menu")(sequelize);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server chạy trên port ${PORT}`));
  } catch (error) {
    console.error("Không thể khởi động server:", error);
    process.exit(1);
  }
}

startServer();
