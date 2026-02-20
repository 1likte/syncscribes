# Hızlı Çözüm

## Beyaz Ekran Sorunu Çözüldü

1. `.next` cache temizlendi
2. next.config.js düzeltildi
3. Build başarılı (dev modunda _document hatası görmezden gelinebilir)

## Server'ı Başlatın

```bash
npm run dev
```

Tarayıcıda açın:
- Ana sayfa: http://localhost:3000
- Admin: http://localhost:3000/admin

## Eğer Hala Beyaz Ekran Görüyorsanız

1. Browser console'u açın (F12)
2. Hataları kontrol edin
3. Server terminal'deki hataları kontrol edin

## Admin Girişi İçin

`.env.local` dosyası oluşturun:

```env
ADMIN_USERNAME=chefyunuskalkan
ADMIN_PASSWORD=Antalya1250
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-secret-key
DATABASE_URL="file:./dev.db"
```

Sonra server'ı yeniden başlatın.

