"use client"

import { usePathname } from 'next/navigation';
import UserNavigation from "@/components/Navigation/UserNavigation";
import AdminNavigation from "@/components/Navigation/AdminNavigation";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();


  // Determine if the user is on an admin route
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminRouteLogin = pathname.startsWith("/admin/admin-login");

  return (
    <html lang="en">
      <body>
        {/* Conditionally render the AdminNavbar if the route starts with "/admin" */}
        {isAdminRoute ? <AdminNavigation /> : <UserNavigation />}
        {children}
      </body>
    </html>
  );
}
