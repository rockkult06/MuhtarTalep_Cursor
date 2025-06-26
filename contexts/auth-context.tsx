"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

type Role = "admin" | "user" | "viewer"

interface User {
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const staticUsers = [
  { username: "Admin01", password: "Planlama2025", role: "admin" },
  { username: "Admin02", password: "Planlama2025", role: "admin" },
  { username: "Admin03", password: "Planlama2025", role: "admin" },
]

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === '/login';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, pathname, isLoading, router]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = staticUsers.find((u) => u.username === username && u.password === password)
    if (foundUser) {
      const userData = { username: foundUser.username, role: foundUser.role as Role };
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      router.push("/")
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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