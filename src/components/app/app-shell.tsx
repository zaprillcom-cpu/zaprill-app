"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import type { NavUser } from "@/components/Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { shouldUseAppShell } from "@/lib/app-nav";
import { AppHeader } from "./app-header";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { UserSidebar } from "./user-sidebar";

interface AppShellProps {
  user: NavUser;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();

  if (!shouldUseAppShell(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset className="min-h-svh">
        <AppHeader user={user} />
        <div className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
