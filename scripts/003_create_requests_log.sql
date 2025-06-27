-- taleplerin geçmişini tutacak yeni bir tablo oluştur
CREATE TABLE IF NOT EXISTS requests_log (
    log_id SERIAL PRIMARY KEY,
    log_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    log_action TEXT NOT NULL CHECK (log_action IN ('INSERT', 'UPDATE', 'DELETE')),
    
    -- requests tablosundaki sütunlar
    id UUID,
    talep_no TEXT,
    talebi_olusturan TEXT,
    ilce_adi TEXT,
    mahalle_adi TEXT,
    muhtar_adi TEXT,
    muhtar_telefonu TEXT,
    talebin_gelis_sekli TEXT,
    talep_tarihi DATE,
    talep_konusu TEXT,
    aciklama TEXT,
    degerlendirme TEXT,
    degerlendirme_sonucu TEXT,
    guncelleme_tarihi DATE,
    guncelleyen TEXT
);

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION log_requests_changes()
RETURNS TRIGGER AS $$
DECLARE
    record_to_log RECORD;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        record_to_log := OLD;
    ELSE
        record_to_log := NEW;
    END IF;

    INSERT INTO requests_log (
        log_action,
        id, talep_no, talebi_olusturan, ilce_adi, mahalle_adi, muhtar_adi,
        muhtar_telefonu, talebin_gelis_sekli, talep_tarihi, talep_konusu,
        aciklama, degerlendirme, degerlendirme_sonucu, guncelleme_tarihi, guncelleyen
    )
    VALUES (
        TG_OP,
        record_to_log.id, record_to_log.talep_no, record_to_log.talebi_olusturan, record_to_log.ilce_adi, record_to_log.mahalle_adi, record_to_log.muhtar_adi,
        record_to_log.muhtar_telefonu, record_to_log.talebin_gelis_sekli, record_to_log.talep_tarihi, record_to_log.talep_konusu,
        record_to_log.aciklama, record_to_log.degerlendirme, record_to_log.degerlendirme_sonucu, record_to_log.guncelleme_tarihi, record_to_log.guncelleyen
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı requests tablosuna ekle
-- Önce varsa trigger'ı sil, sonra tekrar oluştur. Böylece script tekrar çalıştırılabilir.
DROP TRIGGER IF EXISTS requests_audit_trigger ON requests;
CREATE TRIGGER requests_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON requests
FOR EACH ROW EXECUTE FUNCTION log_requests_changes(); 