import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Request } from "@/lib/data"
import { ClipboardList, ThumbsUp, ThumbsDown, HelpCircle, Search } from "lucide-react"
import { useMemo } from "react"

interface KPICardsProps {
  requests: Request[],
  activeFilter: string | null,
  onCardClick: (filter: string | null) => void
}

export function KPICards({ requests, activeFilter, onCardClick }: KPICardsProps) {
  const counts = useMemo(() => {
    const total = requests.length
    const olumlu = requests.filter((req) => req.degerlendirmeSonucu.trim() === "Olumlu").length
    const olumsuz = requests.filter((req) => req.degerlendirmeSonucu.trim() === "Olumsuz").length
    const inceleniyor = requests.filter((req) => req.degerlendirmeSonucu.trim() === "İnceleniyor").length
    const degerlendirilecek = requests.filter((req) => req.degerlendirmeSonucu.trim() === "Değerlendirilecek").length

    return { total, olumlu, olumsuz, inceleniyor, degerlendirilecek }
  }, [requests])

  const kpiData = [
    {
      title: "Toplam Başvuru",
      value: counts.total,
      icon: ClipboardList,
      color: "text-blue-600",
      filter: null,
    },
    {
      title: "Olumlu",
      value: counts.olumlu,
      icon: ThumbsUp,
      color: "text-green-600",
      filter: "Olumlu",
    },
    {
      title: "Olumsuz",
      value: counts.olumsuz,
      icon: ThumbsDown,
      color: "text-red-600",
      filter: "Olumsuz",
    },
    {
      title: "Değerlendirilecek",
      value: counts.degerlendirilecek,
      icon: HelpCircle,
      color: "text-yellow-600",
      filter: "Değerlendirilecek",
    },
    {
      title: "İnceleniyor",
      value: counts.inceleniyor,
      icon: Search,
      color: "text-purple-600",
      filter: "İnceleniyor",
    },
  ]

  const kpiDataWithCounts = kpiData.map(kpi => {
    switch (kpi.filter) {
      case 'Değerlendirilecek': return { ...kpi, value: counts.degerlendirilecek }
      default: return kpi
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpiDataWithCounts.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={index}
            className={`cursor-pointer transition-all duration-300 ${activeFilter === kpi.filter ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
            onClick={() => onCardClick(activeFilter === kpi.filter ? null : kpi.filter)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 