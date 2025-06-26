import Link from "next/link"
import { Home, ListChecks, LayoutDashboard, Upload, User } from "lucide-react" // Yeni ikonlar

interface HeaderProps {
  username: string | null
}

export function Header({ username }: HeaderProps) {
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
      <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
        {username && (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">{username}</span>
          </div>
        )}
      </div>
    </header>
  )
}
