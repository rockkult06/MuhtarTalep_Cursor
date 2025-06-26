import { useState } from "react"

const initialOptions = {
  talepKonusu: ["Hat Talepleri", "Servis Sıklıkları", "Durak Talepleri", "Diğer"],
  talebinGelisSekli: ["Şifahi Bildirim", "HİM", "CİMER", "EBYS", "İlçe Koordinasyon Toplantısı", "Genel Md.Toplantı"],
}

export function PageManagement() {
  const [options, setOptions] = useState(initialOptions)
  const [newOption, setNewOption] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof initialOptions>("talepKonusu")

  const addOption = () => {
    if (newOption) {
      setOptions((prev) => ({
        ...prev,
        [selectedCategory]: [...prev[selectedCategory], newOption],
      }))
      setNewOption("")
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sayfa Yönetimi</h2>
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as keyof typeof initialOptions)}
          className="p-2 border rounded mr-2"
        >
          <option value="talepKonusu">Talep Konusu</option>
          <option value="talebinGelisSekli">Talebin Geliş Şekli</option>
        </select>
        <input
          type="text"
          placeholder="Yeni Seçenek"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <button onClick={addOption} className="bg-blue-500 text-white p-2 rounded">
          Ekle
        </button>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{selectedCategory === "talepKonusu" ? "Talep Konusu" : "Talebin Geliş Şekli"} Seçenekleri</h3>
        <ul className="list-disc pl-5">
          {options[selectedCategory].map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      </div>
    </div>
  )
} 