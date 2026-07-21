import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { api } from "./routes/api.js";
import { startPoller } from "./poller.js";
import { log } from "./logger.js";
import "./db.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, "..", "public");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.raw({ type: "image/*", limit: "25mb" }));
app.use("/api", api);
app.use(express.static(publicDir));

app.listen(config.port, () => {
  log.info(`◤ COMBAT RECORD TERMINAL ◢ online at http://localhost:${config.port}`);
  startPoller();
});
