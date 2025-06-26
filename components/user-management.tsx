import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  username: string
  role: string
}

// Gerçek uygulamada bu veriler veritabanından veya API'den gelmelidir.
const initialUsers: User[] = [
  { username: "Admin01", role: "admin" },
  { username: "Admin02", role: "admin" },
  { username: "Admin03", role: "admin" },
  { username: "Kullanici01", role: "user" },
  { username: "Izleyici01", role: "viewer" },
]

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("user")

  const addUser = () => {
    if (newUsername) {
      // TODO: Şifreleme ve veritabanına kaydetme işlemi burada yapılmalı.
      console.log(`Yeni Kullanıcı: ${newUsername}, Şifre: ${newPassword}, Rol: ${newRole}`)
      setUsers([...users, { username: newUsername, role: newRole }])
      setNewUsername("")
      setNewPassword("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kullanıcı Yönetimi</CardTitle>
        <CardDescription>Yeni kullanıcılar ekleyin, mevcutları düzenleyin ve rollerini atayın.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex gap-4 items-end">
          <input
            type="text"
            placeholder="Yeni Kullanıcı Adı"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Yeni Şifre"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="p-2 border rounded"
          />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="p-2 border rounded">
            <option value="admin">Admin</option>
            <option value="user">Kullanıcı</option>
            <option value="viewer">Görüntüleyici</option>
          </select>
          <button onClick={addUser} className="bg-blue-500 text-white p-2 rounded">
            Kullanıcı Ekle
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Kullanıcı Adı</th>
              <th className="border p-2 text-left">Rol</th>
              <th className="border p-2 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">
                  <button className="text-blue-500 mr-2">Düzenle</button>
                  <button className="text-red-500">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
} 