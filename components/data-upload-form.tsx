"use client"

import type React from "react"
import * as XLSX from "xlsx"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addMuhtarData, bulkImportRequests, type MuhtarInfo, type Request as RequestType } from "@/lib/data"

interface DataUploadFormProps {
  onUploadSuccess?: () => void
}

// --- DATE HELPERS -----------------------------------------------------------
/**
 * Converts various date representations (string, number, Date) to `YYYY-MM-DD`.
 *  • String  :  "31.12.2024"  ➜  "2024-12-31"
 *               "2024-12-31" (ISO) is returned unchanged
 *  • Number  :  Excel serial number (e.g. 45291) ➜ "2024-01-15"
 *  • Date    :  JS Date instance                ➜ "2024-01-15"
 */
const toYyyyMmDd = (value: unknown): string => {
  // Excel serial number → Date
  const excelSerialToDate = (n: number) => {
    // Excel counts days since 1899-12-30
    const utcMillis = (n - 25569) * 86400 * 1000
    return new Date(utcMillis)
  }

  // 1. Date instance
  if (value instanceof Date) {
    return value.toISOString().split("T")[0]
  }

  // 2. Excel serial number
  if (typeof value === "number") {
    return excelSerialToDate(value).toISOString().split("T")[0]
  }

  // 3. String formats
  if (typeof value === "string") {
    // "DD.MM.YYYY"  →  "YYYY-MM-DD"
    if (value.includes(".")) {
      const [dd, mm, yyyy] = value.split(".")
      if (dd && mm && yyyy) return `${yyyy}-${mm}-${dd}`
    }
    // Already ISO-ish: return as is
    return value.trim()
  }

  // Fallback: today
  return new Date().toISOString().split("T")[0]
}

