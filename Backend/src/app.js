const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

module.exports = app;