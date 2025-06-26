import { useState } from "react"

interface User {
  username: string
  password: string
  role: string
}

const initialUsers: User[] = [
  { username: "Admin01", password: "Planlama2025", role: "admin" },
  { username: "Admin02", password: "Planlama2025", role: "admin" },
  { username: "Admin03", password: "Planlama2025", role: "admin" },
]

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("user")

  const addUser = () => {
    if (newUsername && newPassword) {
      setUsers([...users, { username: newUsername, password: newPassword, role: newRole }])
      setNewUsername("")
      setNewPassword("")
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Yeni Kullanıcı Adı"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="p-2 border rounded mr-2"
        >
          <option value="admin">Admin</option>
          <option value="user">Kullanıcı</option>
          <option value="viewer">Görüntüleyici</option>
        </select>
        <button onClick={addUser} className="bg-blue-500 text-white p-2 rounded">
          Ekle
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Kullanıcı Adı</th>
            <th className="border p-2">Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 