import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner & Tenant Portal - Login or List Property",
  description: "Login or register to list your property or manage your account on CheckRooms.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
