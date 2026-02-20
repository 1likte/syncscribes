# SyncScribes - GitHub & Deploy Rehberi

## 1. GitHub'a Push Etme

Push başarısız oldu (kimlik doğrulama gerekiyor). Şu yöntemlerden birini kullanın:

### Yöntem A: GitHub CLI (Önerilen)
```powershell
# GitHub CLI yüklü değilse: winget install GitHub.cli
gh auth login
git push -u origin main
```

### Yöntem B: Personal Access Token (PAT)
1. GitHub → Settings → Developer settings → Personal access tokens
2. "Generate new token" → `repo` izni verin
3. Token'ı kopyalayın
4. Push yaparken şifre yerine bu token'ı girin:
```powershell
git push -u origin main
# Username: 1likte
# Password: [yeni oluşturduğunuz token]
```

### Yöntem C: Git Credential Manager
```powershell
git config --global credential.helper manager
git push -u origin main
# Açılan pencereden GitHub ile giriş yapın
```

---

## 2. Deploy (Netlify)

Projede `netlify.toml` zaten var. Netlify'a deploy için:

1. [Netlify](https://netlify.com) hesabı açın
2. "Add new site" → "Import an existing project"
3. GitHub bağlayın → `1likte/syncscribes` repo'sunu seçin
4. Build ayarları otomatik gelir (`netlify.toml` sayesinde)
5. Environment variables ekleyin (`.env` dosyanızdaki değişkenler):
   - `DATABASE_URL` (Supabase veya Prisma için)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (deploy sonrası Netlify URL)
   - Stripe keys, vs.

---

## 3. Alternatif: Vercel Deploy

Next.js için Vercel da kullanılabilir:

1. [Vercel](https://vercel.com) hesabı açın
2. "New Project" → GitHub'dan `syncscribes` import edin
3. Framework: Next.js (otomatik algılanır)
4. Environment variables ekleyin
5. Deploy

---

## Prisma Notu

Build'de `prisma generate` zaten çalışıyor. Production'da Prisma migrations için:
- Netlify: Build command'a `prisma migrate deploy` ekleyebilirsiniz (DB hazırsa)
- Vercel: Benzer şekilde build hooks kullanın
