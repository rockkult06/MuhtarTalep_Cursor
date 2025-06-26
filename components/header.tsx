"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Home, ListChecks, LayoutDashboard, Upload } from "lucide-react" // Yeni ikonlar

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex items-center h-16 px-6 border-b shrink-0 md:px-8 bg-white shadow-sm">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold sm:text-base mr-6">
        <Home className="w-6 h-6 text-theme-primary" /> {/* İkon rengi */}
        <span className="font-bold text-xl">MTYS</span> {/* Sadeleştirilmiş logo */}
      </Link>
      <nav className="hidden font-medium sm:flex flex-row items-center gap-6 text-sm lg:gap-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-theme-primary flex items-center gap-2 transition-colors"
        >
          <ListChecks className="w-4 h-4" /> Talepler
        </Link>
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-theme-primary flex items-center gap-2 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <Link
          href="/upload"
          className="text-muted-foreground hover:text-theme-primary flex items-center gap-2 transition-colors"
        >
          <Upload className="w-4 h-4" /> Veri Yükle
        </Link>
      </nav>
      <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {user && <span className="text-sm text-gray-600 dark:text-gray-300">Hoşgeldin, {user.username}</span>}
        {user?.role === "admin" && (
          <Button asChild variant="outline">
            <Link href="/admin">Sayfa Yönetimi</Link>
          </Button>
        )}
        {user && (
          <Button onClick={logout} variant="destructive">
            Çıkış Yap
          </Button>
        )}
      </div>
    </header>
  )
}
