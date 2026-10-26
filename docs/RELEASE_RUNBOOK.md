# Altın İz — V1 Canlıya Çıkış, Yedekleme ve Geri Dönüş Kılavuzu (Release Runbook)

**Belge adı:** `RELEASE_RUNBOOK.md`  
**Proje:** Altın İz  
**Belge sürümü:** 1.1 Taslak  
**Son güncelleme:** 26.10.2026  
**Proje aşaması:** Bölüm 22: V1 Yayımlama Öncesi Son Kontrol (v1.0.0-rc1)  

Bu doküman, **Altın İz** uygulamasının canlı üretim (production) ortamına yayımlanması, veritabanı yedeğinin alınması, olası acil durumlarda geri dönüş (rollback) yapılması ve migration adımlarının doğrulanması için operasyonel referanstır.

---

## 1. Production Veritabanı ve Migration Doğrulaması

Supabase production veritabanına uygulanması gereken 15 adet sıralı migration dosyası bulunmaktadır:

1. `supabase/migrations/20261022000001_extensions_and_helpers.sql` (UUID, pgcrypto ve tetikleyici fonksiyonlar)
2. `supabase/migrations/20261022000002_user_tables.sql` (Profiller ve kullanıcı tercihleri)
3. `supabase/migrations/20261022000003_product_and_price_tables.sql` (Altın türleri ve fiyat geçmişi)
4. `supabase/migrations/20261022000004_portfolio_tables.sql` (Kullanıcı portföy varlıkları)
5. `supabase/migrations/20261022000005_legal_and_security_tables.sql` (KVKK metinleri, kullanıcı onayları ve denetim logları)
6. `supabase/migrations/20261022000006_rls_and_security_policies.sql` (RLS güvenlik politikaları)
7. `supabase/migrations/20261022000007_price_source_product_mappings.sql` (Altın API ve Serbest Piyasa fiyat eşleştirme tablosu)
8. `supabase/migrations/20261024000008_atomic_account_deletion.sql` (Atomik hesap silme ve anonimleştirme RPC fonksiyonu — ADR-033)
9. `supabase/migrations/20261024000009_lock_sync_gold_price.sql` (Fiyat yazma yetkisini service_role'a kilitleme — SECURITY.md 8.6)
10. `supabase/migrations/20261024000010_scheduler_and_security_hardening.sql` (Eşleştirme RLS kilidi, Truncgil sağlayıcı adı, atomik auth.users silimi ve pg_cron zamanlayıcısı)
11. `supabase/migrations/20261025000011_portfolio_integrity_and_retention_cleanup.sql` (Portföy ürün/miktar doğrulama tetikleyicisi, 30 günlük bayat fiyat temizliği RPC ve haftalık pg_cron)
12. `supabase/migrations/20261025000012_activate_missing_products_and_update_legal.sql` (Eksik altın ürünlerinin aktif edilmesi, 6 adet gerçek yasal belgenin SHA-256 özetiyle güncellenmesi ve 24/7 her 15 dk pg_cron zamanlayıcısı)
13. `supabase/migrations/20261026000013_account_deletion_model_a_and_retry.sql` (Model A hesap silme şema kısıtı 'auth_deletion_pending', execute_account_deletion RPC uyarlaması ve process_pending_auth_deletions telafi mekanizması)
14. `supabase/migrations/20261026000014_account_deletion_locking_and_retry_limits.sql` (Eşzamanlılık kilitlemesi FOR UPDATE SKIP LOCKED, retry_count sütunu, tavan sınır kontrolü ve idempotency güvencesi)
15. `supabase/migrations/20261026000015_account_deletion_admin_api_worker.sql` (auth.users doğrudan SQL siliminin tamamen kaldırılması, claim_pending_auth_deletions RPC ve GoTrue Admin API Edge Function retry worker zamanlayıcısı)

### Edge Functions Dağıtımı
Uzak Supabase projesinde deploy edilmiş ve aktif olan 3 adet Edge Function:
- `delete-account` (Model A atomik silme ve auth.admin silme boru hattı)
- `fetch-gold-prices` (Truncgil piyasa veri akışı normalizasyonu ve service_role ile veritabanına yazım)
- `retry-account-deletions` (GoTrue Admin API deleteUser çağıran, FOR UPDATE SKIP LOCKED ile kilitlenen ve retry tavan sınırını yöneten arka plan telafi çalışanı)

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

### Plan Bazlı Yedekleme Ayrımı
- **Supabase Pro / Team Planı:** Günlük otomatik PITR (Point-in-Time Recovery) ve snapshot yedekleri varsayılan olarak etkindir. Saklama süresi en az 7 gündür. Konsol üzerinden istenilen dakikaya anlık geri dönülebilir.
- **Supabase Free (Ücretsiz) Planı:** Otomatik PITR ve anlık zaman geri dönüşü Free planda yer almaz. Bu nedenle her sürüm veya migration öncesinde manuel bağımsız `pg_dump` yedeği alınması ZORUNLUDUR.

### Canlı Öncesi Bağımsız Yedek Alma (pg_dump)

**Bash (Linux / macOS):**
```bash
pg_dump "postgres://postgres:[DB-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="altiniz_pre_v1_backup_$(date +%Y%m%d_%H%M%S).dump"
```

**Windows PowerShell:**
```powershell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
pg_dump "postgres://postgres:[DB-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" `
  --format=custom `
  --no-owner `
  --no-privileges `
  --file="altiniz_pre_v1_backup_$timestamp.dump"
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
1. **Supabase Veritabanı Geri Yükleme:**
   - **Pro/Team Planı:** Supabase Dashboard > Database > Backups menüsünden sorunlu sürüm öncesi zaman damgasına anlık PITR geri dönüşü tetiklenir.
   - **Free Planı:** Alınan en son `.dump` yedeği `pg_restore` ile canlı veritabanına uygulanır:
     ```powershell
     pg_restore --clean --if-exists --no-owner --no-privileges `
       -d "postgres://postgres:[DB-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" `
       "altiniz_pre_v1_backup_xxx.dump"
     ```
2. **Edge Function Geri Alma:**
   - Sorunlu Edge Function bir önceki kararlı sürüme deploy edilir:
     ```bash
     npx supabase functions deploy delete-account --version <previous_stable_version>
     ```

---

## 4. Destek Kanalı ve Hesap Silme Doğrulaması

- **Resmi Destek Kanalı:** `adem@altiniz.app`
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
