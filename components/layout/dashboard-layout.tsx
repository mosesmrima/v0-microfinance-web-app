"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  BarChart3,
  Users,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/types"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  href: string
  label: string
  icon: any
}

interface NavSection {
  title: string
  items: NavItem[]
}

// Navigation configuration for each role
const navigationByRole: Record<UserRole, NavSection[]> = {
  borrower: [
    {
      title: "Dashboard",
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/applications", label: "My Applications", icon: FileText },
        { href: "/dashboard/kyc", label: "KYC Verification", icon: UserCheck },
        { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
      ],
    },
  ],
  loan_officer: [
    {
      title: "Loan Officer",
      items: [
        { href: "/loan-officer", label: "Dashboard", icon: LayoutDashboard },
        { href: "/loan-officer/applications", label: "Loan Applications", icon: FileText },
        { href: "/loan-officer/kyc-review", label: "KYC Review", icon: UserCheck },
        { href: "/loan-officer/fraud-alerts", label: "Fraud Alerts", icon: AlertTriangle },
        { href: "/loan-officer/payment-schedules", label: "Payment Schedules", icon: Calendar },
      ],
    },
  ],
  loan_manager: [
    {
      title: "Loan Manager",
      items: [
        { href: "/loan-manager", label: "Dashboard", icon: LayoutDashboard },
        { href: "/loan-manager/high-value-loans", label: "High-Value Loans", icon: DollarSign },
        { href: "/loan-manager/approvals", label: "Approval History", icon: CheckCircle },
      ],
    },
  ],
  admin: [
    {
      title: "Admin",
      items: [
        { href: "/admin", label: "Analytics", icon: BarChart3 },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/system", label: "System Health", icon: Activity },
      ],
    },
  ],
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout } = useAuth()

  // Get navigation items for current user's role
  const navigationItems = currentUser ? navigationByRole[currentUser.role] : []

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

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

            {/* User Info */}
            {currentUser && (
              <div className="border-b border-border px-4 py-3">
                <div className="text-sm font-medium text-foreground">
                  {currentUser.first_name} {currentUser.last_name}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {currentUser.role.replace("_", " ")}
                </div>
              </div>
            )}

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
              <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
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
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
