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
import { type Request, type MuhtarInfo, dropdownOptions, getMuhtarData } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

type FormData = Omit<
  Request,
  "id" | "talepNo" | "guncellemeTarihi" | "talebiOlusturan"
>;

interface RequestFormProps {
  initialData?: Request;
  onSave: (data: FormData) => void;
  onClose: () => void;
}

const getInitialFormData = (initialData?: Request): FormData => {
  const defaults: FormData = {
      ilceAdi: "",
      mahalleAdi: "",
      muhtarAdi: "",
      muhtarTelefonu: "",
      talebinGelisSekli: "",
      talepTarihi: format(new Date(), "yyyy-MM-dd"),
      talepKonusu: "",
      aciklama: "",
      degerlendirme: "",
      degerlendirmeSonucu: "",
  };

  if (!initialData) {
    return defaults;
  }

  // Sadece FormData'da tanımlı alanları al
  const filteredData: Partial<FormData> = {};
  for (const key in defaults) {
    if (Object.prototype.hasOwnProperty.call(initialData, key)) {
      (filteredData as any)[key] = (initialData as any)[key];
    }
  }

  return { ...defaults, ...filteredData };
};

export function RequestForm({ initialData, onSave, onClose }: RequestFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(initialData));
  const [muhtarInfos, setMuhtarInfos] = useState<MuhtarInfo[]>([])
  const [filteredMahalleler, setFilteredMahalleler] = useState<string[]>([])
  const [loadingMuhtarData, setLoadingMuhtarData] = useState(true)
  const [errorMuhtarData, setErrorMuhtarData] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fetchMuhtarData = async () => {
      setLoadingMuhtarData(true)
      setErrorMuhtarData(null)
      try {
        const data = await getMuhtarData()
        // İlçe ve mahalle adlarını Türkçe karakter duyarlı olarak büyük harfe çevir
        const upperCaseData = data.map(info => ({
          ...info,
          ilceAdi: info.ilceAdi.toLocaleUpperCase('tr-TR'),
          mahalleAdi: info.mahalleAdi.toLocaleUpperCase('tr-TR')
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
        .filter((info) => info.ilceAdi.toLocaleUpperCase('tr-TR') === formData.ilceAdi.toLocaleUpperCase('tr-TR'))
        .map((info) => info.mahalleAdi)
        .sort((a, b) => a.localeCompare(b, 'tr-TR'))
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
          info.ilceAdi.toLocaleUpperCase('tr-TR') === formData.ilceAdi.toLocaleUpperCase('tr-TR') &&
          info.mahalleAdi.toLocaleUpperCase('tr-TR') === formData.mahalleAdi.toLocaleUpperCase('tr-TR')
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [id]: value // İlçe ve mahalle adlarını olduğu gibi sakla
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, talepTarihi: format(date, "yyyy-MM-dd") }))
    }
  }

  // Form validasyon fonksiyonu
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    // Zorunlu alanları kontrol et
    if (!formData.ilceAdi?.trim()) {
      errors.ilceAdi = "İlçe seçimi zorunludur";
    }
    if (!formData.mahalleAdi?.trim()) {
      errors.mahalleAdi = "Mahalle seçimi zorunludur";
    }
    if (!formData.talebinGelisSekli?.trim()) {
      errors.talebinGelisSekli = "Talebin geliş şekli seçimi zorunludur";
    }
    if (!formData.talepTarihi?.trim()) {
      errors.talepTarihi = "Talep tarihi seçimi zorunludur";
    }
    if (!formData.talepKonusu?.trim()) {
      errors.talepKonusu = "Talep konusu seçimi zorunludur";
    }
    if (!formData.degerlendirmeSonucu?.trim()) {
      errors.degerlendirmeSonucu = "Değerlendirme sonucu seçimi zorunludur";
    }
    if (!formData.aciklama?.trim()) {
      errors.aciklama = "Açıklama alanı zorunludur";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Güncelleyen bilgisini otomatik olarak ekle
      onSave({
        ...formData,
        guncelleyen: user?.username || "Sistem"
      });
      onClose();
    } else {
      // Hata mesajını göster
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const uniqueIlceler = [
    ...new Set(
      muhtarInfos.map((info) => String(info.ilceAdi ?? "").trim().toLocaleUpperCase('tr-TR'))
    ),
  ].sort((a, b) => a.localeCompare(b, 'tr-TR'))

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
        <div className="col-span-3">
          <Select onValueChange={(value) => handleSelectChange("ilceAdi", value)} value={formData.ilceAdi} required>
            <SelectTrigger className={cn(validationErrors.ilceAdi && "border-red-500")}>
              <SelectValue placeholder="İlçe Seçin" />
            </SelectTrigger>
            <SelectContent className="max-h-[80vh] overflow-y-auto">
              {uniqueIlceler.map((ilce) => (
                <SelectItem key={ilce} value={ilce}>
                  {ilce}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.ilceAdi && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.ilceAdi}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="mahalleAdi" className="text-right">
          Mahalle Adı
        </Label>
        <div className="col-span-3">
          <Select
            onValueChange={(value) => handleSelectChange("mahalleAdi", value)}
            value={formData.mahalleAdi}
            required
            disabled={!formData.ilceAdi || filteredMahalleler.length === 0}
          >
            <SelectTrigger className={cn(validationErrors.mahalleAdi && "border-red-500")}>
              <SelectValue placeholder="Mahalle Seçin" />
            </SelectTrigger>
            <SelectContent className="max-h-[80vh] overflow-y-auto">
              {filteredMahalleler.map((mahalle) => (
                <SelectItem key={mahalle} value={mahalle}>
                  {mahalle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.mahalleAdi && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.mahalleAdi}</p>
          )}
        </div>
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
        <div className="col-span-3">
          <Select
            onValueChange={(value) => handleSelectChange("talebinGelisSekli", value)}
            value={formData.talebinGelisSekli}
            required
          >
            <SelectTrigger className={cn(validationErrors.talebinGelisSekli && "border-red-500")}>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.talebinGelisSekli.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.talebinGelisSekli && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.talebinGelisSekli}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="talepTarihi" className="text-right">
          Talep Tarihi
        </Label>
        <div className="col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.talepTarihi && "text-muted-foreground",
                  validationErrors.talepTarihi && "border-red-500"
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
          {validationErrors.talepTarihi && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.talepTarihi}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="talepKonusu" className="text-right">
          Talep Konusu
        </Label>
        <div className="col-span-3">
          <Select
            onValueChange={(value) => handleSelectChange("talepKonusu", value)}
            value={formData.talepKonusu}
            required
          >
            <SelectTrigger className={cn(validationErrors.talepKonusu && "border-red-500")}>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.talepKonusu.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.talepKonusu && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.talepKonusu}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="aciklama" className="text-right">
          Açıklama
        </Label>
        <div className="col-span-3">
          <Textarea 
            id="aciklama" 
            value={formData.aciklama} 
            onChange={handleChange} 
            className={cn(validationErrors.aciklama && "border-red-500")}
            required
          />
          {validationErrors.aciklama && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.aciklama}</p>
          )}
        </div>
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
        <div className="col-span-3">
          <Select
            onValueChange={(value) => handleSelectChange("degerlendirmeSonucu", value)}
            value={formData.degerlendirmeSonucu}
            required
          >
            <SelectTrigger className={cn(validationErrors.degerlendirmeSonucu && "border-red-500")}>
              <SelectValue placeholder="Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.degerlendirmeSonucu.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.degerlendirmeSonucu && (
            <p className="text-sm text-red-500 mt-1">{validationErrors.degerlendirmeSonucu}</p>
          )}
        </div>
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
