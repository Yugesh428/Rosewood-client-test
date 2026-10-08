import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// /admin → redirect straight to the dashboard
export default function AdminRootPage() {
  redirect("/admin/dashboard");
}
