-- Bu betik, mevcut 'requests' tablosundaki tüm verileri 'requests_log' tablosuna kopyalar.
-- Bu, loglama sistemi kurulduktan sonra mevcut verilerin de loglanması için tek seferlik bir işlemdir.

INSERT INTO requests_log (
    log_action,
    log_timestamp,
    id, 
    talep_no, 
    talebi_olusturan, 
    ilce_adi, 
    mahalle_adi, 
    muhtar_adi,
    muhtar_telefonu, 
    talebin_gelis_sekli, 
    talep_tarihi, 
    talep_konusu,
    aciklama, 
    degerlendirme, 
    degerlendirme_sonucu, 
    guncelleme_tarihi, 
    guncelleyen
)
SELECT
    'INSERT' AS log_action, -- Bu işlemi bir 'ekleme' olarak işaretliyoruz
    COALESCE(guncelleme_tarihi, talep_tarihi, NOW()) AS log_timestamp, -- Log zamanı olarak güncelleme veya talep tarihini kullan, yoksa şimdikini
    id, 
    talep_no, 
    talebi_olusturan, 
    ilce_adi, 
    mahalle_adi, 
    muhtar_adi,
    muhtar_telefonu, 
    talebin_gelis_sekli, 
    talep_tarihi, 
    talep_konusu,
    aciklama, 
    degerlendirme, 
    degerlendirme_sonucu, 
    guncelleme_tarihi, 
    guncelleyen
FROM
    requests
ON CONFLICT DO NOTHING; -- Olası çakışmaları önlemek için (eğer bir şekilde veri zaten varsa) 