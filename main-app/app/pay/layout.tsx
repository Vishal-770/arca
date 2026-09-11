import type { Metadata } from "next";
import { PaymentProvider } from "@/context/PaymentContext";

export const metadata: Metadata = {
  title: "Checkout - Arca",
  description: "Complete your subscription payment",
};

export default function PaymentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PaymentProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {children}
      </div>
    </PaymentProvider>
  );
}
