import { listRealtimeOrders } from "@/lib/elevate-orders-realtime";

export async function GET() {
  const orders = await listRealtimeOrders();
  return Response.json({ orders }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
