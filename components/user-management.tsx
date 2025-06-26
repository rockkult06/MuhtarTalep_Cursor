"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsers, addUser, deleteUser, type User, type Role } from "@/lib/data"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState<Role>("user")

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      setError("Kullanıcılar yüklenemedi.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      setError("Kullanıcı adı ve şifre boş bırakılamaz.")
      return
    }
    const success = await addUser({
      username: newUsername,
      password: newPassword,
      role: newRole,
    })
    if (success) {
      setNewUsername("")
      setNewPassword("")
      fetchUsers() // Refresh list
    } else {
      setError("Kullanıcı eklenemedi. Kullanıcı adı zaten mevcut olabilir.")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId)
    if (success) {
      fetchUsers() // Refresh list
    } else {
      setError("Kullanıcı silinemedi.")
    }
  }

  if (isLoading) return <p>Kullanıcılar yükleniyor...</p>
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kullanıcı Yönetimi</CardTitle>
        <CardDescription>Yeni kullanıcılar ekleyin, mevcutları düzenleyin ve rollerini atayın.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-6 flex flex-wrap gap-4 items-end">
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
          <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className="p-2 border rounded">
            <option value="admin">Admin</option>
            <option value="user">Kullanıcı</option>
            <option value="viewer">Görüntüleyici</option>
          </select>
          <button onClick={handleAddUser} className="bg-blue-500 text-white p-2 rounded">
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-500">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
} 