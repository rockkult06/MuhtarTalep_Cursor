-- Kullanıcı bilgilerini saklamak için yeni bir tablo oluşturur.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- ÖNEMLİ: Gerçek uygulamada bu alan hash'lenmelidir.
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Başlangıç için admin kullanıcılarını ekler.
INSERT INTO users (username, password, role) VALUES
('Admin01', 'Planlama2025', 'admin'),
('Admin02', 'Planlama2025', 'admin'),
('Admin03', 'Planlama2025', 'admin'); 