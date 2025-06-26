"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserManagement } from "@/components/user-management"
import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Placeholder for DropdownManagement
function DropdownManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Seçenekleri Yönetimi</CardTitle>
        <CardDescription>
          Talep ekleme formundaki (örn: Talep Konusu) seçenekleri buradan yönetebilirsiniz. Bu özellik yakında eklenecektir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Çok yakında...</p>
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Yükleniyor veya yetkiniz yok...</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Yönetim Paneli</h1>
        <Tabs defaultValue="user-management">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user-management">Kullanıcı Yönetimi</TabsTrigger>
            <TabsTrigger value="dropdown-management">Form Seçenekleri</TabsTrigger>
          </TabsList>
          <TabsContent value="user-management">
            <UserManagement />
          </TabsContent>
          <TabsContent value="dropdown-management">
            <DropdownManagement />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
} 