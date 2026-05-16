"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  CreditCard,
  Database,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Overview", url: "/hq", icon: LayoutDashboard },
  { title: "Users", url: "/hq/users", icon: Users },
  { title: "Database", url: "/hq/database", icon: Database },
  { title: "Plans", url: "/hq/plans", icon: Package },
  { title: "Coupons", url: "/hq/coupons", icon: Tag },
  { title: "Referrals", url: "/hq/referrals", icon: Award },
  { title: "Resources", url: "/hq/resources", icon: BookOpen },
  { title: "Analytics", url: "/hq/analytics", icon: BarChart3 },
  { title: "Email Hub", url: "/hq/emails", icon: Mail },
  { title: "Billing & AI", url: "/hq/billing", icon: CreditCard },
  { title: "Audit Log", url: "/hq/audit", icon: ShieldCheck },
  { title: "Settings", url: "/hq/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Base UI uses render prop, not asChild */}
            <SidebarMenuButton size="lg" render={<Link href="/hq" />}>
              <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src="/favicon.ico"
                  alt="Zaprill"
                  width={32}
                  height={32}
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Zaprill HQ</span>
                <span className="text-muted-foreground text-xs">
                  Admin Console
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/hq" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                      isActive={isActive}
                      className={cn(
                        isActive &&
                          "bg-primary/10 text-primary hover:bg-primary/20",
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 text-muted-foreground text-xs">v1.0.0-stable</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
