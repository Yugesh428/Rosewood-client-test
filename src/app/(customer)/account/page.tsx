import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import CustomerSignOutButton from "./_components/CustomerSignOutButton";

export default async function AccountPage() {
  const session = await auth();

  if (!session || (session.user as { role?: string })?.role !== "CUSTOMER") {
    redirect("/login");
  }

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#1A1A1A] font-sans">Rosewood</p>
            <h1 className="font-heading text-lg text-[#1A1A1A]">My Account</h1>
          </div>
          <CustomerSignOutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white border border-[#E5E5E5] rounded-sm p-8">
          <p className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] font-sans mb-2">Welcome</p>
          <h2 className="font-heading text-2xl text-[#1A1A1A] mb-2">{user.name}</h2>
          <p className="text-sm text-[#6B6B6B] font-sans">
            Signed in as{" "}
            <span className="font-medium text-[#1A1A1A]">{user.email}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
