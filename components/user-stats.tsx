"use client"

import { useState, useEffect } from "react"
import { getUserStats, type UserStats as UserStatsData } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, UserCheck } from "lucide-react"

export function UserStats() {
  const [stats, setStats] = useState<UserStatsData>({ creations: {}, updates: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const data = await getUserStats()
      setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [])

  const sortedCreations = Object.entries(stats.creations).sort(([, a], [, b]) => b - a)
  const sortedUpdates = Object.entries(stats.updates).sort(([, a], [, b]) => b - a)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            En Çok Talep Oluşturanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead className="text-right">Oluşturulan Talep</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCreations.map(([user, count]) => (
                <TableRow key={user}>
                  <TableCell className="font-medium">{user}</TableCell>
                  <TableCell className="text-right font-bold">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="bg-white/40 backdrop-blur-md border-white/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-green-600" />
            En Çok Güncelleyenler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead className="text-right">Güncellenen Talep</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUpdates.map(([user, count]) => (
                <TableRow key={user}>
                  <TableCell className="font-medium">{user}</TableCell>
                  <TableCell className="text-right font-bold">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 