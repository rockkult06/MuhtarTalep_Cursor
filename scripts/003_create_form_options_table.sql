-- Bu betik, formlardaki dinamik açılır menü seçeneklerini saklamak için bir tablo oluşturur.
CREATE TABLE form_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_type TEXT NOT NULL, -- Örn: 'talepKonusu', 'degerlendirmeSonucu'
  option_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Aynı tip için aynı değerin tekrar eklenmesini engeller.
  UNIQUE(option_type, option_value)
);

-- Talep formları için başlangıç seçeneklerini ekler.
-- Bu veriler artık veritabanından yönetilecektir.
INSERT INTO form_options (option_type, option_value) VALUES
('talebinGelisSekli', 'Şifahi Bildirim'),
('talebinGelisSekli', 'HİM'),
('talebinGelisSekli', 'CİMER'),
('talebinGelisSekli', 'EBYS'),
('talebinGelisSekli', 'İlçe Koordinasyon Toplantısı'),
('talebinGelisSekli', 'Genel Md.Toplantı'),
('talepKonusu', 'Hat Talepleri'),
('talepKonusu', 'Servis Sıklıkları'),
('talepKonusu', 'Durak Talepleri'),
('talepKonusu', 'Diğer'),
('degerlendirmeSonucu', 'İnceleniyor'),
('degerlendirmeSonucu', 'Olumlu'),
('degerlendirmeSonucu', 'Olumsuz'),
('degerlendirmeSonucu', 'Değerlendirilecek'); 