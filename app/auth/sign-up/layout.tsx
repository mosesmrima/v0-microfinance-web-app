import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your FinFlow account and get started with microfinance.",
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children
}
