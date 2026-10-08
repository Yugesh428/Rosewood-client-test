import { Suspense } from "react";
import ConfirmDeliveryClient from "./_components/ConfirmDeliveryClient";

export default function ConfirmDeliveryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmDeliveryClient />
    </Suspense>
  );
}
