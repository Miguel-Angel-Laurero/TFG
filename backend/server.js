require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const config = require("./config/config");
const { sequelize } = require("./src/models");
const routes = require("./src/routes");
const errorHandler = require("./src/middlewares/errorHandler.middleware");
const { initSocket } = require("./src/socket");

const app = express();
const httpServer = http.createServer(app);

// ── Middlewares globales ────────────────────────────────────────────────────
const corsOrigin = config.nodeEnv === "production"
  ? [config.clientUrl].concat(process.env.CORS_ORIGINS?.split(",").filter(Boolean) || [])
  : config.clientUrl;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

// ── Manejo de errores (debe ir al final) ───────────────────────────────────
app.use(errorHandler);

// ── Sincronizar BD y arrancar servidor ────────────────────────────────────
sequelize
  .sync({ alter: config.nodeEnv !== "production" })
  .then(() => {
    console.log("✅ Base de datos sincronizada");
    initSocket(httpServer, config.clientUrl);
    httpServer.listen(config.port, () => {
      console.log(`🚀 Servidor en http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar la BD:", err);
    process.exit(1);
  });
