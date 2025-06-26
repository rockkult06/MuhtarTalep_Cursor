import { useState } from "react"

interface AuthProps {
  onLogin: (role: string, username: string) => void
}

const users = [
  { username: "Admin01", password: "Planlama2025", role: "admin" },
  { username: "Admin02", password: "Planlama2025", role: "admin" },
  { username: "Admin03", password: "Planlama2025", role: "admin" },
  // Diğer kullanıcılar buraya eklenebilir
]

export function Auth({ onLogin }: AuthProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    const user = users.find((u) => u.username === username && u.password === password)
    if (user) {
      onLogin(user.role, user.username)
    } else {
      setError("Geçersiz kullanıcı adı veya şifre")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Giriş Yap</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">
          Giriş Yap
        </button>
      </div>
    </div>
  )
} 