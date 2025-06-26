"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Home, ListChecks, LayoutDashboard, Upload, LogOut, Settings } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
      {/* Sol Taraf: Logo ve Navigasyon */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-lg hidden sm:inline">MTYS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ListChecks className="h-5 w-5" />
            Talepler
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Upload className="h-5 w-5" />
            Veri Yükle
          </Link>
        </nav>
      </div>

      {/* Sağ Taraf: Kullanıcı Bilgisi ve Aksiyonlar */}
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
            Hoşgeldin, <span className="font-semibold">{user.username}</span>
          </span>
        )}
        {user?.role === "admin" && (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <Settings className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sayfa Yönetimi</span>
            </Link>
          </Button>
        )}
        {user && (
          <Button onClick={logout} variant="destructive" size="sm">
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Çıkış Yap</span>
          </Button>
        )}
      </div>
    </header>
  )
}
