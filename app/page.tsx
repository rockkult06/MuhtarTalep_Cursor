"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { RequestTable } from "@/components/request-table"
import { KPICards } from "@/components/kpi-cards"
import { getRequests, addRequest, updateRequest, deleteRequests, type Request, type Role } from "@/lib/data"
import { toast } from "sonner"

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const fetchedRequests = await getRequests()
      setRequests(fetchedRequests)
      setError(null)
    } catch (err) {
      setError("Talepler yüklenirken bir hata oluştu.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAddRequest = async (
    formData: Omit<Request, "id" | "talepNo" | "guncellemeTarihi" | "talebiOlusturan" | "guncelleyen">,
  ) => {
    if (!user) {
        toast.error("Yeni talep eklemek için giriş yapmalısınız.")
        return;
    }
    try {
      const maxTalepNo = requests.reduce((max, r) => Math.max(max, parseInt(r.talepNo, 10) || 0), 0);
      const newTalepNo = (maxTalepNo + 1).toString();

      const newRequestData = {
        ...formData,
        talepNo: newTalepNo,
        degerlendirmeSonucu: formData.degerlendirmeSonucu.trim(),
        talebiOlusturan: user.username,
        guncelleyen: user.username, 
      };

      const addedRequest = await addRequest(newRequestData)
      if (addedRequest) {
        setRequests(prev => [addedRequest, ...prev])
        toast.success("Talep başarıyla eklendi!")
      }
    } catch (error) {
      toast.error("Talep eklenirken bir hata oluştu.")
      console.error(error)
    }
  }

  const handleUpdateRequest = async (id: string, updatedFields: Partial<Request>) => {
    if (!user) {
        toast.error("Talep güncellemek için giriş yapmalısınız.")
        return;
    }
    try {
      
      const fieldsToUpdate = { ...updatedFields };

      if (fieldsToUpdate.degerlendirmeSonucu) {
        fieldsToUpdate.degerlendirmeSonucu = fieldsToUpdate.degerlendirmeSonucu.trim();
      }

      const updatedRequest = await updateRequest(id, {
        ...fieldsToUpdate,
        guncelleyen: user.username,
        guncellemeTarihi: new Date().toISOString(),
      })
      if (updatedRequest) {
        setRequests(prev => prev.map(r => (r.id === id ? updatedRequest : r)))
        toast.success("Talep başarıyla güncellendi!")
      }
    } catch (error) {
      toast.error("Talep güncellenirken bir hata oluştu.")
      console.error(error)
    }
  }

  const handleDeleteRequests = async (ids: string[]) => {
    try {
      const success = await deleteRequests(ids)
      if (success) {
        setRequests(prev => prev.filter(r => !ids.includes(r.id)))
        toast.success(`${ids.length} talep başarıyla silindi.`)
      }
    } catch (error) {
      toast.error("Talepler silinirken bir hata oluştu.")
      console.error(error)
    }
  }

  const filteredRequests = useMemo(() => {
    if (!filter) return requests
    return requests.filter(r => r.degerlendirmeSonucu.trim() === filter)
  }, [requests, filter])

  if (isAuthLoading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto space-y-6">
          <KPICards requests={requests} onCardClick={setFilter} activeFilter={filter} />

          <RequestTable
            requests={filteredRequests}
            onAddRequest={handleAddRequest}
            onUpdateRequest={handleUpdateRequest}
            onDeleteRequests={handleDeleteRequests}
            loading={loading}
            error={error}
            role={user?.role as Role || 'viewer'}
          />
        </div>
      </main>
    </div>
  )
}
