const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const budgetsRoutes = require("./modules/budgets/budgets.routes");
const categoriesRoutes = require("./modules/categories/categories.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const transactionsRoutes = require("./modules/transactions/transactions.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/transactions", transactionsRoutes);

app.use(errorMiddleware);

module.exports = app;
