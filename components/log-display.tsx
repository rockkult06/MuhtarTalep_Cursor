"use client"

import { getLogsForRequest, type LogEntry } from "@/lib/data"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface LogDisplayProps {
  requestId: string
}

export function LogDisplay({ requestId }: LogDisplayProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedLogs = await getLogsForRequest(requestId)
        setLogs(fetchedLogs)
      } catch (err) {
        console.error("Failed to fetch logs:", err)
        setError("Geçmiş kayıtlar yüklenirken bir hata oluştu.")
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [requestId])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Geçmiş kayıtlar yükleniyor...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  if (logs.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Bu talep için geçmiş kayıt bulunmamaktadır.</div>
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto p-4">
      {logs.map((log, index) => (
        <Card key={log.id} className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {log.action === "create" ? "Talep Oluşturuldu" : "Talep Güncellendi"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm:ss")}
              {log.guncelleyen && ` tarafından: ${log.guncelleyen}`}
            </p>
          </CardHeader>
          <CardContent>
            {log.changes && log.changes.length > 0 ? (
              <ul className="list-disc pl-5 text-sm">
                {log.changes.map((change, changeIndex) => (
                  <li key={changeIndex}>
                    <span className="font-medium">{change.field}:</span>{" "}
                    {change.oldValue !== null && (
                      <>
                        <span className="text-red-500 line-through">{String(change.oldValue)}</span> {" -> "}
                      </>
                    )}
                    <span className="text-green-600">{String(change.newValue)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Değişiklik bulunamadı.</p>
            )}
          </CardContent>
          {index < logs.length - 1 && <Separator className="my-2" />}
        </Card>
      ))}
    </div>
  )
}
