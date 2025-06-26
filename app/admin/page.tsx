"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserManagement } from "@/components/user-management"
import { DropdownManagement } from "@/components/dropdown-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Yükleniyor veya yetkiniz yok...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Yönetim Paneli</h2>
      </div>
      <Tabs defaultValue="user-management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user-management">Kullanıcı Yönetimi</TabsTrigger>
          <TabsTrigger value="form-options">Form Seçenekleri Yönetimi</TabsTrigger>
        </TabsList>
        <TabsContent value="user-management" className="space-y-4">
          <UserManagement />
        </TabsContent>
        <TabsContent value="form-options" className="space-y-4">
          <DropdownManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 