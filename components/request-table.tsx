"use client"

import { useState, useMemo, useEffect, Fragment, useRef } from "react"
import type { Request, MuhtarInfo } from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowUpDown, ChevronDown, Trash2, FileDown, Search, Eye, Pencil } from "lucide-react" // Yeni ikonlar
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RequestForm } from "./request-form"
import { LogDisplay } from "./log-display"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { JSX } from "react"
import { getMuhtarData } from "@/lib/data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Tooltip için import

interface RequestTableProps {
  requests: Request[]
  onAddRequest: (data: Omit<Request, "id" | "talepNo" | "guncellemeTarihi"> & { guncelleyen?: string }) => void
  onUpdateRequest: (id: string, data: Partial<Request> & { guncelleyen?: string }) => void
  onDeleteRequests: (ids: string[]) => void
  filter: string | null
}

export function RequestTable({ requests, onAddRequest, onUpdateRequest, onDeleteRequests, filter }: RequestTableProps) {
  /* ───── state ─────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Request | null>("talepTarihi")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request>()
  const [selectedRequestIdForLogs, setSelectedRequestIdForLogs] = useState<string>()
  const [isCompactMode, setIsCompactMode] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const tableRef = useRef<HTMLDivElement>(null)

  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [openRowId, setOpenRowId] = useState<string | null>(null)

  /* filters for each column */
  const [filters, setFilters] = useState<Record<keyof Request, string>>({
    id: "",
    talepNo: "",
    talebiOlusturan: "",
    ilceAdi: "",
    mahalleAdi: "",
    muhtarAdi: "",
    muhtarTelefonu: "",
    talebinGelisSekli: "",
    talepTarihi: "",
    talepKonusu: "",
    aciklama: "",
    degerlendirme: "",
    degerlendirmeSonucu: "",
    guncellemeTarihi: "",
    guncelleyen: "",
  })

  /* muhtar cache (for dynamic filter options) */
  const [muhtarInfos, setMuhtarInfos] = useState<MuhtarInfo[]>([])
  useEffect(() => {
    getMuhtarData()
      .then(setMuhtarInfos)
      .catch(() => {})
  }, [])

  /* ───── helpers ───────────────────────────────────────── */
  const handleFilterChange = (col: keyof Request, value: string) => setFilters((prev) => ({ ...prev, [col]: value }))

  const handleSort = (col: keyof Request) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(col)
      setSortDirection("asc")
    }
  }

  const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))]

  /* options for selects */
  const uniqueIlceler = unique(muhtarInfos.map((i) => i.ilceAdi))
  const uniqueMahalleler = unique(
    (filters.ilceAdi ? muhtarInfos.filter((i) => i.ilceAdi === filters.ilceAdi) : muhtarInfos).map((i) => i.mahalleAdi),
  )
  const uniqueTalebinGelisSekli = unique(requests.map((r) => r.talebinGelisSekli))
  const uniqueTalepKonusu = unique(requests.map((r) => r.talepKonusu))
  const uniqueDegSonucu = unique(requests.map((r) => r.degerlendirmeSonucu))
  const uniqueGuncelleyen = unique(requests.map((r) => r.guncelleyen ?? ""))

  /* visible columns depending on compact mode */
  const compactCols: (keyof Request)[] = [
    "ilceAdi",
    "mahalleAdi",
    "talepTarihi",
    "talepKonusu",
    "aciklama",
    "degerlendirmeSonucu",
  ]
  const fullCols: (keyof Request)[] = [
    "talepNo",
    "talebiOlusturan",
    "ilceAdi",
    "mahalleAdi",
    "talebinGelisSekli",
    "talepTarihi",
    "talepKonusu",
    "aciklama",
    "degerlendirme",
    "degerlendirmeSonucu",
    "guncellemeTarihi",
    "guncelleyen",
  ]
  const visibleColumns = isCompactMode ? compactCols : fullCols

  /* human headers */
  const headerMap: Record<keyof Request, string | JSX.Element> = {
    id: "ID",
    talepNo: "Talep No",
    talebiOlusturan: "Talebi Oluşturan",
    ilceAdi: "İlçe Adı",
    mahalleAdi: "Mahalle Adı",
    muhtarAdi: "Muhtar Adı",
    muhtarTelefonu: "Muhtar Telefonu",
    talebinGelisSekli: (
      <>
        Talebin <br /> Geliş Şekli
      </>
    ),
    talepTarihi: "Talebin Geliş Tarihi",
    talepKonusu: "Talep Konusu",
    aciklama: "Açıklama",
    degerlendirme: "Değerlendirme",
    degerlendirmeSonucu: "Değerlendirme Sonucu",
    guncellemeTarihi: "Güncelleme Tarihi",
    guncelleyen: "Güncelleyen",
  }

  const getHeader = (col: keyof Request) => headerMap[col]

  /* ───── derive filtered & sorted list ─────────────────── */
  const filtered = useMemo(() => {
    let list = requests.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (filter) {
      list = list.filter((r) => r.degerlendirmeSonucu === filter)
    }

    list = list.filter((r) =>
      (Object.keys(filters) as (keyof Request)[]).every((col) => {
        const f = filters[col]
        if (!f) return true
        return String(r[col]).toLowerCase().includes(f.toLowerCase())
      }),
    )

    if (sortColumn) {
      list = [...list].sort((a, b) => {
        const av = a[sortColumn]
        const bv = b[sortColumn]
        return sortDirection === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }
    return list
  }, [requests, searchTerm, filters, sortColumn, sortDirection, filter])

  /* ───── selection helpers ─────────────────────────────── */
  const allSelected = selectedRequestIds.size === filtered.length && filtered.length > 0
  const someSelected = selectedRequestIds.size > 0 && !allSelected
  const toggleSelectAll = (check: boolean) =>
    setSelectedRequestIds(check ? new Set(filtered.map((r) => r.id)) : new Set())

  const toggleSelectOne = (id: string, check: boolean) =>
    setSelectedRequestIds((prev) => {
      const ns = new Set(prev)
      check ? ns.add(id) : ns.delete(id)
      return ns
    })

  /* ───── excel export ──────────────────────────────────── */
  const exportExcel = async () => {
    /* dynamic import to keep bundle small and avoid SSR hiccups */
    const XLSX = await import("xlsx")

    const rows = filtered.map((r) => ({
      "Talep No": r.talepNo,
      "Talebi Oluşturan": r.talebiOlusturan,
      "İlçe Adı": r.ilceAdi,
      "Mahalle Adı": r.mahalleAdi,
      "Muhtar Adı": r.muhtarAdi,
      "Muhtar Telefonu": r.muhtarTelefonu,
      "Talebin Geliş Şekli": r.talebinGelisSekli,
      "Talep Tarihi": r.talepTarihi,
      "Talep Konusu": r.talepKonusu,
      Açıklama: r.aciklama,
      Değerlendirme: r.degerlendirme,
      "Değerlendirme Sonucu": r.degerlendirmeSonucu,
      "Güncelleme Tarihi": r.guncellemeTarihi,
      Güncelleyen: r.guncelleyen ?? "",
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Talepler")

    /* write to ArrayBuffer instead of hitting the FS APIs */
    const arrayBuf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([arrayBuf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    /* trigger download */
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "talepler.xlsx"
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ───── scroll handling ────────────────────────────────── */
  const handleScroll = () => {
    if (tableRef.current) {
      setScrollPosition(tableRef.current.scrollTop)
    }
  }

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = scrollPosition
    }
  }, [scrollPosition, filtered])

  const handleUpdateRequest = async (id: string, data: Partial<Request> & { guncelleyen?: string }) => {
    await onUpdateRequest(id, data)
    if (tableRef.current) {
      setTimeout(() => {
        tableRef.current!.scrollTop = scrollPosition
      }, 0)
    }
  }

  /* ───── render ────────────────────────────────────────── */
  return (
    <TooltipProvider>
      <div className="p-6 md:p-8 animate-fade-in">
        {" "}
        {/* Daha geniş boşluklar, fade-in animasyon */}
        {/* top bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          {" "}
          {/* Daha fazla boşluk */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Taleplerde Genel Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-md shadow-sm" // Büyüteç ikonu için boşluk
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {" "}
            {/* Daha kompakt ve sağa hizalı */}
            {selectedRequestIds.size > 0 && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="rounded-md shadow-sm hover:shadow-md transition-shadow">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Seçilenleri Sil ({selectedRequestIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Silme İşlemini Onayla</AlertDialogTitle>
                    <AlertDialogDescription>
                      Seçilen {selectedRequestIds.size} talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setIsDeleteDialogOpen(false)
                        onDeleteRequests(Array.from(selectedRequestIds))
                        setSelectedRequestIds(new Set())
                      }}
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="outline"
              onClick={exportExcel}
              className="rounded-md shadow-sm hover:shadow-md transition-shadow"
            >
              <FileDown className="mr-2 h-4 w-4" /> Excel'e Aktar
            </Button>
            <div className="flex items-center space-x-2">
              <Label htmlFor="compact-mode">Kompakt Mod</Label>
              <Switch id="compact-mode" checked={isCompactMode} onCheckedChange={setIsCompactMode} />
            </div>
            {/* new / edit dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setSelectedRequest(undefined)}
                  className="bg-theme-primary text-primary-foreground hover:bg-theme-primary/90 rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  {" "}
                  {/* Yeni buton rengi ve animasyon */}
                  <PlusCircle className="mr-2 h-4 w-4" /> Yeni Talep Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
                <DialogHeader>
                  <DialogTitle>{selectedRequest ? "Talebi Düzenle" : "Yeni Talep Ekle"}</DialogTitle>
                </DialogHeader>
                <RequestForm
                  initialData={selectedRequest}
                  onSave={(data) => {
                    selectedRequest ? handleUpdateRequest(selectedRequest.id, data) : onAddRequest(data)
                    setIsFormOpen(false)
                  }}
                  onClose={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
            {/* log dialog */}
            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
                <DialogHeader>
                  <DialogTitle>Talep Geçmişi</DialogTitle>
                </DialogHeader>
                {selectedRequestIdForLogs && <LogDisplay requestId={selectedRequestIdForLogs} />}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* actual table */}
        <div 
          ref={tableRef} 
          onScroll={handleScroll} 
          className="relative overflow-auto border rounded-lg"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          <Table className="table-zebra">
            {" "}
            {/* Zebra çizgili tablo */}
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              {" "}
              {/* Sticky başlık */}
              {/* === HEADER ROW === */}
              <TableRow>
                {[
                  /* select-all */
                  <TableHead key="selectAll" className="w-[50px] text-center">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(c) => toggleSelectAll(c === true)}
                    />
                  </TableHead>,
                  /* dynamic headers */
                  ...visibleColumns.map((col) => (
                    <TableHead key={col}>
                      <Button variant="ghost" onClick={() => handleSort(col)} className="px-2 py-1 h-auto">
                        {" "}
                        {/* Daha kompakt buton */}
                        {getHeader(col)}
                        <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" /> {/* Daha küçük ikon */}
                      </Button>
                    </TableHead>
                  )),
                  /* actions */
                  <TableHead key="actions" className="text-right">
                    İşlemler
                  </TableHead>,
                  /* compact detail */
                  isCompactMode && (
                    <TableHead key="detail" className="w-[80px] text-center">
                      Detay
                    </TableHead>
                  ),
                ]}
              </TableRow>
              {/* === FILTER ROW === */}
              <TableRow>
                {[
                  <TableHead key="empty" className="w-[50px]" />,
                  ...visibleColumns.map((col) => (
                    <TableHead key={`filter-${col}`} className="py-2">
                      {" "}
                      {/* Daha kompakt filtre satırı */}
                      {(() => {
                        /* render select / input per column */
                        const commonProps = {
                          className: "w-full h-8 text-sm rounded-md", // Daha kompakt input/select
                        }
                        switch (col) {
                          case "ilceAdi":
                            return (
                              <Select
                                value={filters[col]}
                                onValueChange={(v: string) => handleFilterChange(col, v === "all" ? "" : v)}
                              >
                                <SelectTrigger {...commonProps}>
                                  <SelectValue placeholder="İlçe Seç" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Tümü</SelectItem>
                                  {uniqueIlceler.map((o) => (
                                    <SelectItem key={o} value={o}>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          case "mahalleAdi":
                            return (
                              <Input
                                {...commonProps}
                                placeholder="Mahalle ara..."
                                value={filters[col]}
                                onChange={(e) => handleFilterChange(col, e.target.value)}
                              />
                            )
                          case "talebinGelisSekli":
                            return (
                              <Select
                                value={filters[col]}
                                onValueChange={(v: string) => handleFilterChange(col, v === "all" ? "" : v)}
                              >
                                <SelectTrigger {...commonProps}>
                                  <SelectValue placeholder="Şekil Seç" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Tümü</SelectItem>
                                  {uniqueTalebinGelisSekli.map((o) => (
                                    <SelectItem key={o} value={o}>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          case "talepKonusu":
                            return (
                              <Select
                                value={filters[col]}
                                onValueChange={(v: string) => handleFilterChange(col, v === "all" ? "" : v)}
                              >
                                <SelectTrigger {...commonProps}>
                                  <SelectValue placeholder="Konu Seç" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Tümü</SelectItem>
                                  {uniqueTalepKonusu.map((o) => (
                                    <SelectItem key={o} value={o}>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          case "degerlendirmeSonucu":
                            return (
                              <Select
                                value={filters[col]}
                                onValueChange={(v: string) => handleFilterChange(col, v === "all" ? "" : v)}
                              >
                                <SelectTrigger {...commonProps}>
                                  <SelectValue placeholder="Sonuç Seç" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Tümü</SelectItem>
                                  {uniqueDegSonucu.map((o) => (
                                    <SelectItem key={o} value={o}>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          case "guncelleyen":
                            return (
                              <Select
                                value={filters[col]}
                                onValueChange={(v: string) => handleFilterChange(col, v === "all" ? "" : v)}
                              >
                                <SelectTrigger {...commonProps}>
                                  <SelectValue placeholder="Güncelleyen" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Tümü</SelectItem>
                                  {uniqueGuncelleyen.map((o) => (
                                    <SelectItem key={o} value={o}>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          default:
                            return (
                              <Input
                                {...commonProps}
                                placeholder="Ara..."
                                value={filters[col]}
                                onChange={(e) => handleFilterChange(col, e.target.value)}
                              />
                            )
                        }
                      })()}
                    </TableHead>
                  )),
                  <TableHead key="actions-empty" className="text-right" />,
                  isCompactMode && <TableHead key="detail-empty" className="w-[80px]" />,
                ]}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + (isCompactMode ? 3 : 2)} className="h-24 text-center">
                    Hiç talep bulunamadı.
                  </TableCell>
                </TableRow>
              )}

              {filtered.map((r) => (
                <Fragment key={r.id}>
                  {/* MAIN ROW */}
                  <TableRow className="hover:bg-muted/50 transition-colors">
                    {" "}
                    {/* Satır vurgusu */}
                    {[
                      <TableCell key="sel" className="text-center">
                        <Checkbox
                          checked={selectedRequestIds.has(r.id)}
                          onCheckedChange={(c) => toggleSelectOne(r.id, c as boolean)}
                        />
                      </TableCell>,
                      ...visibleColumns.map((col) => <TableCell key={col}>{r[col]}</TableCell>),
                      <TableCell key="actions" className="text-right">
                        <div className="flex justify-end gap-2">
                          {" "}
                          {/* İkonlu butonlar */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md"
                                onClick={() => {
                                  setSelectedRequest(r)
                                  setIsFormOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Düzenle</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Düzenle</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md"
                                onClick={() => {
                                  setSelectedRequestIdForLogs(r.id)
                                  setIsLogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Geçmişi Görüntüle</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Geçmişi Görüntüle</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md text-red-600 hover:text-red-600"
                                onClick={() => {
                                  setSelectedRequestIds(new Set([r.id]))
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Sil</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sil</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>,
                      isCompactMode && (
                        <TableCell key="detail" className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpenRowId(openRowId === r.id ? null : r.id)}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${openRowId === r.id ? "rotate-180" : ""}`}
                            />
                          </Button>
                        </TableCell>
                      ),
                    ]}
                  </TableRow>

                  {/* EXPANDED ROW (only compact) */}
                  {isCompactMode && openRowId === r.id && (
                    <TableRow key={`${r.id}-detail`}>
                      <TableCell colSpan={visibleColumns.length + 2} className="py-0 px-0 bg-muted/50 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                          {fullCols
                            .filter((c) => !compactCols.includes(c))
                            .map((c) => (
                              <div key={c}>
                                <p className="text-sm font-medium text-muted-foreground">{headerMap[c]}:</p>
                                <p className="text-sm">{r[c]}</p>
                              </div>
                            ))}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Muhtar Adı:</p>
                            <p className="text-sm">{r.muhtarAdi}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Muhtar Telefonu:</p>
                            <p className="text-sm">{r.muhtarTelefonu}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Güncelleyen:</p>
                            <p className="text-sm">{r.guncelleyen || "Belirtilmemiş"}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}
