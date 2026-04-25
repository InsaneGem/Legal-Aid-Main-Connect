// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import Razorpay from "npm:razorpay";

// const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
// const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

// serve(async (req) => {
//     try {
//         const { action, consultation_id } = await req.json();

//         const razorpay = new Razorpay({
//             key_id: RAZORPAY_KEY_ID!,
//             key_secret: RAZORPAY_KEY_SECRET!,
//         });

//         if (action === "create_order") {
//             const order = await razorpay.orders.create({
//                 amount: 500 * 100,
//                 currency: "INR",
//                 receipt: `receipt_${consultation_id}`,
//             });

//             return new Response(JSON.stringify({
//                 order_id: order.id,
//                 amount: order.amount,
//                 currency: order.currency,
//                 key_id: RAZORPAY_KEY_ID,
//             }), {
//                 headers: { "Content-Type": "application/json" },
//             });
//         }

//         if (action === "verify_payment") {
//             return new Response(JSON.stringify({ success: true }), {
//                 headers: { "Content-Type": "application/json" },
//             });
//         }

//         return new Response("Invalid action", { status: 400 });

//     } catch (err: any) {
//         return new Response(JSON.stringify({ error: err.message }), {
//             status: 500,
//         });
//     }
// });

// supabase/functions/razorpay/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// import { createHmac } from "node:crypto";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper: always return 200 with { ok, ... } so the client can read the body
function respond(ok: boolean, payload: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify({ ok, ...payload }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (req) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // ---------- ENV ----------
        const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
        const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            return respond(false, { error: "Razorpay keys not configured" });
        }
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
            return respond(false, { error: "Supabase env not configured" });
        }

        // ---------- AUTH (verify caller) ----------
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return respond(false, { error: "Unauthorized" }, 401);
        }
        const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
        });
        const { data: userData, error: userErr } = await userClient.auth.getUser();
        if (userErr || !userData?.user) {
            return respond(false, { error: "Invalid session" }, 401);
        }
        const userId = userData.user.id;

        // Service-role client for trusted DB writes (bypasses RLS)
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ---------- BODY ----------
        let body: any;
        try {
            body = await req.json();
        } catch {
            return respond(false, { error: "Invalid JSON body" }, 400);
        }
        const { action } = body;

        // =====================================================
        // 1️⃣  CREATE ORDER
        // =====================================================
        if (action === "create_order") {
            const { consultation_id } = body;

            if (!consultation_id) {
                return respond(false, { error: "consultation_id required" }, 400);
            }

            // Fetch consultation FIRST
            const { data: consultation, error: cErr } = await adminClient
                .from("consultations")
                .select("id, client_id, lawyer_id, total_amount")
                .eq("id", consultation_id)
                .single();

            if (cErr || !consultation) {
                return respond(false, { error: "Consultation not found" }, 404);
            }

            if (consultation.client_id !== userId) {
                return respond(false, { error: "Forbidden" }, 403);
            }

            const amount = consultation.total_amount; // ✅ correct place

            // Create Razorpay order
            const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

            const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100),
                    currency: "INR",
                    receipt: `rcpt_${consultation_id.slice(0, 30)}`,
                    notes: { consultation_id, user_id: userId },
                }),
            });

            const rpText = await rpRes.text();

            let order: any;
            try {
                order = JSON.parse(rpText);
            } catch {
                return respond(false, {
                    error: "Razorpay non-JSON response",
                    raw: rpText,
                });
            }

            if (!rpRes.ok) {
                return respond(false, {
                    error: order?.error?.description || "Razorpay error",
                    details: order,
                });
            }

            return respond(true, {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: RAZORPAY_KEY_ID,
            });
        }

        // =====================================================
        // 2️⃣  VERIFY PAYMENT (HMAC SHA256)
        // =====================================================
        if (action === "verify_payment") {
            const {
                consultation_id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            } = body;

            if (
                !consultation_id ||
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {
                return respond(false, { error: "Missing payment fields" }, 400);
            }

            // Verify signature
            const expected = createHmac("sha256", RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (expected !== razorpay_signature) {
                return respond(false, { error: "Invalid signature" }, 400);
            }

            // Mark consultation as paid (only if caller is the client)
            const { data: consultation, error: cErr } = await adminClient
                .from("consultations")
                .select("id, client_id")
                .eq("id", consultation_id)
                .single();

            if (cErr || !consultation) {
                return respond(false, { error: "Consultation not found" }, 404);
            }
            if (consultation.client_id !== userId) {
                return respond(false, { error: "Forbidden" }, 403);
            }

            // NOTE: add `payment_status` and `razorpay_payment_id` columns to consultations
            // for this update to persist. Until then this will silently no-op those fields.
            const { error: updErr } = await adminClient
                .from("consultations")
                .update({
                    status: "active",
                    payment_status: "paid",
                    razorpay_order_id,
                    razorpay_payment_id,
                })
                .eq("id", consultation_id);

            if (updErr) {
                return respond(false, { error: "DB update failed", details: updErr.message });
            }

            return respond(true, { verified: true });
        }

        return respond(false, { error: "Invalid action" }, 400);
    } catch (err) {
        console.error("Edge Function Error:", err);
        return respond(false, {
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
});
