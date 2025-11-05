"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Building2,
  UserCheck,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    title: "User Dashboard",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/kyc", label: "KYC Verification", icon: UserCheck },
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    title: "Institution",
    items: [{ href: "/institution", label: "Institution Dashboard", icon: Building2 }],
  },
  {
    title: "Admin",
    items: [
      { href: "/admin/kyc", label: "KYC Review", icon: FileCheck },
      { href: "/admin/fraud", label: "Fraud Detection", icon: AlertTriangle },
    ],
  },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold text-foreground">FinFlow</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:flex h-16 items-center gap-2 border-b border-border px-6">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold text-foreground">FinFlow</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {navigationItems.map((section) => (
                  <div key={section.title}>
                    <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-border p-4">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
