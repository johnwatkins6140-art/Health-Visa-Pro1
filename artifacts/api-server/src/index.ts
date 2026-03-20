import app from "./app";
import { runMigrations } from "./migrate";

const port = Number(process.env["PORT"] ?? 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

async function start() {
  try {
    await runMigrations();
    console.log("[startup] Migrations completed successfully");
  } catch (err: any) {
    console.warn("[startup] Migration warning:", err?.message ?? err);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log("========================================");
    console.log(`  Server is RUNNING on port ${port}`);
    console.log(`  NODE_ENV: ${process.env["NODE_ENV"]}`);
    console.log(`  Health: http://0.0.0.0:${port}/health`);
    console.log("========================================");
  });
}

start().catch((err) => {
  console.error("[startup] Fatal error:", err);
  process.exit(1);
});