export function DataUploadForm({ onUploadSuccess = () => {} }: DataUploadFormProps) {
  const [muhtarFile, setMuhtarFile] = useState<File | null>(null)
  const [requestFile, setRequestFile] = useState<File | null>(null)
  const [muhtarMessage, setMuhtarMessage] = useState("")
  const [requestMessage, setRequestMessage] = useState("")
  const [loadingMuhtar, setLoadingMuhtar] = useState(false)
  const [loadingRequest, setLoadingRequest] = useState(false)

  const handleMuhtarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMuhtarFile(event.target.files[0])
      setMuhtarMessage("")
    }
  }

  const handleRequestFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setRequestFile(event.target.files[0])
      setRequestMessage("")
    }
  }

  const parseLine = (line: string, delim: string): string[] => {
    const fields: string[] = []
    let currentField = ""
    let inQuote = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuote) {
          if (i + 1 < line.length && line[i + 1] === '"') {
            currentField += '"'
            i++
          } else {
            inQuote = false
          }
        } else {
          inQuote = true
        }
      } else if (char === delim && !inQuote) {
        fields.push(currentField)
        currentField = ""
      } else {
        currentField += char
      }
    }
    fields.push(currentField)

    return fields
  }

  const parseCsv = (csvString: string, type: "muhtar" | "request") => {
    csvString = csvString.replace(/\r\n?/g, "\n")
    csvString = csvString.replace(/^\ufeff/, "")

    let headerEndIndex = -1
    let inQuote = false
    for (let i = 0; i < csvString.length; i++) {
      if (csvString[i] === '"') {
        inQuote = !inQuote
      } else if (csvString[i] === "\n" && !inQuote) {
        headerEndIndex = i
        break
      }
    }

    let headerRaw = ""
    let dataRaw = ""

    if (headerEndIndex !== -1) {
      headerRaw = csvString.substring(0, headerEndIndex)
      dataRaw = csvString.substring(headerEndIndex + 1)
    } else {
      headerRaw = csvString
      dataRaw = ""
    }

    if (headerRaw.trim() === "") return []

    const delimiter =
      type === "request"
        ? ";"
        : (() => {
            const delimiters = ["\t", ";", ","]
            const delimiterCounts = delimiters.map((d) => ({
              d,
              count: (headerRaw.match(new RegExp(d, "g")) || []).length,
            }))
            return delimiterCounts.sort((a, b) => b.count - a.count)[0]?.d || ","
          })()

    const headers = parseLine(headerRaw, delimiter).map((h) =>
      String(h)
        .trim()
        .replace(/^"|"$/g, "")
        .replace(/\s*\n\s*/g, " "),
    )

    const dataRows = dataRaw
      .split("\n")
      .filter((l) => typeof l === "string" && l.trim() !== "")
      .map((line) => {
        const values = parseLine(line, delimiter)
        const row: Record<string, string> = {}
        headers.forEach((h, i) => (row[h] = values[i] ?? ""))
        return row
      })

    if (type === "muhtar") {
      const requiredMuhtarHeaders = ["İlçe Adı", "Mahalle Adı", "Muhtar Adı", "Muhtar Telefonu"]
      const missingMuhtarHeaders = requiredMuhtarHeaders.filter((h) => !headers.includes(h))
      if (missingMuhtarHeaders.length > 0) {
        throw new Error(`Eksik muhtar başlıkları: ${missingMuhtarHeaders.join(", ")}`)
      }
      return dataRows.map((item) => ({
        ilceAdi: item["İlçe Adı"],
        mahalleAdi: item["Mahalle Adı"],
        muhtarAdi: item["Muhtar Adı"],
        muhtarTelefonu: item["Muhtar Telefonu"],
      })) as MuhtarInfo[]
    } else {
      const requiredRequestHeaders = [
        "Talebi Oluşturan",
        "İlçe Adı",
        "Mahalle Adı",
        "Muhtar Adı",
        "Muhtar Telefonu",
        "Talebin Geliş Şekli",
        "Talebin Geliş Tarihi",
        "Talep Konusu",
        "Açıklama",
        "Değerlendirme",
        "Değerlendirme Sonucu",
      ]
      const missingRequestHeaders = requiredRequestHeaders.filter((h) => !headers.includes(h))
      if (missingRequestHeaders.length > 0) {
        throw new Error(`Eksik talep başlıkları: ${missingRequestHeaders.join(", ")}`)
      }

      return dataRows.map((item) => ({
        talebiOlusturan: item["Talebi Oluşturan"],
        ilceAdi: item["İlçe Adı"],
        mahalleAdi: item["Mahalle Adı"],
        muhtarAdi: item["Muhtar Adı"] || "",
        muhtarTelefonu: item["Muhtar Telefonu"] || "",
        talebinGelisSekli: item["Talebin Geliş Şekli"],
        talepTarihi: toYyyyMmDd(item["Talebin Geliş Tarihi"]),
        talepKonusu: item["Talep Konusu"],
        aciklama: item["Açıklama"],
        degerlendirme: item["Değerlendirme"],
        degerlendirmeSonucu: item["Değerlendirme Sonucu"],
        guncelleyen: item["Güncelleyen"] || "",
      })) as Omit<RequestType, "id" | "talepNo" | "guncellemeTarihi">[]
    }
  }

  const parseExcel = async (file: File, type: "muhtar" | "request") => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          // header: 1 ensures the first row is used as headers
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

          if (json.length === 0) {
            resolve([])
            return
          }

          const rawHeaders = json[0]
          const dataRows = json.slice(1)

          // Normalize headers: trim, replace newlines with spaces
          const headers = rawHeaders.map((h) => String(h).trim().replace(/\s*\n\s*/g, " "))

          const processedData = dataRows.map((row) => {
            const newRow: Record<string, any> = {}
            headers.forEach((header, index) => {
              newRow[header] = row[index]
            })
            return newRow
          })

          if (type === "muhtar") {
            const requiredMuhtarHeaders = ["İlçe Adı", "Mahalle Adı", "Muhtar Adı", "Muhtar Telefonu"]
            const missingMuhtarHeaders = requiredMuhtarHeaders.filter((h) => !headers.includes(h))
            if (missingMuhtarHeaders.length > 0) {
              throw new Error(`Eksik muhtar başlıkları: ${missingMuhtarHeaders.join(", ")}`)
            }
            return resolve(
              processedData.map((item) => ({
                ilceAdi: item["İlçe Adı"],
                mahalleAdi: item["Mahalle Adı"],
                muhtarAdi: item["Muhtar Adı"],
                muhtarTelefonu: item["Muhtar Telefonu"],
              })) as MuhtarInfo[],
            )
          } else {
            const requiredRequestHeaders = [
              "Talebi Oluşturan",
              "İlçe Adı",
              "Mahalle Adı",
              "Muhtar Adı",
              "Muhtar Telefonu",
              "Talebin Geliş Şekli",
              "Talebin Geliş Tarihi",
              "Talep Konusu",
              "Açıklama",
              "Değerlendirme",
              "Değerlendirme Sonucu",
            ]
            const missingRequestHeaders = requiredRequestHeaders.filter((h) => !headers.includes(h))
            if (missingRequestHeaders.length > 0) {
              throw new Error(`Eksik talep başlıkları: ${missingRequestHeaders.join(", ")}`)
            }
            return resolve(
              processedData.map((item) => ({
                talebiOlusturan: item["Talebi Oluşturan"],
                ilceAdi: item["İlçe Adı"],
                mahalleAdi: item["Mahalle Adı"],
                muhtarAdi: item["Muhtar Adı"] || "",
                muhtarTelefonu: item["Muhtar Telefonu"] || "",
                talebinGelisSekli: item["Talebin Geliş Şekli"],
                talepTarihi: toYyyyMmDd(item["Talebin Geliş Tarihi"]),
                talepKonusu: item["Talep Konusu"],
                aciklama: item["Açıklama"],
                degerlendirme: item["Değerlendirme"],
                degerlendirmeSonucu: item["Değerlendirme Sonucu"],
                guncelleyen: item["Güncelleyen"] || "",
              })) as Omit<RequestType, "id" | "talepNo" | "guncellemeTarihi">[],
            )
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  const handleMuhtarUpload = () => {
    if (!muhtarFile) {
      setMuhtarMessage("Lütfen bir muhtar CSV veya Excel dosyası seçin.")
      return
    }

    setLoadingMuhtar(true)
    setMuhtarMessage("")

    const isExcel = muhtarFile.name.endsWith(".xlsx") || muhtarFile.name.endsWith(".xls")

    const processFile = async (fileContent: string | File) => {
      try {
        let parsedData: MuhtarInfo[]
        if (isExcel) {
          parsedData = (await parseExcel(fileContent as File, "muhtar")) as MuhtarInfo[]
        } else {
          parsedData = parseCsv(fileContent as string, "muhtar") as MuhtarInfo[]
        }
        await addMuhtarData(parsedData)
        setMuhtarMessage(`Başarıyla ${parsedData.length} muhtar bilgisi yüklendi.`)
        onUploadSuccess()
      } catch (error: any) {
        console.error("Muhtar dosya yükleme hatası:", error)
        setMuhtarMessage(`Muhtar dosyası işlenirken bir hata oluştu: ${error.message}`)
      } finally {
        setLoadingMuhtar(false)
      }
    }

    if (isExcel) {
      processFile(muhtarFile)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => processFile(e.target?.result as string)
      reader.readAsText(muhtarFile)
    }
  }

  const handleRequestUpload = () => {
    if (!requestFile) {
      setRequestMessage("Lütfen bir talep CSV veya Excel dosyası seçin.")
      return
    }

    setLoadingRequest(true)
    setRequestMessage("")

    const isExcel = requestFile.name.endsWith(".xlsx") || requestFile.name.endsWith(".xls")

    const processFile = async (fileContent: string | File) => {
      try {
        let parsedData: Omit<RequestType, "id" | "talepNo" | "guncellemeTarihi">[]
        if (isExcel) {
          parsedData = (await parseExcel(fileContent as File, "request")) as Omit<
            RequestType,
            "id" | "talepNo" | "guncellemeTarihi"
          >[]
        } else {
          parsedData = parseCsv(fileContent as string, "request") as Omit<
            RequestType,
            "id" | "talepNo" | "guncellemeTarihi"
          >[]
        }
        await bulkImportRequests(parsedData)
        setRequestMessage(`Başarıyla ${parsedData.length} talep yüklendi.`)
        onUploadSuccess()
      } catch (error: any) {
        console.error("Talep dosya yükleme hatası:", error)
        setRequestMessage(`Talep dosyası işlenirken bir hata oluştu: ${error.message}`)
      } finally {
        setLoadingRequest(false)
      }
    }

    if (isExcel) {
      processFile(requestFile)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => processFile(e.target?.result as string)
      reader.readAsText(requestFile)
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="shadow-sm rounded-lg">
        {" "}
        {/* Kartlara gölge ve yuvarlak köşeler */}
        <CardHeader>
          <CardTitle>Muhtar Bilgilerini Yükle</CardTitle>
          <CardDescription>
            İlçe, mahalle, muhtar adı ve telefon bilgilerini içeren bir CSV veya Excel dosyası yükleyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="muhtar-csv">Muhtar Dosyası</Label>
            <Input id="muhtar-csv" type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleMuhtarFileChange} />
            {muhtarMessage && <p className="text-sm text-muted-foreground mt-2">{muhtarMessage}</p>}
          </div>
          <Button
            onClick={handleMuhtarUpload}
            disabled={!muhtarFile || loadingMuhtar}
            className="hover:shadow-md transition-shadow"
          >
            {loadingMuhtar ? "Yükleniyor..." : "Muhtar Verilerini Yükle"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm rounded-lg">
        {" "}
        {/* Kartlara gölge ve yuvarlak köşeler */}
        <CardHeader>
          <CardTitle>Talep Verilerini Yükle</CardTitle>
          <CardDescription>Mevcut talep verilerini içeren bir CSV veya Excel dosyası yükleyin.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="request-csv">Talep Dosyası</Label>
            <Input id="request-csv" type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleRequestFileChange} />
            {requestMessage && <p className="text-sm text-muted-foreground mt-2">{requestMessage}</p>}
          </div>
          <Button
            onClick={handleRequestUpload}
            disabled={!requestFile || loadingRequest}
            className="hover:shadow-md transition-shadow"
          >
            {loadingRequest ? "Yükleniyor..." : "Talep Verilerini Yükle"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
