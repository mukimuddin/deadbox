/** Create a Node.js server with Express, connect to MongoDB, and define routes for:

User authentication (JWT)

CRUD for dead letters (messages)

Trigger check (last activity)

Email sending logic with Nodemailer */

require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");
const letterRoutes = require("./routes/letterRoutes");
const triggerRoutes = require("./routes/triggerRoutes");

const app = express();

app.use(express.json());
app.use(require("cors")());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/triggers", triggerRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});