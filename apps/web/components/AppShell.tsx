"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/providers/SessionProvider";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface NavItem {
  href: string;
  label: string;
}

function useNavItems(): NavItem[] {
  const { identity, roles } = useSession();
  const items: NavItem[] = identity
    ? [
        { href: "/home", label: "My dashboard" },
        { href: "/dashboard", label: "Transparency" },
        { href: "/donate", label: "Donate" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Transparency" },
        { href: "/donate", label: "Donate" },
      ];
  if (!roles) return items;
  if (roles.households.length > 0) {
    items.push({ href: "/status", label: "My aid" });
  }
  items.push({ href: "/claim", label: "Claim aid" });
  if (roles.registrarChannels.length > 0) {
    items.push({ href: "/register", label: "Register" });
    items.push({ href: "/bulk-register", label: "Bulk register" });
  }
  if (roles.isVerifier) items.push({ href: "/verify", label: "Verify queue" });
  if (roles.isAdmin) {
    items.push({ href: "/zones", label: "Zones" });
    items.push({ href: "/caps", label: "Capabilities" });
  }
  return items;
}

function AuthControls() {
  const { identity, signOut } = useSession();

  if (identity) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="primary" className="font-mono">
          {identity.label}
        </Badge>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login" className={cn(buttonClasses({ size: "sm" }), "shrink-0")}>
      Sign in
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = useNavItems();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs"
            >
              M
            </span>
            MySteadyAid
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <AuthControls />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>MySteadyAid — transparent disaster-relief distribution on Sui testnet.</p>
          <p>Demo build · testnet SUI · not production aid.</p>
        </div>
      </footer>
    </div>
  );
}
