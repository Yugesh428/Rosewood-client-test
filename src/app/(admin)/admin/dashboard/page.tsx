import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import PharmacyDashboard from "@/components/admin/dashboard/PharmacyDashboard";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };

  return <PharmacyDashboard userName={user.name} />;
}
