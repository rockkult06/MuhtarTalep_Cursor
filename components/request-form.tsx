"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { type Request, type MuhtarInfo, getMuhtarData, getFormOptions } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useAuth } from '@/contexts/auth-context'

// The form data should represent the fields in the form, which might be slightly different from the final Request object.
type FormData = {
  talepNo: number
  ilceAdi: string
  mahalleAdi: string
  muhtarAdi: string
  muhtarTelefonu: string
  talebinGelisSekli: string
  talepTarihi: string
  talepKonusu: string
  aciklama: string
  degerlendirme: string
  degerlendirmeSonucu: string
  talebiOlusturan: string
  guncelleyen: string
  degerlendirmeTarihi?: Date
}

function getInitialFormData(initialData?: Request): FormData {
  return {
    talepNo: initialData?.talepNo ?? 0,
    ilceAdi: initialData?.ilceAdi ?? "AKYURT",
    mahalleAdi: initialData?.mahalleAdi ?? "",
    muhtarAdi: initialData?.muhtarAdi ?? "",
    muhtarTelefonu: initialData?.muhtarTelefonu ?? "",
    talebinGelisSekli: initialData?.talebinGelisSekli ?? "",
    talepTarihi: initialData?.talepTarihi ?? new Date().toISOString().split("T")[0],
    talepKonusu: initialData?.talepKonusu ?? "",
    aciklama: initialData?.aciklama ?? "",
    degerlendirme: initialData?.degerlendirme ?? "",
    degerlendirmeSonucu: initialData?.degerlendirmeSonucu ?? "",
    degerlendirmeTarihi: initialData?.degerlendirmeTarihi
      ? new Date(initialData.degerlendirmeTarihi)
      : undefined,
    talebiOlusturan: initialData?.talebiOlusturan ?? "",
    guncelleyen: initialData?.guncelleyen ?? "",
  }
}

interface RequestFormProps {
  initialData?: Request
  onSave: (data: Omit<Request, "id" | "created_at">) => void
  onClose: () => void
}

