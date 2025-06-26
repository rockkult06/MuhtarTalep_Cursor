import { Card, CardContent } from "@/components/ui/card"
import { Request } from "@/lib/data"
import { ClipboardList, ThumbsUp, ThumbsDown, HelpCircle, Search } from "lucide-react"

interface KPICardsProps {
  requests: Request[],
  onFilter: (filter: string | null) => void,
  activeFilter: string | null
}

export function KPICards({ requests, onFilter, activeFilter }: KPICardsProps) {
  // KPI hesaplamaları
  const totalRequests = requests.length
  const approvedRequests = requests.filter((req) => req.degerlendirmeSonucu.trim() === "Olumlu").length
  const rejectedRequests = requests.filter((req) => req.degerlendirmeSonucu.trim() === "Olumsuz").length
  const pendingRequests = requests.filter((req) => req.degerlendirmeSonucu.trim() === "Değerlendirilecek").length
  const inProgressRequests = requests.filter((req) => req.degerlendirmeSonucu.trim() === "İnceleniyor").length

  const kpiData = [
    {
      title: "Toplam Başvuru",
      value: totalRequests,
      icon: ClipboardList,
      color: "text-blue-600",
      filter: null,
    },
    {
      title: "Olumlu",
      value: approvedRequests,
      icon: ThumbsUp,
      color: "text-green-600",
      filter: "Olumlu",
    },
    {
      title: "Olumsuz",
      value: rejectedRequests,
      icon: ThumbsDown,
      color: "text-red-600",
      filter: "Olumsuz",
    },
    {
      title: "Değerlendirilecek",
      value: pendingRequests,
      icon: HelpCircle,
      color: "text-yellow-600",
      filter: "Değerlendirilecek",
    },
    {
      title: "İnceleniyor",
      value: inProgressRequests,
      icon: Search,
      color: "text-purple-600",
      filter: "İnceleniyor",
    },
  ]

  const handleFilterClick = (filter: string | null) => {
    onFilter(filter === activeFilter ? null : filter)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        const isActive = kpi.filter === activeFilter
        return (
          <Card
            key={index}
            onClick={() => handleFilterClick(kpi.filter)}
            className={`cursor-pointer ${isActive ? "shadow-lg" : "opacity-50"}`}
          >
            <CardContent className="flex items-center p-6">
              <Icon className={`w-8 h-8 ${kpi.color} mr-4`} />
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-bold">{kpi.value}</h3>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 