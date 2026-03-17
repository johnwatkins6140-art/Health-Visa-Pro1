import { Router } from "express";
import { createHmac } from "crypto";

const router = Router();

router.post("/paystack/verify", async (req, res) => {
  const { reference } = req.body as { reference?: string };

  if (!reference) {
    res.status(400).json({ error: "Payment reference is required" });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("[paystack] PAYSTACK_SECRET_KEY is not set");
    res.status(500).json({ error: "Payment configuration error" });
    return;
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = (await response.json()) as {
      status: boolean;
      data?: { status: string; amount: number; currency: string; customer?: { email: string } };
      message?: string;
    };

    if (data.status && data.data?.status === "success") {
      console.log(`[paystack] Payment verified: ${reference}, amount: ${data.data.amount / 100} ${data.data.currency}`);
      res.json({
        verified: true,
        reference,
        amount: data.data.amount / 100,
        currency: data.data.currency,
      });
    } else {
      console.warn(`[paystack] Payment not verified: ${reference}, status: ${data.data?.status}`);
      res.json({ verified: false, reference });
    }
  } catch (err: any) {
    console.error("[paystack] Verify error:", err?.message ?? err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

router.post("/paystack/webhook", async (req, res) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"] as string;

  if (!secretKey || !signature) {
    res.status(400).send("Missing configuration");
    return;
  }

  const rawBody = JSON.stringify(req.body);
  const expectedHash = createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  if (expectedHash !== signature) {
    console.warn("[paystack] Invalid webhook signature");
    res.status(401).send("Invalid signature");
    return;
  }

  const event = req.body as { event: string; data: Record<string, unknown> };
  console.log(`[paystack] Webhook received: ${event.event}`);

  if (event.event === "charge.success") {
    const ref = (event.data as any).reference as string;
    console.log(`[paystack] Charge success for reference: ${ref}`);
  }

  res.status(200).send("OK");
});

export default router;
