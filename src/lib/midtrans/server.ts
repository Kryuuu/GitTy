// ============================================
// GitTy — Midtrans Server Utils
// ============================================
import midtransClient from "midtrans-client";

let _snap: any = null;
let _core: any = null;

export function getMidtransSnap() {
  if (!_snap) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not set");
    }
    _snap = new midtransClient.Snap({
      isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
      serverKey: serverKey,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    });
  }
  return _snap;
}

export function getMidtransCore() {
  if (!_core) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not set");
    }
    _core = new midtransClient.CoreApi({
      isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
      serverKey: serverKey,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    });
  }
  return _core;
}

export async function createCheckoutSession({
  orgId,
  price,
  planId,
  orderId,
  customerEmail,
  customerName,
  successUrl,
}: {
  orgId: string;
  price: number;
  planId: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
}) {
  const snap = getMidtransSnap();
  
  const parameters = {
    transaction_details: {
      order_id: orderId,
      gross_amount: price,
    },
    credit_card: {
      secure: true
    },
    customer_details: {
      email: customerEmail || "customer@example.com",
      first_name: customerName || "Customer",
    },
    item_details: [
      {
        id: planId,
        price: price,
        quantity: 1,
        name: `GitTy ${planId.toUpperCase()} Plan Subscription`,
      }
    ],
    custom_field1: orgId,
    custom_field2: planId,
    callbacks: {
      finish: successUrl,
      error: successUrl,
      pending: successUrl,
    }
  };

  const transaction = await snap.createTransaction(parameters);
  return transaction;
}

export async function createQrisTransaction({
  orgId,
  price,
  planId,
  orderId,
  customerEmail,
  customerName,
}: {
  orgId: string;
  price: number;
  planId: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
}) {
  const core = getMidtransCore();
  
  const parameters = {
    payment_type: "gopay",
    transaction_details: {
      order_id: orderId,
      gross_amount: price,
    },
    customer_details: {
      email: customerEmail || "customer@example.com",
      first_name: customerName || "Customer",
    },
    item_details: [
      {
        id: planId,
        price: price,
        quantity: 1,
        name: `GitTy ${planId.toUpperCase()} Plan Subscription`,
      }
    ],
    custom_field1: orgId,
    custom_field2: planId,
  };

  const response = await core.charge(parameters);
  return response;
}
