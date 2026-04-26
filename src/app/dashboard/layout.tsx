import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | Cozy Chocolate",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
