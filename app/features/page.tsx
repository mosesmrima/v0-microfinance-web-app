import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold text-foreground">FinFlow</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-foreground">Powerful Features for Modern Lending</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Everything you need to access fair, transparent financing
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Instant Loan Calculator",
                description:
                  "Calculate your monthly payments instantly with our interactive loan calculator. See exactly what you'll pay before applying.",
              },
              {
                title: "Multi-Step Application",
                description:
                  "Simple, intuitive application process. Complete your loan application in just a few minutes with our guided form.",
              },
              {
                title: "KYC Verification",
                description:
                  "Secure document upload and verification. Your identity is verified using advanced AI and blockchain technology.",
              },
              {
                title: "Real-Time Status Tracking",
                description:
                  "Track your application status in real-time. Get instant notifications at every step of the process.",
              },
              {
                title: "Fraud Detection",
                description:
                  "Advanced fraud detection system protects both borrowers and lenders. Your data is safe with us.",
              },
              {
                title: "Blockchain Integration",
                description:
                  "Transparent, immutable loan records on the Polygon blockchain. Complete transparency and security.",
              },
              {
                title: "Multiple Loan Products",
                description:
                  "Choose from various loan products tailored to your needs. Personal loans, business loans, and more.",
              },
              {
                title: "Secure Payments",
                description: "Multiple payment options with bank-level security. Pay your loans easily and securely.",
              },
            ].map((feature, i) => (
              <Card key={i}>
                <CardHeader>
                  <CheckCircle2 className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to Experience the Difference?</h2>
          <Link href="/auth/sign-up" className="mt-8 inline-block">
            <Button size="lg">Start Your Application</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
