# Admin Panel Kurulumu ve Giriş

## Admin Giriş Sorunu Çözümü

Admin paneline giriş yapmak için environment variable'ları ayarlamanız gerekiyor.

### 1. Environment Variable'ları Ayarlayın

Projenizin kök dizininde `.env.local` dosyası oluşturun (eğer yoksa):

```bash
# .env.local dosyası oluşturun
```

Dosyaya şunları ekleyin:

```env
# Admin Credentials
ADMIN_USERNAME=chefyunuskalkan
ADMIN_PASSWORD=Antalya1250

# Diğer gerekli değişkenler
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL="file:./dev.db"
```

### 2. Server'ı Yeniden Başlatın

Environment variable'ları değiştirdikten sonra:

```bash
# Server'ı durdurun (Ctrl+C)
# Sonra tekrar başlatın
npm run dev
```

### 3. Admin Paneline Giriş

1. Tarayıcıda şu adrese gidin: `http://localhost:3000/admin`
2. Username: `chefyunuskalkan` (veya .env.local'de belirlediğiniz)
3. Password: `Antalya1250` (veya .env.local'de belirlediğiniz)

### 4. Güvenlik Notu

**ÖNEMLİ:** Production'a geçmeden önce mutlaka şifreyi değiştirin!

Production için `.env.production` dosyasında:

```env
ADMIN_USERNAME=your-secure-username
ADMIN_PASSWORD=your-very-secure-password-minimum-16-chars
```

### 5. Admin Kullanıcısı Veritabanında

İlk girişte sistem otomatik olarak veritabanında admin kullanıcısını oluşturur:
- Username: ADMIN_USERNAME değeri
- Role: OWNER
- Password: ADMIN_PASSWORD hash'lenmiş hali

### Sorun Giderme

**"Admin credentials not configured" hatası:**
- `.env.local` dosyasının doğru yerde olduğundan emin olun
- Dosyada `ADMIN_USERNAME` ve `ADMIN_PASSWORD` tanımlı olduğunu kontrol edin
- Server'ı yeniden başlatın

**"Invalid credentials" hatası:**
- Kullanıcı adı ve şifrenin `.env.local`'deki ile tam olarak eşleştiğinden emin olun
- Boşluk veya özel karakter olmamalı

**Veritabanı hatası:**
- `DATABASE_URL`'in doğru olduğundan emin olun
- Prisma migrations'ın çalıştırıldığından emin olun: `npx prisma migrate dev`

### Admin Panel Özellikleri

Admin panelinde şunları yapabilirsiniz:
- Kitap yönetimi (ekleme, düzenleme, silme)
- Kullanıcı yönetimi
- Sistem ayarları

Panele erişim: `/admin/dashboard`

