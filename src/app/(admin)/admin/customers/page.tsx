"use client";

// TODO: Build your customers management page here
// Available API: /api/customers  (GET)
//                /api/customers/[id]  (GET, PUT, DELETE)
//                /api/customers/[id]/toggle-active  (PATCH)
//                /api/customers/[id]/orders  (GET)
//                /api/customers/stats  (GET)
// Component folder: src/components/admin/customers/

export default function CustomersPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-[#1A1A1A]">Customers</h1>
      <p className="text-[#6B6B6B] mt-2">Build your customers management UI here.</p>
    </div>
  );
}
