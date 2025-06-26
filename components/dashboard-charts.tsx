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
import { Hash, MapPin, Tag, TrendingUp, CheckCircle } from "lucide-react" // Yeni ikonlar
import { Badge } from "@/components/ui/badge" // Badge için import

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
    if (loadingMuhtarData) return

    // İlçe bazlı başvuru dağılımı (Büyük/küçük harf sorununu çöz)
    const uniqueIlceler = [...new Set(allMuhtarInfos.map((info) => info.ilceAdi.toUpperCase()))]
    const ilceCounts: Record<string, number> = {}
    uniqueIlceler.forEach((ilce) => (ilceCounts[ilce] = 0)) // Initialize all districts to 0

    requests.forEach((req) => {
      const normalizedIlce = req.ilceAdi.toUpperCase()
      ilceCounts[normalizedIlce] = (ilceCounts[normalizedIlce] || 0) + 1
    })
    // Değerlere göre sırala (en yüksekten en düşüğe)
    const ilceDistribution = Object.entries(ilceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Talep konularına göre grafik
    const talepKonusuCounts = requests.reduce(
      (acc, req) => {
        acc[req.talepKonusu] = (acc[req.talepKonusu] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    const talepKonusuDistribution = Object.entries(talepKonusuCounts).map(([name, value]) => ({ name, value }))

    // Değerlendirme sonuçlarına göre oranlar
    const degerlendirmeSonucuCounts = requests.reduce(
      (acc, req) => {
        acc[req.degerlendirmeSonucu] = (acc[req.degerlendirmeSonucu] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
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

    // NEW: En çok talep gelen 10 ilçe ve talep konuları (büyük/küçük harf sorununu çöz)
    const ilceTopicCounts: Record<string, Record<string, number>> = {}
    requests.forEach((req) => {
      const normalizedIlce = req.ilceAdi.toUpperCase()
      if (!ilceTopicCounts[normalizedIlce]) {
        ilceTopicCounts[normalizedIlce] = {}
      }
      ilceTopicCounts[normalizedIlce][req.talepKonusu] = (ilceTopicCounts[normalizedIlce][req.talepKonusu] || 0) + 1
    })

    const top10IlceTopics = Object.entries(ilceTopicCounts)
      .map(([ilce, topics]) => ({
        ilce,
        totalRequests: Object.values(topics).reduce((sum, count) => sum + count, 0),
        topics: Object.entries(topics).sort(([, countA], [, countB]) => countB - countA),
      }))
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10)

    // NEW: En çok talep gelen 10 mahalle ve talep konuları (büyük/küçük harf sorununu çöz)
    const mahalleTopicCounts: Record<string, Record<string, number>> = {}
    requests.forEach((req) => {
      const mahalleKey = `${req.ilceAdi.toUpperCase()} - ${req.mahalleAdi.toUpperCase()}` // Normalize both
      if (!mahalleTopicCounts[mahalleKey]) {
        mahalleTopicCounts[mahalleKey] = {}
      }
      mahalleTopicCounts[mahalleKey][req.talepKonusu] = (mahalleTopicCounts[mahalleKey][req.talepKonusu] || 0) + 1
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-6">
      <Card className="lg:col-span-3 backdrop-blur-sm bg-white/70 border-white/20 shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Hash className="h-6 w-6 text-theme-primary" /> Toplam Başvuru Sayısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-center py-8 text-theme-primary">{requests.length}</div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 backdrop-blur-sm bg-white/70 border-white/20 shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <MapPin className="h-5 w-5 text-theme-primary" /> İlçe Bazlı Başvuru Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="horizontal"
              data={chartData.ilceDistribution}
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                style={{ fontSize: "11px" }} 
                width={70}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  backdropFilter: "blur(10px)",
                  backgroundColor: "rgba(255,255,255,0.9)"
                }}
              />
              <Bar dataKey="value" fill={COLORS[0]} name="Başvuru Sayısı" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Tag className="h-5 w-5 text-theme-primary" /> Talep Konularına Göre Dağılım
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
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  backdropFilter: "blur(10px)",
                  backgroundColor: "rgba(255,255,255,0.9)"
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-theme-primary" /> Değerlendirme Sonuçlarına Göre Oranlar
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
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  backdropFilter: "blur(10px)",
                  backgroundColor: "rgba(255,255,255,0.9)"
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 backdrop-blur-sm bg-white/70 border-white/20 shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-theme-primary" /> Aylık Talep Eğilimleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.monthlyTrends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
              <YAxis tickLine={false} axisLine={false} style={{ fontSize: "12px" }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  backdropFilter: "blur(10px)",
                  backgroundColor: "rgba(255,255,255,0.9)"
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={COLORS[0]}
                activeDot={{ r: 6 }}
                name="Talep Sayısı"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* NEW: Top 10 İlçe ve Talep Konuları (Badge formatında) */}
      <Card className="lg:col-span-3 backdrop-blur-sm bg-white/70 border-white/20 shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <MapPin className="h-5 w-5 text-theme-primary" /> En Çok Talep Gelen 10 İlçe
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {chartData.top10IlceTopics.length === 0 ? (
            <p className="text-center text-muted-foreground">Veri bulunamadı.</p>
          ) : (
            chartData.top10IlceTopics.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                <span className="font-medium text-base">{item.ilce}</span>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-theme-primary/20 text-theme-primary hover:bg-theme-primary/30 backdrop-blur-sm rounded-full"
                  >
                    {item.totalRequests} Talep
                  </Badge>
                  {item.topics.map(([topic, count]) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="bg-white/60 border-white/40 text-muted-foreground backdrop-blur-sm rounded-full"
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

      {/* NEW: Top 10 Mahalle ve Talep Konuları (Badge formatında) */}
      <Card className="lg:col-span-3 backdrop-blur-sm bg-white/70 border-white/20 shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <MapPin className="h-5 w-5 text-theme-primary" /> En Çok Talep Gelen 10 Mahalle
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {chartData.top10MahalleTopics.length === 0 ? (
            <p className="text-center text-muted-foreground">Veri bulunamadı.</p>
          ) : (
            chartData.top10MahalleTopics.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30">
                <span className="font-medium text-base">{item.mahalle}</span>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-theme-primary/20 text-theme-primary hover:bg-theme-primary/30 backdrop-blur-sm rounded-full"
                  >
                    {item.totalRequests} Talep
                  </Badge>
                  {item.topics.map(([topic, count]) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="bg-white/60 border-white/40 text-muted-foreground backdrop-blur-sm rounded-full"
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
  )
}
