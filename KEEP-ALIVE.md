# Jaga Supabase Gratis Tidak Pause

## Masalah

Free tier Supabase: pause setelah **1 minggu tidak aktif**.

## Solusi (tanpa upgrade)

### 1. Endpoint ping sudah dibuat

`/api/keep-alive` — akses database Supabase setiap dipanggil.

### 2. Cara ping otomatis

**Opsi A — UptimeRobot (gratis, paling mudah)**

1. Daftar di https://uptimerobot.com
2. Tambahkan monitor: `https://<domain-kamu>/api/keep-alive`
3. Set interval: 5 menit
4. Selesai — database tetap aktif

**Opsi B — Cron lokal (di server/CachyOS)**

```bash
chmod +x /run/media/auraauvarose/Local\ Disk/Aura\ Auvarose/my-portfolio/keep-alive.sh
crontab -e
# Tambahkan:
0 12 * * * /run/media/auraauvarose/Local\ Disk/Aura\ Auvarose/my-portfolio/keep-alive.sh
```

**Opsi C — Systemd timer**
Lihat `@aura/cachyos.md` untuk systemd timer.

### 3. Verifikasi

Buka `https://<domain>/api/keep-alive` di browser — harus muncul JSON `{"status":"alive"}`.

### 4. Kalau tetap mau upgrade

Pro ($25/bulan) = tidak pernah pause.
