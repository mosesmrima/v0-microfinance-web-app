"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Profile, UserRole } from "@/lib/types"
import hardcodedUsers from "@/lib/hardcoded-users.json"
import { initializeMockStore } from "@/lib/mock-store"

// ============================================
// AUTH CONTEXT TYPES
// ============================================

interface AuthContextType {
  currentUser: Profile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  updateUser: (updates: Partial<Profile>) => void
}

// ============================================
// CREATE CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// AUTH PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize mock store and load user from localStorage on mount
  useEffect(() => {
    // Initialize localStorage with mock data if needed
    initializeMockStore()

    // Load current user from localStorage
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as Profile
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }, [])

  // Login function - matches email/password against hardcoded users
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find user in hardcoded list
    const user = hardcodedUsers.users.find(
      (u) => u.email === email && u.password === password
    )

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    // Remove password from user object before storing
    const { password: _, ...userWithoutPassword } = user
    const authenticatedUser = userWithoutPassword as Profile

    // Store in state and localStorage
    setCurrentUser(authenticatedUser)
    setIsAuthenticated(true)
    localStorage.setItem("currentUser", JSON.stringify(authenticatedUser))

    return { success: true }
  }

  // Logout function
  const logout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
  }

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return currentUser?.role === role
  }

  // Update user profile
  const updateUser = (updates: Partial<Profile>) => {
    if (!currentUser) return

    const updatedUser = {
      ...currentUser,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    setCurrentUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
  }

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    hasRole,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================
// USE AUTH HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
