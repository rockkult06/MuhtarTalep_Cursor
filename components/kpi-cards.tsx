import { Card, CardContent } from "@/components/ui/card"
import { Request } from "@/lib/data"
import { FileText, CheckCircle, XCircle, Clock, Search } from "lucide-react"

interface KPICardsProps {
  requests: Request[]
}

export function KPICards({ requests }: KPICardsProps) {
  // KPI hesaplamaları
  const toplamBasvuru = requests.length
  const olumlu = requests.filter(req => req.degerlendirmeSonucu === "Olumlu").length
  const olumsuz = requests.filter(req => req.degerlendirmeSonucu === "Olumsuz").length
  const degerlendirilecek = requests.filter(req => req.degerlendirmeSonucu === "Değerlendirilecek").length
  const inceleniyor = requests.filter(req => req.degerlendirmeSonucu === "İnceleniyor").length

  const kpiData = [
    {
      title: "Toplam Başvuru",
      value: toplamBasvuru,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Olumlu",
      value: olumlu,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Olumsuz",
      value: olumsuz,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Değerlendirilecek",
      value: degerlendirilecek,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "İnceleniyor",
      value: inceleniyor,
      icon: Search,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 