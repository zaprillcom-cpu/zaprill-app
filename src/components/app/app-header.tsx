"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { NavUser } from "@/components/Navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getNavTitle } from "@/lib/app-nav";
import { signOut } from "@/lib/auth-client";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export function AppHeader({ user }: { user: NavUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = getNavTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 md:inline-flex" />
        <div className="mr-1 hidden h-4 w-px bg-border md:block" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== "/" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <span className="truncate font-bold text-sm sm:hidden">
          {pageTitle}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Account menu"
          >
            <Avatar size="default">
              {user.image && (
                <AvatarImage src={user.image} alt={user.name ?? "User"} />
              )}
              <AvatarFallback className="font-bold text-xs">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="mb-1 border-border border-b px-3 py-2">
              {user.name && (
                <p className="truncate font-bold text-sm">{user.name}</p>
              )}
              {user.email && (
                <p className="truncate text-muted-foreground text-xs">
                  {user.email}
                </p>
              )}
            </div>
            <DropdownMenuItem render={<Link href="/profile" />}>
              <Settings className="mr-2 h-4 w-4" />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                signOut({
                  fetchOptions: { onSuccess: () => router.push("/") },
                })
              }
              className="cursor-pointer font-semibold text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
