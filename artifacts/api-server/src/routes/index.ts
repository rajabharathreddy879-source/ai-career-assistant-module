import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import chatRouter from "./chat";
import resumesRouter from "./resumes";
import reportsRouter from "./reports";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 15,
  message: { error: "Too many requests, please try again in a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use("/chat", chatRateLimiter, authMiddleware, chatRouter);
router.use(resumesRouter);
router.use(reportsRouter);

export default router;
