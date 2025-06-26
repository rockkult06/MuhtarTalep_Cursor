"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { verifyUser, type User } from "@/lib/data"

type Role = "admin" | "user" | "viewer"

export interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const staticUsers = [
  { username: "Admin01", password: "Planlama2025", role: "admin" },
  { username: "Admin02", password: "Planlama2025", role: "admin" },
  { username: "Admin03", password: "Planlama2025", role: "admin" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error)
      localStorage.removeItem("user")
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, pathname, loading, router]);

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    router.push("/")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 