"use client"

import { useState, useEffect } from "react"
import { getRawFormOptions, addFormOption, deleteFormOption, type FormOption } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

const optionTypeTranslations: { [key: string]: string } = {
  talepKonusu: "Talep Konusu",
  talebinGelisSekli: "Talebin Geliş Şekli",
  degerlendirmeSonucu: "Değerlendirme Sonucu",
};

export function DropdownManagement() {
  const [options, setOptions] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [selectedOptionType, setSelectedOptionType] = useState<string>("talepKonusu");

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      const data = await getRawFormOptions();
      setOptions(data);
      setLoading(false);
    };
    fetchOptions();
  }, []);

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionValue.trim()) {
      toast.error("Seçenek değeri boş olamaz.");
      return;
    }
    const newOption = await addFormOption(selectedOptionType, newOptionValue);
    if (newOption) {
      setOptions([...options, newOption]);
      setNewOptionValue("");
      toast.success("Yeni seçenek başarıyla eklendi.");
    } else {
      toast.error("Bu seçenek zaten mevcut veya bir hata oluştu.");
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (confirm("Bu seçeneği silmek istediğinizden emin misiniz?")) {
      const success = await deleteFormOption(id);
      if (success) {
        setOptions(options.filter(opt => opt.id !== id));
        toast.success("Seçenek başarıyla silindi.");
      } else {
        toast.error("Seçenek silinirken bir hata oluştu.");
      }
    }
  };

  const groupedOptions = options.reduce((acc, option) => {
    (acc[option.optionType] = acc[option.optionType] || []).push(option);
    return acc;
  }, {} as Record<string, FormOption[]>);

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Yeni Seçenek Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOption} className="flex items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="option-type" className="block text-sm font-medium text-gray-700 mb-1">Seçenek Tipi</label>
              <Select value={selectedOptionType} onValueChange={setSelectedOptionType}>
                <SelectTrigger id="option-type">
                  <SelectValue placeholder="Tip seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(optionTypeTranslations).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow">
              <label htmlFor="option-value" className="block text-sm font-medium text-gray-700 mb-1">Yeni Seçenek Değeri</label>
              <Input
                id="option-value"
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                placeholder="Örn: Güzergah Değişikliği"
              />
            </div>
            <Button type="submit">Ekle</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(groupedOptions).map(([type, opts]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle>{optionTypeTranslations[type] || type}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Yükleniyor...</p>
              ) : (
                <ul className="space-y-2">
                  {opts.map(option => (
                    <li key={option.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span>{option.optionValue}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOption(option.id)}
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 