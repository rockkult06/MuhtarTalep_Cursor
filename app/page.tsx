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

  if (!role) {
    return <Auth onLogin={setRole} />
  }

  return (
    <div>
      {role === "admin" && <UserManagement />}
      <HomePage role={role} />
    </div>
  )
}
