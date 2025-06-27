import { supabase } from "./supabase"

// Veri yapıları için arayüzler
export interface Request {
  id: string
  talepNo: string
  talebiOlusturan: string
  ilceAdi: string
  mahalleAdi: string
  muhtarAdi: string
  muhtarTelefonu: string
  talebinGelisSekli: string
  talepTarihi: string // YYYY-MM-DD formatında
  talepKonusu: string
  aciklama: string
  degerlendirme: string
  degerlendirmeSonucu: string
  guncellemeTarihi: string // YYYY-MM-DD formatında
  guncelleyen?: string // İsteğe bağlı
}

export interface MuhtarInfo {
  ilceAdi: string
  mahalleAdi: string
  muhtarAdi: string
  muhtarTelefonu: string
}

export interface LogEntry {
  id: string
  requestId: string
  timestamp: string
  action: "create" | "update" | "delete" // Added 'delete'
  changes: { field: string; oldValue: any; newValue: any }[]
  guncelleyen?: string
}

// Sabit Dropdown Seçenekleri
export const dropdownOptions = {
  talebinGelisSekli: ["Şifahi Bildirim", "HİM", "CİMER", "EBYS", "İlçe Koordinasyon Toplantısı", "Genel Md.Toplantı"],
  talepKonusu: ["Hat Talepleri", "Servis Sıklıkları", "Durak Talepleri", "Diğer"],
  degerlendirmeSonucu: ["İnceleniyor", "Olumlu", "Olumsuz", "Değerlendirilecek"],
}

// Yardımcı fonksiyonlar
export const getRequests = async (): Promise<Request[]> => {
  const { data, error } = await supabase.from("requests").select("*").order("talep_no", { ascending: true })
  if (error) {
    console.error("Error fetching requests:", error)
    return []
  }
  // Convert snake_case to camelCase for frontend consistency
  return data.map((item) => ({
    id: item.id,
    talepNo: item.talep_no,
    talebiOlusturan: item.talebi_olusturan,
    ilceAdi: item.ilce_adi,
    mahalleAdi: item.mahalle_adi,
    muhtarAdi: item.muhtar_adi,
    muhtarTelefonu: item.muhtar_telefonu,
    talebinGelisSekli: item.talebin_gelis_sekli,
    talepTarihi: item.talep_tarihi,
    talepKonusu: item.talep_konusu,
    aciklama: item.aciklama,
    degerlendirme: item.degerlendirme,
    degerlendirmeSonucu: item.degerlendirme_sonucu,
    guncellemeTarihi: item.guncelleme_tarihi,
    guncelleyen: item.guncelleyen,
  }))
}

export const getRequestById = async (id: string): Promise<Request | undefined> => {
  const { data, error } = await supabase.from("requests").select("*").eq("id", id).single()
  if (error) {
    console.error("Error fetching request by ID:", error)
    return undefined
  }
  if (!data) return undefined

  // Convert snake_case to camelCase
  return {
    id: data.id,
    talepNo: data.talep_no,
    talebiOlusturan: data.talebi_olusturan,
    ilceAdi: data.ilce_adi,
    mahalleAdi: data.mahalle_adi,
    muhtarAdi: data.muhtar_adi,
    muhtarTelefonu: data.muhtar_telefonu,
    talebinGelisSekli: data.talebin_gelis_sekli,
    talepTarihi: data.talep_tarihi,
    talepKonusu: data.talep_konusu,
    aciklama: data.aciklama,
    degerlendirme: data.degerlendirme,
    degerlendirmeSonucu: data.degerlendirme_sonucu,
    guncellemeTarihi: data.guncelleme_tarihi,
    guncelleyen: data.guncelleyen,
  }
}

