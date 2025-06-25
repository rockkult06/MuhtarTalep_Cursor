-- muhtar_info tablosu
CREATE TABLE IF NOT EXISTS muhtar_info (
    ilce_adi TEXT NOT NULL,
    mahalle_adi TEXT NOT NULL,
    muhtar_adi TEXT,
    muhtar_telefonu TEXT,
    PRIMARY KEY (ilce_adi, mahalle_adi) -- İlçe ve mahalle kombinasyonu benzersiz olmalı
);

-- requests tablosu
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talep_no TEXT UNIQUE NOT NULL,
    talebi_olusturan TEXT NOT NULL,
    ilce_adi TEXT NOT NULL,
    mahalle_adi TEXT NOT NULL,
    muhtar_adi TEXT,
    muhtar_telefonu TEXT,
    talebin_gelis_sekli TEXT NOT NULL,
    talep_tarihi DATE NOT NULL,
    talep_konusu TEXT NOT NULL,
    aciklama TEXT,
    degerlendirme TEXT,
    degerlendirme_sonucu TEXT NOT NULL,
    guncelleme_tarihi DATE NOT NULL,
    guncelleyen TEXT
);

-- logs tablosu
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action TEXT NOT NULL, -- 'create' veya 'update'
    changes JSONB, -- Değişiklikleri JSON formatında sakla
    guncelleyen TEXT
);

-- requests tablosundaki talep_no için indeks oluştur (hızlı arama için)
CREATE INDEX IF NOT EXISTS idx_requests_talep_no ON requests (talep_no);

-- muhtar_info tablosundaki ilce_adi ve mahalle_adi için indeks oluştur
CREATE INDEX IF NOT EXISTS idx_muhtar_info_ilce_mahalle ON muhtar_info (ilce_adi, mahalle_adi);

-- logs tablosundaki request_id için indeks oluştur
CREATE INDEX IF NOT EXISTS idx_logs_request_id ON logs (request_id);
