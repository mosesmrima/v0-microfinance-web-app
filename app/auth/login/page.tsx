"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/types"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(email, password)

      if (result.success) {
        // Redirect based on role (will be implemented with route protection)
        router.push("/dashboard")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Quick login for testing
  const handleQuickLogin = async (testEmail: string, testPassword: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(testEmail, testPassword)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const quickLoginOptions = [
    { role: "Borrower", email: "borrower@test.com", password: "borrower123", variant: "default" as const },
    { role: "Loan Officer", email: "officer@test.com", password: "officer123", variant: "secondary" as const },
    { role: "Loan Manager", email: "manager@test.com", password: "manager123", variant: "secondary" as const },
    { role: "Admin", email: "admin@test.com", password: "admin123", variant: "secondary" as const },
  ]

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>

              {/* Quick Login Section for Testing */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Quick Login (Testing)</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {quickLoginOptions.map((option) => (
                    <Button
                      key={option.role}
                      type="button"
                      variant={option.variant}
                      size="sm"
                      onClick={() => handleQuickLogin(option.email, option.password)}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Login as {option.role}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