export const addRequest = async (
  newRequest: Omit<Request, "id" | "guncellemeTarihi"> & {
    talepNo?: string
    guncelleyen?: string
  },
): Promise<Request | undefined> => {
  // ─────────────  TALep NO (auto or provided) ──────────────
  // Talep tarihi boş geliyor-sa bugünün tarihi olsun (YYYY-MM-DD).
  const safeTalepTarihi =
    newRequest.talepTarihi && newRequest.talepTarihi.trim() !== ""
      ? newRequest.talepTarihi
      : new Date().toISOString().split("T")[0]
  let talep_no = newRequest.talepNo
  if (!talep_no) {
    // fetch the last talep_no and increment
    const { data: lastReq, error: lastErr } = await supabase
      .from("requests")
      .select("talep_no")
      .order("talep_no", { ascending: false })
      .limit(1)

    if (lastErr) {
      console.error("Error getting last talep_no:", lastErr)
      return undefined
    }
    const lastNo = lastReq?.[0]?.talep_no
    const next = lastNo ? Number.parseInt(lastNo.split("-")[1]) + 1 : 1
    talep_no = `MTYS-${String(next).padStart(4, "0")}`
  }

  const requestToInsert = {
    talep_no,
    talebi_olusturan: newRequest.talebiOlusturan,
    ilce_adi: newRequest.ilceAdi.toLocaleUpperCase('tr-TR'),
    mahalle_adi: newRequest.mahalleAdi.toLocaleUpperCase('tr-TR'),
    muhtar_adi: newRequest.muhtarAdi ?? "",
    muhtar_telefonu: newRequest.muhtarTelefonu ?? "",
    talebin_gelis_sekli: newRequest.talebinGelisSekli,
    talep_tarihi: safeTalepTarihi,
    talep_konusu: normalizeTalepKonusu(newRequest.talepKonusu),
    aciklama: newRequest.aciklama,
    degerlendirme: newRequest.degerlendirme,
    degerlendirme_sonucu: newRequest.degerlendirmeSonucu,
    guncelleme_tarihi: new Date().toISOString().split("T")[0],
    guncelleyen: newRequest.guncelleyen,
  }

  const { data, error } = await supabase.from("requests").insert([requestToInsert]).select()

  if (error) {
    console.error("Error adding request:", error)
    return undefined
  }

  const addedRequest = data[0]

  // Log the creation
  await supabase.from("logs").insert([
    {
      request_id: addedRequest.id,
      action: "create",
      changes: Object.entries(addedRequest).map(([field, value]) => ({ field, oldValue: null, newValue: value })),
      guncelleyen: newRequest.guncelleyen,
    },
  ])

  // Convert back to camelCase for consistency with frontend interface
  return {
    id: addedRequest.id,
    talepNo: addedRequest.talep_no,
    talebiOlusturan: addedRequest.talebi_olusturan,
    ilceAdi: addedRequest.ilce_adi,
    mahalleAdi: addedRequest.mahalle_adi,
    muhtarAdi: addedRequest.muhtar_adi,
    muhtarTelefonu: addedRequest.muhtar_telefonu,
    talebinGelisSekli: addedRequest.talebin_gelis_sekli,
    talepTarihi: addedRequest.talep_tarihi,
    talepKonusu: addedRequest.talep_konusu,
    aciklama: addedRequest.aciklama,
    degerlendirme: addedRequest.degerlendirme,
    degerlendirmeSonucu: addedRequest.degerlendirme_sonucu,
    guncellemeTarihi: addedRequest.guncelleme_tarihi,
    guncelleyen: addedRequest.guncelleyen,
  }
}

