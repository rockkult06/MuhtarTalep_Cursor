-- Muhtar bilgilerine fotoğraf URL'i ve hemşehri no alanlarını ekle

-- Fotoğraf URL alanını ekle
ALTER TABLE muhtar_info 
ADD COLUMN IF NOT EXISTS fotograf_url TEXT;

-- Hemşehri no alanını ekle  
ALTER TABLE muhtar_info 
ADD COLUMN IF NOT EXISTS hemsehri_no TEXT;

-- Indeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_muhtar_info_hemsehri_no ON muhtar_info(hemsehri_no); 