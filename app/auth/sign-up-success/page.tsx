import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Account Created!</CardTitle>
            <CardDescription>Check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a verification email to your inbox. Click the link in the email to confirm your account
              and get started.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don&apos;t see the email, check your spam folder or try signing up again.
            </p>
            <Link href="/auth/login" className="block">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
