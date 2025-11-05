import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about FinFlow's mission to provide accessible microfinance solutions.",
}

export default function AboutPage() {
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
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground">About FinFlow</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We're on a mission to democratize access to fair, transparent, and secure financing for everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-4">
            FinFlow was founded with a simple belief: everyone deserves access to fair, transparent financing.
            Traditional lending systems are often opaque, slow, and inaccessible to those who need it most.
          </p>
          <p className="text-lg text-muted-foreground mb-4">
            We're leveraging cutting-edge technology—including AI, blockchain, and advanced fraud detection—to create a
            lending platform that is fast, fair, and secure.
          </p>
          <p className="text-lg text-muted-foreground">
            Our platform connects borrowers with institutions and lenders, creating a transparent ecosystem where
            everyone can thrive.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-card px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                We believe in complete transparency. No hidden fees, no surprises. You always know exactly what you're
                getting.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Security</h3>
              <p className="text-muted-foreground">
                Your data is sacred. We use bank-level security and blockchain technology to protect your information.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Accessibility</h3>
              <p className="text-muted-foreground">
                Financial services should be accessible to everyone. We're breaking down barriers to fair lending.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Join Us on Our Mission</h2>
          <p className="mt-4 text-muted-foreground">Be part of the financial revolution. Apply for a loan today.</p>
          <Link href="/auth/sign-up" className="mt-8 inline-block">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
