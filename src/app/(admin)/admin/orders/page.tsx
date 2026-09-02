"use client";

// TODO: Build your orders management page here
// Available API: /api/orders  (GET, POST)
//                /api/orders/[id]  (GET, PUT, DELETE)
//                /api/orders/[id]/status  (PATCH)
//                /api/orders/[id]/payment  (PATCH)
//                /api/orders/stats  (GET)
//                /api/orders/guest/track  (GET)
//                /api/order-items  (GET, POST)
//                /api/order-items/[id]  (GET, PUT, DELETE)
// Component folder: src/components/admin/orders/

export default function OrdersPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-[#1A1A1A]">Orders</h1>
      <p className="text-[#6B6B6B] mt-2">Build your orders management UI here.</p>
    </div>
  );
}
