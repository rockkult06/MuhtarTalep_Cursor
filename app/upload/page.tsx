"use client"

import { Header } from "@/components/header"
import { DataUploadForm } from "@/components/data-upload-form"

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-theme-soft-gray">
      {" "}
      {/* Soft gri arka plan */}
      <Header />
      <main className="flex-1 p-8 md:p-10 animate-fade-in">
        {" "}
        {/* Daha geniş boşluklar, fade-in animasyon */}
        <h1 className="text-3xl font-bold mb-8">Veri Yükleme</h1> {/* Daha fazla boşluk */}
        <DataUploadForm
          onUploadSuccess={() => {
            /* Buraya yükleme sonrası yapılacaklar eklenebilir, örneğin bir toast mesajı gösterilebilir veya ana sayfadaki veriler tekrar yüklenebilir. */
          }}
        />
      </main>
    </div>
  )
}