export function RequestForm({ initialData, onSave, onClose }: RequestFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>(() =>
    getInitialFormData(initialData)
  )
  const [muhtarInfos, setMuhtarInfos] = useState<MuhtarInfo[]>([])
  const [filteredMahalleler, setFilteredMahalleler] = useState<string[]>([])
  const [loadingMuhtarData, setLoadingMuhtarData] = useState(true)
  const [errorMuhtarData, setErrorMuhtarData] = useState<string | null>(null)
  const [dynamicDropdownOptions, setDynamicDropdownOptions] = useState<
    Record<string, string[]>
  >({})

  useEffect(() => {
    const fetchMuhtarData = async () => {
      setLoadingMuhtarData(true)
      setErrorMuhtarData(null)
      try {
        const data = await getMuhtarData()
        // İlçe ve mahalle adlarını büyük harfe çevir
        const upperCaseData = data.map(info => ({
          ...info,
          ilceAdi: info.ilceAdi.toUpperCase(),
          mahalleAdi: info.mahalleAdi.toUpperCase()
        }))
        setMuhtarInfos(upperCaseData)
      } catch (err) {
        console.error("Failed to fetch muhtar data:", err)
        setErrorMuhtarData("Muhtar bilgileri yüklenirken bir hata oluştu.")
      } finally {
        setLoadingMuhtarData(false)
      }
    }
    fetchMuhtarData()
  }, [])

  useEffect(() => {
    if (formData.ilceAdi) {
      const mahalleler = muhtarInfos
        .filter((info) => info.ilceAdi.toUpperCase() === formData.ilceAdi.toUpperCase())
        .map((info) => info.mahalleAdi.toUpperCase())
      setFilteredMahalleler([...new Set(mahalleler)])
    } else {
      setFilteredMahalleler([])
    }
    // İlçe değiştiğinde mahalle de sıfırlanmalı
    if (formData.ilceAdi !== initialData?.ilceAdi) {
      setFormData((prev) => ({ ...prev, mahalleAdi: "", muhtarAdi: "", muhtarTelefonu: "" }))
    }
  }, [formData.ilceAdi, muhtarInfos, initialData?.ilceAdi])

  useEffect(() => {
    if (formData.ilceAdi && formData.mahalleAdi) {
      const selectedMuhtar = muhtarInfos.find(
        (info) =>
          info.ilceAdi.toUpperCase() === formData.ilceAdi.toUpperCase() &&
          info.mahalleAdi.toUpperCase() === formData.mahalleAdi.toUpperCase(),
      )
      if (selectedMuhtar) {
        setFormData((prev) => ({
          ...prev,
          muhtarAdi: selectedMuhtar.muhtarAdi,
          muhtarTelefonu: selectedMuhtar.muhtarTelefonu,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          muhtarAdi: "",
          muhtarTelefonu: "",
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        muhtarAdi: "",
        muhtarTelefonu: "",
      }))
    }
  }, [formData.ilceAdi, formData.mahalleAdi, muhtarInfos])

  useEffect(() => {
    async function fetchOptions() {
      const options = await getFormOptions();
      setDynamicDropdownOptions(options);
    }
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    if (id === 'talepNo') {
      const numValue = value === '' ? 0 : parseInt(value, 10)
      setFormData({ ...formData, talepNo: isNaN(numValue) ? 0 : numValue })
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: id === "ilceAdi" || id === "mahalleAdi" ? value.toUpperCase() : value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, talepTarihi: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const dataToSave: Omit<Request, "id" | "created_at"> = {
      ...formData,
      talepEden: `${formData.mahalleAdi} / ${formData.muhtarAdi}`,
      degerlendirmeTarihi: formData.degerlendirmeTarihi
        ? formData.degerlendirmeTarihi.toISOString()
        : null,
      sonuc:
        formData.degerlendirmeSonucu === "Olumlu"
          ? "✅"
          : formData.degerlendirmeSonucu === "Olumsuz"
          ? "❌"
          : "📝",
      guncellemeTarihi: new Date().toISOString(),
      talebiOlusturan: initialData?.talebiOlusturan || user?.username || "Bilinmiyor",
      guncelleyen: user?.username || "Bilinmiyor",
    }

    onSave(dataToSave)
    onClose()
  }

  const uniqueIlceler = [...new Set(muhtarInfos.map((info) => info.ilceAdi))]

  if (loadingMuhtarData) {
    return <div className="p-4 text-center">Muhtar bilgileri yükleniyor...</div>
  }

  if (errorMuhtarData) {
    return <div className="p-4 text-center text-red-500">{errorMuhtarData}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="ilceAdi" className="text-right">
          İlçe Adı
        </Label>
        <Select onValueChange={(value) => handleSelectChange("ilceAdi", value)} value={formData.ilceAdi} required>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="İlçe Seçin" />
          </SelectTrigger>
          <SelectContent>
            {uniqueIlceler.map((ilce) => (
              <SelectItem key={ilce} value={ilce}>
                {ilce}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="mahalleAdi" className="text-right">
          Mahalle Adı
        </Label>
        <Select
          onValueChange={(value) => handleSelectChange("mahalleAdi", value)}
          value={formData.mahalleAdi}
          required
          disabled={!formData.ilceAdi || filteredMahalleler.length === 0}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Mahalle Seçin" />
          </SelectTrigger>
          <SelectContent>
            {filteredMahalleler.map((mahalle) => (
              <SelectItem key={mahalle} value={mahalle}>
                {mahalle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="muhtarAdi" className="text-right">
          Muhtar Adı
        </Label>
        <Input id="muhtarAdi" value={formData.muhtarAdi} readOnly className="col-span-3 bg-muted" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="muhtarTelefonu" className="text-right">
          Muhtar Telefonu
        </Label>
        <Input id="muhtarTelefonu" value={formData.muhtarTelefonu} readOnly className="col-span-3 bg-muted" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="talebinGelisSekli" className="text-right">
          Talebin Geliş Şekli
        </Label>
        <Select
          onValueChange={(value) => handleSelectChange("talebinGelisSekli", value)}
          value={formData.talebinGelisSekli}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Seçiniz" />
          </SelectTrigger>
          <SelectContent>
            {dynamicDropdownOptions.talebinGelisSekli?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="talepTarihi" className="text-right">
          Talep Tarihi
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "col-span-3 justify-start text-left font-normal",
                !formData.talepTarihi && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.talepTarihi ? format(new Date(formData.talepTarihi), "PPP") : <span>Tarih Seçin</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.talepTarihi ? new Date(formData.talepTarihi) : undefined}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="talepKonusu" className="text-right">
          Talep Konusu
        </Label>
        <Select
          onValueChange={(value) => handleSelectChange("talepKonusu", value)}
          value={formData.talepKonusu}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Seçiniz" />
          </SelectTrigger>
          <SelectContent>
            {dynamicDropdownOptions.talepKonusu?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="aciklama" className="text-right">
          Açıklama
        </Label>
        <Textarea id="aciklama" value={formData.aciklama} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="degerlendirme" className="text-right">
          Değerlendirme
        </Label>
        <Textarea id="degerlendirme" value={formData.degerlendirme} onChange={handleChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="degerlendirmeSonucu" className="text-right">
          Değerlendirme Sonucu
        </Label>
        <Select
          onValueChange={(value) => handleSelectChange("degerlendirmeSonucu", value)}
          value={formData.degerlendirmeSonucu}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Seçiniz" />
          </SelectTrigger>
          <SelectContent>
            {dynamicDropdownOptions.degerlendirmeSonucu?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="degerlendirmeTarihi" className="text-right">
          Değerlendirme Tarihi
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "col-span-3 justify-start text-left font-normal",
                !formData.degerlendirmeTarihi && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.degerlendirmeTarihi ? format(new Date(formData.degerlendirmeTarihi), "PPP") : <span>Tarih Seçin</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.degerlendirmeTarihi ? new Date(formData.degerlendirmeTarihi) : undefined}
              onSelect={(date) => setFormData((prev) => ({ ...prev, degerlendirmeTarihi: date }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose} className="bg-white text-black">
          İptal
        </Button>
        <Button type="submit">Kaydet</Button>
      </div>
    </form>
  )
}
