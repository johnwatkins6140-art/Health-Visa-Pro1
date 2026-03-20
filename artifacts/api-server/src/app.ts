import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
