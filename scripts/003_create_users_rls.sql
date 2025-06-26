-- Users tablosu için Satır Seviyesi Güvenliği (RLS) etkinleştirilir.
-- Bu, aşağıdaki kurallar (policy) uygulanana kadar tüm erişimi engeller.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politika: Herkesin (anonim dahil) kullanıcı listesini okumasına izin ver.
-- UYARI: Bu, şifre dahil tüm kullanıcı verilerini okunabilir hale getirir.
-- Gerçek bir uygulamada bu kural daha kısıtlayıcı olmalıdır.
CREATE POLICY "Enable read access for all users"
ON public.users
FOR SELECT
USING (true);

-- Politika: Herkesin yeni kullanıcı eklemesine izin ver.
CREATE POLICY "Enable insert for all users"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Politika: Herkesin kullanıcı silmesine izin ver.
CREATE POLICY "Enable delete for all users"
ON public.users
FOR DELETE
USING (true); 