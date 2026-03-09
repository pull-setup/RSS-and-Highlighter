import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-factor authentication",
};

export default function TotpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
