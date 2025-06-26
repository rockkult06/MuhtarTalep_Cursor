"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { DashboardCharts } from "@/components/dashboard-charts"
import { getRequests, getAllLogs, type Request, type LogEntry } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedRequests = await getRequests()
      setRequests(fetchedRequests)
    } catch (err) {
      console.error("Failed to fetch requests for dashboard:", err)
      setError("Dashboard verileri yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTalepKonulari = async () => {
    setUpdating(true)
    try {
      await updateTalepKonulari()
      // Verileri yeniden yükle
      await fetchRequests()
    } catch (err) {
      console.error("Talep konuları güncellenirken hata:", err)
      setError("Talep konuları güncellenirken bir hata oluştu.")
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && user) {
      const fetchData = async () => {
        setLoading(true)
        try {
          // Talepleri ve logları aynı anda çek
          const [fetchedRequests, fetchedLogs] = await Promise.all([
            getRequests(),
            getAllLogs()
          ]);
          setRequests(fetchedRequests)
          setLogs(fetchedLogs)
        } catch (error) {
          console.error("Dashboard verileri yüklenirken hata oluştu:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [user, isAuthLoading])

  if (isAuthLoading || loading) {
    return <div className="flex justify-center items-center min-h-screen">Yükleniyor...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="flex-1 p-8 md:p-10 flex items-center justify-center animate-fade-in">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-1 p-8 md:p-10 animate-fade-in">
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleUpdateTalepKonulari}
            disabled={updating}
            variant="outline"
            className="bg-white/70 backdrop-blur-sm border-white/50 hover:bg-white/80"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Güncelleniyor...' : 'Talep Konularını Güncelle'}
          </Button>
        </div>
        <DashboardCharts requests={requests} logs={logs} />
      </main>
    </div>
  )
}
