# Altın İz — V1 Canlıya Çıkış, Yedekleme ve Geri Dönüş Kılavuzu (Release Runbook)

Bu doküman, **Altın İz** uygulamasının canlı üretim (production) ortamına yayımlanması, veritabanı yedeğinin alınması, olası acil durumlarda geri dönüş (rollback) yapılması ve migration adımlarının doğrulanması için operasyonel referanstır.

---

## 1. Production Veritabanı ve Migration Doğrulaması

Supabase production veritabanına uygulanması gereken 7 adet sıralı migration dosyası bulunmaktadır:

1. `supabase/migrations/20261022000001_extensions_and_helpers.sql` (UUID, pgcrypto ve tetikleyici fonksiyonlar)
2. `supabase/migrations/20261022000002_user_tables.sql` (Profiller ve kullanıcı tercihleri)
3. `supabase/migrations/20261022000003_product_and_price_tables.sql` (Altın türleri ve fiyat geçmişi)
4. `supabase/migrations/20261022000004_portfolio_tables.sql` (Kullanıcı portföy varlıkları)
5. `supabase/migrations/20261022000005_legal_and_security_tables.sql` (KVKK metinleri, kullanıcı onayları ve denetim logları)
6. `supabase/migrations/20261022000006_rls_and_security_policies.sql` (RLS güvenlik politikaları)
7. `supabase/migrations/20261022000007_price_source_product_mappings.sql` (Harem Altın fiyat eşleştirme tablosu)

### Migration Uygulama Komutu
```bash
# Canlı ortama migration uygulama
npx supabase db push --linked
```

### Doğrulama Adımları
- Tabloların oluştuğu `supabase db remote changes` ile kontrol edilir.
- RLS'in tüm tablolarda `ENABLE ROW LEVEL SECURITY` durumunda olduğu teyit edilir.
- `gold_prices` tablosunda `is_valid = true` indeksinin hazır olduğu doğrulanır.

---

## 2. Production Yedekleme Planı (Backup)

### Otomatik Yedekler (Supabase Managed Backups)
- Supabase Pro/Team planında günlük PITR (Point-in-Time Recovery) ve snapshot yedekleri varsayılan olarak etkindir.
- Saklama süresi en az 7 gündür.

### Canlı Öncesi Manuel Yedekleme (pg_dump)
Yayımlama öncesinde veya her büyük sürüm geçişinde aşağıdaki komut ile anlık bağımsız dump alınır:
```bash
pg_dump "postgres://postgres:[DB-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="altiniz_pre_v1_backup_$(date +%Y%m%d_%H%M%S).dump"
```

---

## 3. Geri Dönüş Planı (Rollback Runbook)

Canlı ortamda kritik bir sorun (P0 bloklayıcı veri bozulması, güvenlik açığı veya geri alınamaz hata) tespit edilirse uygulanacak adımlar:

### Senaryo A: Mobil İstemci Hatası (App Store / Play Store)
1. **OTA Güncellemesi (EAS Update):**
   - Hata JS katmanındaysa acil yama OTA üzerinden yayınlanır:
     ```bash
     npx eas-cli update --branch production --message "hotfix: resolve critical issue"
     ```
2. **Kademeli Dağıtımın Durdurulması:**
   - Google Play Console: Kademeli dağıtımı durdur (Halt Rollout).
   - App Store Connect: Aşamalara ayrılmış sürümü duraklat (Pause Phased Release).

### Senaryo B: Veritabanı ve API Seviyesinde Hata
1. **Supabase PITR (Noktaya Geri Dönüş):**
   - Supabase Dashboard > Database > Backups menüsünden sorunlu sürüm öncesi zaman damgasına anlık geri dönüş tetiklenir.
2. **Edge Function Geri Alma:**
   - Sorunlu Edge Function bir önceki kararlı sürüme deploy edilir:
     ```bash
     npx supabase functions deploy delete-account --version <previous_stable_version>
     ```

---

## 4. Destek Kanalı ve Hesap Silme Doğrulaması

- **Resmi Destek Kanalı:** `destek@altiniz.app`
- **Uygulama İçi Destek:** `src/app/(protected)/support.tsx`
- **Web Hesap Silme URL'si:** `https://altiniz.app/hesap-silme`
- **Uygulama İçi Hesap Silme:** `src/app/(protected)/account/delete.tsx` ve `supabase/functions/delete-account`

---

## 5. Sürüm Kaydı ve Git Etiketi (Versioning)

- `package.json` sürümü: `1.0.0`
- `app.json` Android `versionCode`: `1`, iOS `buildNumber`: `"1"`
- Git Etiketi: `v1.0.0-rc1` (veya canlı çıkışında `v1.0.0`)
```bash
git tag -a v1.0.0-rc1 -m "release: Altın İz V1 pre-release candidate"
git push origin v1.0.0-rc1
```
