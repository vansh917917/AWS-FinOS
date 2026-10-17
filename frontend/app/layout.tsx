import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinOS: Personal Finance Operating System",
  description:
    "Smart personal finance and cash flow intelligence. Track income and expenses, manage budgets, set savings goals, and gain clear financial insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-finos-bg text-finos-text antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
