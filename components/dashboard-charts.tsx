"use client"

import type { Request, MuhtarInfo } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { useEffect, useState } from "react"
import { getMuhtarData } from "@/lib/data"
import { Hash, MapPin, Tag, TrendingUp, CheckCircle, Users, ThumbsUp, ThumbsDown, Clock, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardChartsProps {
  requests: Request[]
}

// Pastel tonlarda renk paleti
const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#EF4444", "#A78BFA", "#F472B6", "#6EE7B7"]

export function DashboardCharts({ requests }: DashboardChartsProps) {
  const [chartData, setChartData] = useState({
    ilceDistribution: [],
    talepKonusuDistribution: [],
    degerlendirmeSonucuDistribution: [],
    monthlyTrends: [],
    top10IlceTopics: [],
    top10MahalleTopics: [],
  })
  const [allMuhtarInfos, setAllMuhtarInfos] = useState<MuhtarInfo[]>([])
  const [loadingMuhtarData, setLoadingMuhtarData] = useState(true)

  // KPI hesaplamaları (normalize edilmiş)
  const totalRequests = requests.length
  const olumluCount = requests.filter(r => r.degerlendirmeSonucu.trim() === "Olumlu").length
  const olumsuzCount = requests.filter(r => r.degerlendirmeSonucu.trim() === "Olumsuz").length
  const degerlendirilecekkCount = requests.filter(r => r.degerlendirmeSonucu.trim() === "Değerlendirilecek").length
  const inceleniyorCount = requests.filter(r => r.degerlendirmeSonucu.trim() === "İnceleniyor").length

  useEffect(() => {
    const fetchMuhtarData = async () => {
      setLoadingMuhtarData(true)
      try {
        const data = await getMuhtarData()
        setAllMuhtarInfos(data)
      } catch (err) {
        console.error("Failed to fetch muhtar data for dashboard:", err)
      } finally {
        setLoadingMuhtarData(false)
      }
    }
    fetchMuhtarData()
  }, [])

  useEffect(() => {
    // İlçe bazlı başvuru dağılımı (Büyük/küçük harf sorununu çöz ve muhtar verisi olmadan da çalışsın)
    const ilceCounts: Record<string, number> = {}
    
    // Önce requests'teki tüm ilçeleri al ve normalize et
    requests.forEach((req) => {
      const normalizedIlce = req.ilceAdi.trim().toUpperCase()
      ilceCounts[normalizedIlce] = (ilceCounts[normalizedIlce] || 0) + 1
    })

    // Muhtar verisi varsa o ilçeleri de ekle (talep olmasa bile)
    if (!loadingMuhtarData && allMuhtarInfos.length > 0) {
      const uniqueIlceler = [...new Set(allMuhtarInfos.map((info) => info.ilceAdi.trim().toUpperCase()))]
      uniqueIlceler.forEach((ilce) => {
        if (!(ilce in ilceCounts)) {
          ilceCounts[ilce] = 0
        }
      })
    }

    // Değerlere göre sırala (en yüksekten en düşüğe)
    const ilceDistribution = Object.entries(ilceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Talep konularına göre grafik (normalize et)
    const talepKonusuCounts: Record<string, number> = {}
    requests.forEach((req) => {
      const normalizedKonu = req.talepKonusu.trim()
      talepKonusuCounts[normalizedKonu] = (talepKonusuCounts[normalizedKonu] || 0) + 1
    })
    const talepKonusuDistribution = Object.entries(talepKonusuCounts).map(([name, value]) => ({ name, value }))

    // Değerlendirme sonuçlarına göre oranlar (normalize et)
    const degerlendirmeSonucuCounts: Record<string, number> = {}
    requests.forEach((req) => {
      const normalizedSonuc = req.degerlendirmeSonucu.trim()
      degerlendirmeSonucuCounts[normalizedSonuc] = (degerlendirmeSonucuCounts[normalizedSonuc] || 0) + 1
    })
    const degerlendirmeSonucuDistribution = Object.entries(degerlendirmeSonucuCounts).map(([name, value]) => ({
      name,
      value,
    }))

    // Aylık/zamansal eğilimler
    const monthlyCounts = requests.reduce(
      (acc, req) => {
        const month = req.talepTarihi.substring(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    const monthlyTrends = Object.entries(monthlyCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // En çok talep gelen 10 ilçe ve talep konuları (büyük/küçük harf sorununu çöz)
    const ilceTopicCounts: Record<string, Record<string, number>> = {}
    requests.forEach((req) => {
      const normalizedIlce = req.ilceAdi.trim().toUpperCase()
      const normalizedKonu = req.talepKonusu.trim()
      if (!ilceTopicCounts[normalizedIlce]) {
        ilceTopicCounts[normalizedIlce] = {}
      }
      ilceTopicCounts[normalizedIlce][normalizedKonu] = (ilceTopicCounts[normalizedIlce][normalizedKonu] || 0) + 1
    })

    const top10IlceTopics = Object.entries(ilceTopicCounts)
      .map(([ilce, topics]) => ({
        ilce,
        totalRequests: Object.values(topics).reduce((sum, count) => sum + count, 0),
        topics: Object.entries(topics).sort(([, countA], [, countB]) => countB - countA),
      }))
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10)

    // En çok talep gelen 10 mahalle ve talep konuları (büyük/küçük harf sorununu çöz)
    const mahalleTopicCounts: Record<string, Record<string, number>> = {}
    requests.forEach((req) => {
      const mahalleKey = `${req.ilceAdi.trim().toUpperCase()} - ${req.mahalleAdi.trim().toUpperCase()}`
      const normalizedKonu = req.talepKonusu.trim()
      if (!mahalleTopicCounts[mahalleKey]) {
        mahalleTopicCounts[mahalleKey] = {}
      }
      mahalleTopicCounts[mahalleKey][normalizedKonu] = (mahalleTopicCounts[mahalleKey][normalizedKonu] || 0) + 1
    })

    const top10MahalleTopics = Object.entries(mahalleTopicCounts)
      .map(([mahalle, topics]) => ({
        mahalle,
        totalRequests: Object.values(topics).reduce((sum, count) => sum + count, 0),
        topics: Object.entries(topics).sort(([, countA], [, countB]) => countB - countA),
      }))
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10)

    setChartData({
      ilceDistribution,
      talepKonusuDistribution,
      degerlendirmeSonucuDistribution,
      monthlyTrends,
      top10IlceTopics,
      top10MahalleTopics,
    })
  }, [requests, loadingMuhtarData, allMuhtarInfos])

  if (loadingMuhtarData) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <p>Dashboard verileri yükleniyor...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Temel KPI Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl hover:bg-white/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Toplam Başvuru</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalRequests}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl hover:bg-white/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Olumlu</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{olumluCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl hover:bg-white/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Olumsuz</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{olumsuzCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl hover:bg-white/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Değerlendirilecek</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{degerlendirilecekkCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl hover:bg-white/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">İnceleniyor</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{inceleniyorCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ana Grafikler */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-blue-600" /> İlçe Bazlı Başvuru Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                layout="horizontal"
                data={chartData.ilceDistribution}
                margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300/50" />
                <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  style={{ fontSize: "10px" }} 
                  width={75}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    backdropFilter: "blur(20px)",
                    backgroundColor: "rgba(255,255,255,0.95)"
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#blueGradient)" 
                  name="Başvuru Sayısı" 
                  radius={[0, 8, 8, 0]}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
              <Tag className="h-5 w-5 text-green-600" /> Talep Konularına Göre Dağılım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Pie
                  data={chartData.talepKonusuDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  animationDuration={500}
                >
                  {chartData.talepKonusuDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    backdropFilter: "blur(20px)",
                    backgroundColor: "rgba(255,255,255,0.95)"
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-5 w-5 text-purple-600" /> Değerlendirme Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Pie
                  data={chartData.degerlendirmeSonucuDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  animationDuration={500}
                >
                  {chartData.degerlendirmeSonucuDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    backdropFilter: "blur(20px)",
                    backgroundColor: "rgba(255,255,255,0.95)"
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
              <TrendingUp className="h-5 w-5 text-orange-600" /> Aylık Talep Eğilimleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthlyTrends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300/50" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    backdropFilter: "blur(20px)",
                    backgroundColor: "rgba(255,255,255,0.95)"
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#F97316"
                  activeDot={{ r: 6, fill: "#EA580C" }}
                  name="Talep Sayısı"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* En Çok Talep Gelen İlçeler */}
        <Card className="lg:col-span-3 bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-teal-600" /> En Çok Talep Gelen 10 İlçe
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {chartData.top10IlceTopics.length === 0 ? (
              <p className="text-center text-gray-500">Veri bulunamadı.</p>
            ) : (
              chartData.top10IlceTopics.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40">
                  <span className="font-medium text-base text-gray-700">{item.ilce}</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-teal-100/80 text-teal-700 hover:bg-teal-200/80 backdrop-blur-sm rounded-full"
                    >
                      {item.totalRequests} Talep
                    </Badge>
                    {item.topics.map(([topic, count]) => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="bg-white/50 border-white/60 text-gray-600 backdrop-blur-sm rounded-full"
                      >
                        {topic}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* En Çok Talep Gelen Mahalleler */}
        <Card className="lg:col-span-3 bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-indigo-600" /> En Çok Talep Gelen 10 Mahalle
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {chartData.top10MahalleTopics.length === 0 ? (
              <p className="text-center text-gray-500">Veri bulunamadı.</p>
            ) : (
              chartData.top10MahalleTopics.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40">
                  <span className="font-medium text-base text-gray-700">{item.mahalle}</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80 backdrop-blur-sm rounded-full"
                    >
                      {item.totalRequests} Talep
                    </Badge>
                    {item.topics.map(([topic, count]) => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="bg-white/50 border-white/60 text-gray-600 backdrop-blur-sm rounded-full"
                      >
                        {topic}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
