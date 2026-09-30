import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ToastProvider from "../providers/ToastProvider";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F8F8F8] font-montserrat">
      <ToastProvider />
      {/* Sidebar renders its own fixed panel + a spacer div to push content */}
      <AdminSidebar />

      {/* Main content — grows to fill remaining space */}
      <main className="flex-1 min-w-0 flex flex-col">
        <AdminHeader />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}





