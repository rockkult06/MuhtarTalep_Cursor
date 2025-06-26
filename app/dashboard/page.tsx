"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { DashboardCharts } from "@/components/dashboard-charts"
import { getRequests, type Request } from "@/lib/data"

export default function DashboardPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
    fetchRequests()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-theme-soft-gray">
        <Header />
        <main className="flex-1 p-8 md:p-10 flex items-center justify-center animate-fade-in">
          <p>Dashboard verileri yükleniyor...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-theme-soft-gray">
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
        <div className="backdrop-blur-sm bg-white/30 rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>
        <DashboardCharts requests={requests} />
      </main>
    </div>
  )
}
