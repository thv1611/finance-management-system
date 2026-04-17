const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./modules/auth/auth.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const budgetsRoutes = require("./modules/budgets/budgets.routes");
const categoriesRoutes = require("./modules/categories/categories.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const profileRoutes = require("./modules/profile/profile.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const transactionsRoutes = require("./modules/transactions/transactions.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/transactions", transactionsRoutes);

app.use(errorMiddleware);

module.exports = app;
