// Test muhtar verilerini kontrol etmek için basit script
console.log('Muhtar verilerini test ediliyor...')

// Bu dosyayı tarayıcı console'unda çalıştırabilirsiniz
async function testMuhtarData() {
  try {
    console.log('Muhtar verilerini çekiliyor...')
    
    // Bu kodu tarayıcı console'unda çalıştırın
    const response = await fetch('/api/muhtar-data')
    const data = await response.json()
    
    console.log('Toplam muhtar sayısı:', data.length)
    console.log('İlk 5 muhtar verisi:', data.slice(0, 5))
    
    // Fotoğrafı olan muhtarları bul
    const muhtarWithPhotos = data.filter(m => m.fotografUrl)
    console.log('Fotoğrafı olan muhtar sayısı:', muhtarWithPhotos.length)
    console.log('Fotoğrafı olan muhtarlar:', muhtarWithPhotos)
    
    // Hemşehri numarası olan muhtarları bul
    const muhtarWithHemsehri = data.filter(m => m.hemsehriNo)
    console.log('Hemşehri numarası olan muhtar sayısı:', muhtarWithHemsehri.length)
    
  } catch (error) {
    console.error('Muhtar verileri test edilirken hata:', error)
  }
}

// Tarayıcı console'unda testMuhtarData() yazarak çalıştırın 