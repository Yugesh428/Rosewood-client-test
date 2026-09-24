import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import BlogsClient from "./_components/BlogsClient";

export default async function BlogsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading text-gray-900">Blog Management</h1>
            <p className="text-sm text-gray-500 mt-1 font-sans">
              Create and manage blog posts and articles
            </p>
          </div>
          <a
            href="/admin/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      <BlogsClient />
    </>
  );
}
