// ============================================
// GitTy — Midtrans Client Utils
// ============================================
// Currently Midtrans usually loads snap.js from CDN.
// So we don't necessarily need a heavy client initializer like Stripe,
// but we keep this file for symmetry.

export function loadMidtransSnap(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById("midtrans-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "midtrans-script";
    script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}
