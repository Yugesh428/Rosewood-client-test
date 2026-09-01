"use client";

import { signOut } from "next-auth/react";

export default function CustomerSignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition"
    >
      Sign out
    </button>
  );
}
