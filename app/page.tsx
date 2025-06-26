"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { RequestTable } from "@/components/request-table"
import { KPICards } from "@/components/kpi-cards"
import { getRequests, addRequest, updateRequest, deleteRequests, type Request } from "@/lib/data"
import { Auth } from "@/components/auth"
import { UserManagement } from "@/components/user-management"
import { HomePage } from "@/components/home-page"

export default function App() {
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const handleLogin = (newRole: string, newUsername: string) => {
    setRole(newRole)
    setUsername(newUsername)
  }

  if (!role) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div>
      {role === "admin" && <UserManagement />}
      <HomePage role={role} username={username} />
    </div>
  )
}
