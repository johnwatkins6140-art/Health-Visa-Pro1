import { Router } from "express";

const router = Router();

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`PayPal auth failed: ${data.error ?? "unknown error"}`);
  }

  return data.access_token;
}

router.post("/paypal/create-order", async (req, res) => {
  const { amount } = req.body as { amount?: number };

  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Valid amount is required" });
    return;
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            description: "UK Visa Application Fee",
          },
        ],
      }),
    });

    const order = (await response.json()) as { id?: string; message?: string };
    if (!order.id) {
      console.error("[paypal] Create order failed:", order);
      res.status(500).json({ error: "Failed to create PayPal order" });
      return;
    }

    console.log(`[paypal] Order created: ${order.id}`);
    res.json({ id: order.id });
  } catch (err: any) {
    console.error("[paypal] Create order error:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "PayPal error" });
  }
});

router.post("/paypal/capture-order", async (req, res) => {
  const { orderID } = req.body as { orderID?: string };

  if (!orderID) {
    res.status(400).json({ error: "orderID is required" });
    return;
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = (await response.json()) as {
      status?: string;
      id?: string;
      purchase_units?: Array<{
        payments?: {
          captures?: Array<{ id: string; amount: { value: string; currency_code: string } }>;
        };
      }>;
    };

    if (data.status === "COMPLETED") {
      const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
      console.log(
        `[paypal] Payment captured: ${orderID}, amount: ${capture?.amount.value} ${capture?.amount.currency_code}`
      );
      res.json({ verified: true, orderID, reference: orderID });
    } else {
      console.warn(`[paypal] Capture not completed: ${orderID}, status: ${data.status}`);
      res.json({ verified: false, orderID });
    }
  } catch (err: any) {
    console.error("[paypal] Capture error:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "PayPal capture error" });
  }
});

export default router;
