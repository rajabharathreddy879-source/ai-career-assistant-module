import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

app.listen(port, () => {
  logger.info({ port }, "AI Career Assistant Server listening cleanly");
});
