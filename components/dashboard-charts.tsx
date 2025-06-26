"use client"

import { useMemo } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Request, type LogEntry } from "@/lib/data"
import { Users, MapPin, Tag, CheckCircle, Activity } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface DashboardChartsProps {
  requests: Request[]
  logs: LogEntry[]
}

// Kullanıcı Aktivitesi Tablosu Bileşeni
function UserActivityTable({ requests, logs }: { requests: Request[], logs: LogEntry[] }) {
  const userStats = useMemo(() => {
    const stats: Record<string, { created: number; updated: Set<string> }> = {};

    if (Array.isArray(requests)) {
      requests.forEach(req => {
        const username = req.talebiOlusturan;
        if (!username) return;
        if (!stats[username]) stats[username] = { created: 0, updated: new Set() };
        stats[username].created += 1;
      });
    }

    if (Array.isArray(logs)) {
      logs.forEach(log => {
        if (log.action === 'update' && log.guncelleyen) {
          const username = log.guncelleyen;
          if (!stats[username]) stats[username] = { created: 0, updated: new Set() };
          stats[username].updated.add(log.requestId);
        }
      });
    }

    return Object.entries(stats).map(([username, data]) => ({
      username,
      created: data.created,
      updated: data.updated.size,
    })).sort((a, b) => (b.created + b.updated) - (a.created + a.updated));

  }, [requests, logs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Kullanıcı Aktivitesi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead className="text-center">Oluşturduğu</TableHead>
                <TableHead className="text-center">Güncellediği</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {userStats.length > 0 ? userStats.map(stat => (
                <TableRow key={stat.username}>
                    <TableCell className="font-medium">{stat.username}</TableCell>
                    <TableCell className="text-center">{stat.created}</TableCell>
                    <TableCell className="text-center">{stat.updated}</TableCell>
                </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">Görüntülenecek kullanıcı verisi yok.</TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  )
}


export function DashboardCharts({ requests, logs }: DashboardChartsProps) {
  const chartData = useMemo(() => {
    const ilceDistribution: Record<string, number> = {};
    const talepKonusuDistribution: Record<string, number> = {};
    const degerlendirmeSonucuDistribution: Record<string, number> = {};

    if (Array.isArray(requests)) {
        requests.forEach(req => {
            const ilce = req.ilceAdi?.trim() || "Belirtilmemiş";
            const konu = req.talepKonusu?.trim() || "Belirtilmemiş";
            const sonuc = req.degerlendirmeSonucu?.trim() || "Belirtilmemiş";

            ilceDistribution[ilce] = (ilceDistribution[ilce] || 0) + 1;
            talepKonusuDistribution[konu] = (talepKonusuDistribution[konu] || 0) + 1;
            degerlendirmeSonucuDistribution[sonuc] = (degerlendirmeSonucuDistribution[sonuc] || 0) + 1;
        });
    }

    return {
        ilceDistribution: Object.entries(ilceDistribution).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        talepKonusuDistribution: Object.entries(talepKonusuDistribution).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        degerlendirmeSonucuDistribution: Object.entries(degerlendirmeSonucuDistribution).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Taraf: İlçe ve Kullanıcı Tabloları */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin/> İlçe Bazlı Başvuru Dağılımı</CardTitle></CardHeader>
                <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>İlçe</TableHead><TableHead className="text-right">Talep Sayısı</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {chartData.ilceDistribution.map(item => (
                                    <TableRow key={item.name}><TableCell>{item.name}</TableCell><TableCell className="text-right">{item.value}</TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <UserActivityTable requests={requests} logs={logs} />
        </div>

        {/* Sağ Taraf: Pasta Grafikler */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Tag/> Talep Konularına Göre Dağılım</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={chartData.talepKonusuDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {chartData.talepKonusuDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle/> Değerlendirme Sonuçları</CardTitle></CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={chartData.degerlendirmeSonucuDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {chartData.degerlendirmeSonucuDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
