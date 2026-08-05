import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import chatRouter from "./routes/chat";
import { authMiddleware } from "./middleware/auth";
import authRouter from "../artifacts/api-server/src/routes/auth";
import dashboardRouter from "../artifacts/api-server/src/routes/dashboard";
import resumesRouter from "../artifacts/api-server/src/routes/resumes";
import reportsRouter from "../artifacts/api-server/src/routes/reports";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  message: { error: "Too many requests, please try again in a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", authRouter);
app.use("/api", dashboardRouter);
app.use("/api/chat", chatRateLimiter, authMiddleware, chatRouter);
app.use("/api", resumesRouter);
app.use("/api", reportsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AI Career Assistant Server listening on port ${PORT}`);
});
