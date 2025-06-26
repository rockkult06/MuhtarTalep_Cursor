"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    const success = await login(username, password)
    if (!success) {
      setError("Geçersiz kullanıcı adı veya şifre.")
    }
    setLoading(false)
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
          <CardDescription>Devam etmek için lütfen giriş yapın.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="grid gap-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              type="text"
              placeholder="Kullanıcı adınızı girin"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="Şifrenizi girin"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
} 