export const updateRequest = async (
  id: string,
  updatedFields: Partial<Request> & { guncelleyen?: string },
): Promise<Request | undefined> => {
  const { data: oldRequestData, error: oldRequestError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single()

  if (oldRequestError) {
    console.error("Error fetching old request for update:", oldRequestError)
    return undefined
  }

  const changes: { field: string; oldValue: any; newValue: any }[] = []
  const fieldsToUpdate: Record<string, any> = {}

  for (const key in updatedFields) {
    if (key === "guncelleyen") {
      fieldsToUpdate[key] = updatedFields[key]
      continue
    }
    // Convert camelCase to snake_case for DB field comparison and update
    const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase()
    if (oldRequestData[dbField] !== updatedFields[key as keyof Partial<Request>]) {
      changes.push({
        field: key, // Keep original field name for frontend display
        oldValue: oldRequestData[dbField],
        newValue: updatedFields[key as keyof Partial<Request>],
      })
    }
    let valueToUpdate = updatedFields[key as keyof Partial<Request>]
    
    // Talep konusu güncelleniyorsa normalize et
    if (key === 'talepKonusu' && typeof valueToUpdate === 'string') {
      valueToUpdate = normalizeTalepKonusu(valueToUpdate)
    }
    
    fieldsToUpdate[dbField] = valueToUpdate
  }

  fieldsToUpdate.guncelleme_tarihi = new Date().toISOString().split("T")[0]

  // Talep tarihi boş geliyor-sa bugünün tarihi olsun (YYYY-MM-DD).
  fieldsToUpdate.talep_tarihi =
    updatedFields.talepTarihi && updatedFields.talepTarihi.trim() !== ""
      ? updatedFields.talepTarihi
      : oldRequestData.talep_tarihi

  const { data, error } = await supabase.from("requests").update(fieldsToUpdate).eq("id", id).select()

  if (error) {
    console.error("Error updating request:", error)
    return undefined
  }

  const updatedRequest = data[0]

  // Log the update
  if (changes.length > 0) {
    await supabase.from("logs").insert([
      {
        request_id: updatedRequest.id,
        action: "update",
        changes: changes,
        guncelleyen: updatedFields.guncelleyen,
      },
    ])
  }

  // Convert back to camelCase for consistency with frontend interface
  return {
    id: updatedRequest.id,
    talepNo: updatedRequest.talep_no,
    talebiOlusturan: updatedRequest.talebi_olusturan,
    ilceAdi: updatedRequest.ilce_adi,
    mahalleAdi: updatedRequest.mahalle_adi,
    muhtarAdi: updatedRequest.muhtar_adi,
    muhtarTelefonu: updatedRequest.muhtar_telefonu,
    talebinGelisSekli: updatedRequest.talebin_gelis_sekli,
    talepTarihi: updatedRequest.talep_tarihi,
    talepKonusu: updatedRequest.talep_konusu,
    aciklama: updatedRequest.aciklama,
    degerlendirme: updatedRequest.degerlendirme,
    degerlendirmeSonucu: updatedRequest.degerlendirme_sonucu,
    guncellemeTarihi: updatedRequest.guncelleme_tarihi,
    guncelleyen: updatedRequest.guncelleyen,
  }
}

// NEW: Delete requests by ID(s)
export const deleteRequests = async (ids: string[]): Promise<boolean> => {
  try {
    const response = await fetch("/api/requests", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error deleting requests:", errorData.error)
      return false
    }

    console.log(`${ids.length} request(s) deleted successfully.`)
    return true
  } catch (error) {
    console.error("Failed to delete requests:", error)
    return false
  }
}

// lib/data.ts
export const getMuhtarData = async (): Promise<MuhtarInfo[]> => {
  let allData: any[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("muhtar_info")
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) {
      console.error("Error fetching muhtar data:", error);
      break;
    }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < pageSize) break; // Son sayfa
    from += pageSize;
  }
  // Normalizasyon
  return allData.map((item) => ({
    ilceAdi: String(item.ilce_adi ?? "").trim().toLocaleUpperCase('tr-TR'),
    mahalleAdi: String(item.mahalle_adi ?? "").trim().toLocaleUpperCase('tr-TR'),
    muhtarAdi: String(item.muhtar_adi ?? "").trim(),
    muhtarTelefonu: String(item.muhtar_telefonu ?? "").trim(),
  }));
};

export const addMuhtarData = async (data: MuhtarInfo[]): Promise<void> => {
  // Clear existing muhtar data
  const { error: deleteError } = await supabase.from("muhtar_info").delete().neq("ilce_adi", "NON_EXISTENT_VALUE") // Delete all rows
  if (deleteError) {
    console.error("Error clearing existing muhtar data:", deleteError)
    throw deleteError
  }

  // Insert new muhtar data
  const formattedData = data.map((m) => ({
    ilce_adi: String(m.ilceAdi ?? "").trim().toLocaleUpperCase('tr-TR'),  // İlçe adını büyük harfe çevir
    mahalle_adi: String(m.mahalleAdi ?? "").trim(),  // Mahalle adını olduğu gibi kaydet
    muhtar_adi: String(m.muhtarAdi ?? "").trim(),
    muhtar_telefonu: String(m.muhtarTelefonu ?? "").trim(),
  }))
  const { error: insertError } = await supabase.from("muhtar_info").insert(formattedData)
  if (insertError) {
    console.error("Error inserting new muhtar data:", insertError)
    throw insertError
  }
}

