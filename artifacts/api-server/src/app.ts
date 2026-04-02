import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: process.env["PORT"] ?? "3000 (default)", env: process.env["NODE_ENV"] });
});

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(
    process.cwd(),
    "artifacts/uk-health-visa/dist/public",
  );
  app.use(express.static(staticPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

export default app;
