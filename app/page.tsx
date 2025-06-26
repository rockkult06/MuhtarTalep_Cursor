"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { RequestTable } from "@/components/request-table"
import { KPICards } from "@/components/kpi-cards"
import { getRequests, addRequest, updateRequest, deleteRequests, type Request } from "@/lib/data"

export default function HomePage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedRequests = await getRequests()
      setRequests(fetchedRequests)
    } catch (err) {
      console.error("Failed to fetch requests:", err)
      setError("Talepler yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAddRequest = async (
    newRequestData: Omit<Request, "id" | "talepNo" | "guncellemeTarihi"> & { guncelleyen?: string },
  ) => {
    try {
      const addedRequest = await addRequest({ ...newRequestData, talepNo: "" })
      if (addedRequest) {
        setRequests((prev) => [...prev, addedRequest])
      }
    } catch (err) {
      console.error("Failed to add request:", err)
      setError("Talep eklenirken bir hata oluştu.")
    }
  }

  const handleUpdateRequest = async (id: string, updatedFields: Partial<Request> & { guncelleyen?: string }) => {
    try {
      const updatedRequest = await updateRequest(id, updatedFields)
      if (updatedRequest) {
        setRequests((prev) => prev.map((req) => (req.id === id ? updatedRequest : req)))
      }
    } catch (err) {
      console.error("Failed to update request:", err)
      setError("Talep güncellenirken bir hata oluştu.")
    }
  }

  const handleDeleteRequests = async (ids: string[]) => {
    try {
      const success = await deleteRequests(ids)
      if (success) {
        setRequests((prev) => prev.filter((req) => !ids.includes(req.id)))
      } else {
        setError("Talepler silinirken bir hata oluştu.")
      }
    } catch (err) {
      console.error("Failed to delete requests:", err)
      setError("Talepler silinirken beklenmeyen bir hata oluştu.")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-theme-soft-gray">
        {" "}
        {/* Soft gri arka plan */}
        <Header />
        <main className="flex-1 p-8 md:p-10 flex items-center justify-center animate-fade-in">
          {" "}
          {/* Daha geniş boşluklar, fade-in animasyon */}
          <p>Yükleniyor...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-theme-soft-gray">
        {" "}
        {/* Soft gri arka plan */}
        <Header />
        <main className="flex-1 p-8 md:p-10 flex items-center justify-center animate-fade-in">
          {" "}
          {/* Daha geniş boşluklar, fade-in animasyon */}
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-theme-soft-gray">
      {" "}
      {/* Soft gri arka plan */}
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Talepler</h1>
        <KPICards requests={requests} onFilter={setFilter} />
        <RequestTable
          requests={requests}
          onAddRequest={handleAddRequest}
          onUpdateRequest={handleUpdateRequest}
          onDeleteRequests={handleDeleteRequests}
          filter={filter}
        />
      </main>
    </div>
  )
}
