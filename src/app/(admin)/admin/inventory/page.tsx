"use client";

// TODO: Build your inventory management page here
// Available API: /api/inventory  (GET, POST)
//                /api/inventory/[id]  (GET, PUT, DELETE)
//                /api/inventory/[id]/toggle-active  (PATCH)
//                /api/inventory/[id]/adjust-stock  (PATCH)
//                /api/inventory/deduct  (POST)
//                /api/inventory/restore  (POST)
//                /api/inventory/product/[productId]  (GET)
// Component folder: src/components/admin/inventory/

export default function InventoryPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-[#1A1A1A]">Inventory</h1>
      <p className="text-[#6B6B6B] mt-2">Build your inventory management UI here.</p>
    </div>
  );
}
