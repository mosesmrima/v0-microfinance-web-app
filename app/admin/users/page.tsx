"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { getProfiles, getLoansByUserId } from "@/lib/mock-store"
import { format } from "date-fns"
import { Users, User, CheckCircle2, XCircle } from "lucide-react"

export default function AdminUsersPage() {
  const { currentUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/login")
      return
    }

    if (currentUser.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, currentUser, router])

  if (!isAuthenticated || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const allUsers = getProfiles()
  const borrowers = allUsers.filter((u) => u.role === "borrower")
  const staff = allUsers.filter((u) => u.role !== "borrower")

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">View and manage all system users</p>
        </div>

        <Tabs defaultValue="borrowers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="borrowers">
              Borrowers
              <Badge className="ml-2" variant="secondary">
                {borrowers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="staff">
              Staff
              <Badge className="ml-2" variant="secondary">
                {staff.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borrowers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {borrowers.map((user) => {
                const userLoans = getLoansByUserId(user.id)
                return (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">
                              {user.first_name} {user.last_name}
                            </CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={user.kyc_stage1_status === "verified" ? "default" : "secondary"}>
                          {user.kyc_stage1_status === "verified" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {user.kyc_stage1_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{user.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Loans</p>
                          <p className="font-medium">{userLoans.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Joined</p>
                          <p className="font-medium">{format(new Date(user.created_at), "MMM dd, yyyy")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {staff.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">
                            {user.first_name} {user.last_name}
                          </CardTitle>
                          <CardDescription>{user.email}</CardDescription>
                        </div>
                      </div>
                      <Badge>{user.role.replace(/_/g, " ")}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{user.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Joined</p>
                        <p className="font-medium">{format(new Date(user.created_at), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
