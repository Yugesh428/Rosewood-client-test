"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            expand={false} 
            closeButton
            duration={3000}
            offset={16}
          />
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
