import app from "./app";
import { runMigrations } from "./migrate";

const port = Number(process.env["PORT"] ?? 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

async function start() {
  try {
    await runMigrations();
  } catch (err: any) {
    console.warn("[startup] Migration warning:", err?.message ?? err);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
  });
}

start();
