import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });
  next();
});

(async () => {
  const httpServer = createServer(app);

  // In production, serve static files from 'dist/public' first.
  // This needs to be before API routes and the SPA fallback.
  if (process.env.NODE_ENV === "production") {
    const buildDir = path.resolve(process.cwd(), "dist/public");
    app.use(express.static(buildDir));
  }

  // Attach API routes
  await registerRoutes(app);

  // Vite for development, or SPA fallback for production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    // In production, all non-API, non-static routes fall back to index.html
    const buildDir = path.resolve(process.cwd(), "dist/public");
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(buildDir, "index.html"));
    });
  }

  // Cloud Run requires listening on process.env.PORT
  const port = parseInt(process.env.PORT || "8080", 10);

  httpServer.listen(port, "0.0.0.0", () => {
    log(`✅ Serving on port ${port}`);
  });
})();