export const bulkImportRequests = async (
  data: (Omit<Request, "id" | "guncellemeTarihi"> & { talepNo?: string })[],
): Promise<void> => {
  const currentMuhtarData = await getMuhtarData() // Get current muhtar data from DB

  for (const req of data) {
    // Muhtar bilgilerini ilçe ve mahalle adına göre case-insensitive olarak bul
    const foundMuhtar = currentMuhtarData.find(
      (m) =>
        m.ilceAdi.toLocaleUpperCase('tr-TR') === req.ilceAdi.trim().toLocaleUpperCase('tr-TR') &&
        m.mahalleAdi.toLocaleUpperCase('tr-TR') === req.mahalleAdi.trim().toLocaleUpperCase('tr-TR'),
    )

    await addRequest({
      ...req,
      muhtarAdi: foundMuhtar?.muhtarAdi || "",
      muhtarTelefonu: foundMuhtar?.muhtarTelefonu || "",
    })
  }
}

export const getLogsForRequest = async (requestId: string): Promise<LogEntry[]> => {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("request_id", requestId)
    .order("timestamp", { ascending: true })

  if (error) {
    console.error(`Error fetching logs for request ${requestId}:`, error)
    return []
  }

  // Convert snake_case to camelCase and parse JSONB changes
  return data.map((item) => ({
    id: item.id,
    requestId: item.request_id,
    timestamp: item.timestamp,
    action: item.action,
    changes: item.changes, // changes is already JSONB, so it should be parsed correctly
    guncelleyen: item.guncelleyen,
  }))
}

// Sadece geliştirme amaçlı: Verileri sıfırla
export const resetData = async () => {
  try {
    console.log("Resetting all data in Supabase...")
    await supabase.from("logs").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all logs
    await supabase.from("requests").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all requests
    await supabase.from("muhtar_info").delete().neq("ilce_adi", "NON_EXISTENT_VALUE") // Delete all muhtar info
    console.log("All data cleared.")
  } catch (error) {
    console.error("Error resetting data:", error)
  }
}

// Talep konularını normalize etme fonksiyonu
export const normalizeTalepKonusu = (konu: string): string => {
  const normalizedKonu = konu.trim()
  
  // Mapping tablosu (büyük/küçük harf duyarsız)
  const mappings: Record<string, string> = {
    "Diğer": "Diğer",
    "diğer": "Diğer",
    "Diğer Talepler": "Diğer",
    "diğer talepler": "Diğer",
    "Durak Talepleri": "Durak Talepleri",
    "durak talepleri": "Durak Talepleri",
    "Hat Talepleri": "Hat Talepleri",
    "hat talepleri": "Hat Talepleri",
    "Hat talepleri": "Hat Talepleri",
    "hat Talepleri": "Hat Talepleri",
    "Servis Sıklığı Talepleri": "Servis Sıklıkları",
    "servis sıklığı talepleri": "Servis Sıklıkları",
    "Servis Sıklıkları": "Servis Sıklıkları",
    "servis sıklıkları": "Servis Sıklıkları"
  }
  
  return mappings[normalizedKonu] || normalizedKonu
}

// Veritabanındaki talep konularını güncelleme fonksiyonu
export const updateTalepKonulari = async (): Promise<void> => {
  try {
    console.log("Talep konuları güncelleniyor...")
    
    // Tüm talepleri al
    const { data: requests, error: fetchError } = await supabase
      .from("requests")
      .select("id, talep_konusu")
    
    if (fetchError) {
      console.error("Talepler alınırken hata:", fetchError)
      return
    }
    
    if (!requests || requests.length === 0) {
      console.log("Güncellenecek talep bulunamadı")
      return
    }
    
    // Her talebi normalize et ve güncelle
    const updatePromises = requests.map(async (request) => {
      const normalizedKonu = normalizeTalepKonusu(request.talep_konusu)
      
      if (normalizedKonu !== request.talep_konusu) {
        console.log(`Güncelleniyor: "${request.talep_konusu}" -> "${normalizedKonu}"`)
        
        const { error } = await supabase
          .from("requests")
          .update({ talep_konusu: normalizedKonu })
          .eq("id", request.id)
        
        if (error) {
          console.error(`ID ${request.id} güncellenirken hata:`, error)
        }
      }
    })
    
    await Promise.all(updatePromises)
    console.log("Talep konuları başarıyla güncellendi!")
    
  } catch (error) {
    console.error("Talep konuları güncellenirken genel hata:", error)
  }
}

// İlçe adlarını büyük harfe çevirme fonksiyonu
export const updateDistrictNames = async (): Promise<void> => {
  try {
    console.log("İlçe adları güncelleniyor...")
    
    // Tüm muhtar verilerini al
    const { data: muhtarData, error: fetchError } = await supabase
      .from("muhtar_info")
      .select("ilce_adi")
      .order("ilce_adi")
    
    if (fetchError) {
      console.error("Muhtar verileri alınırken hata:", fetchError)
      return
    }
    
    if (!muhtarData || muhtarData.length === 0) {
      console.log("Güncellenecek ilçe bulunamadı")
      return
    }
    
    // Her ilçe adını büyük harfe çevir ve güncelle
    const updatePromises = muhtarData.map(async (data) => {
      const upperCaseDistrict = data.ilce_adi.toLocaleUpperCase('tr-TR')
      
      if (upperCaseDistrict !== data.ilce_adi) {
        console.log(`Güncelleniyor: "${data.ilce_adi}" -> "${upperCaseDistrict}"`)
        
        const { error } = await supabase
          .from("muhtar_info")
          .update({ ilce_adi: upperCaseDistrict })
          .eq("ilce_adi", data.ilce_adi)
        
        if (error) {
          console.error(`İlçe "${data.ilce_adi}" güncellenirken hata:`, error)
        }
      }
    })
    
    await Promise.all(updatePromises)
    console.log("İlçe adları başarıyla güncellendi!")
    
  } catch (error) {
    console.error("İlçe adları güncellenirken genel hata:", error)
  }
}

export type Role = "admin" | "user" | "viewer"

export interface User {
  id: string
  username: string
  role: Role
  password?: string // Bu alan sadece yeni kullanıcı eklerken kullanılır.
}

// -----------------------------------------------------------------------------
// KULLANICI YÖNETİMİ FONKSİYONLARI
// -----------------------------------------------------------------------------

export const verifyUser = async (username: string, password_raw: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role, password")
    .eq("username", username)
    .single()

  if (error || !data) {
    console.error("Error verifying user or user not found:", error?.message)
    return null
  }

  // TODO: Şifreler hash'lenmeli ve burada hash karşılaştırması yapılmalı.
  // Örnek: const isValid = await bcrypt.compare(password_raw, data.password);
  const isValid = password_raw === data.password

  if (isValid) {
    const { password, ...user } = data
    return user
  }

  return null
}

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from("users").select("id, username, role").order("username")

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data
}

export const addUser = async (newUser: Omit<User, "id">): Promise<User | null> => {
  if (!newUser.password) {
    throw new Error("Password is required for new user.")
  }

  // TODO: Şifre burada hash'lenmeli.
  // Örnek: const hashedPassword = await bcrypt.hash(newUser.password, 10);
  const userToInsert = {
    username: newUser.username,
    password: newUser.password, // Düz metin olarak kaydediliyor!
    role: newUser.role,
  }

  const { data, error } = await supabase.from("users").insert(userToInsert).select("id, username, role").single()

  if (error) {
    console.error("Error adding user:", error)
    return null
  }
  return data
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase.from("users").delete().eq("id", userId)

  if (error) {
    console.error("Error deleting user:", error)
    return false
  }
  return true
}

export const getAllLogs = async (): Promise<LogEntry[]> => {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching all logs:", error)
    return []
  }

  // snake_case'i camelCase'e çevir
  return data.map((item) => ({
    id: item.id,
    requestId: item.request_id,
    timestamp: item.timestamp,
    action: item.action,
    changes: item.changes,
    guncelleyen: item.guncelleyen,
  }))
}


