# Issue: Data Overwrite pada Sistem Approval Multilevel (Multiple HRD Scenario)

## Deskripsi Masalah
Saat ini, sistem persetujuan (approval) menggunakan kolom status dan kolom approver langsung di tabel utama (misal: `leave_requests`). Hal ini menyebabkan masalah **data loss** ketika terdapat lebih dari satu orang dengan peran yang sama (misal: HRD A dan HRD B) memproses dokumen yang sama pada tahap berbeda.

### Skenario Kejadian:
1. **HRD A** menyetujui dokumen pada tahap "HRD". Database mencatat `hrd_approved_by = ID_HRD_A`.
2. Dokumen berlanjut ke tahap "Direktur".
3. Karena urgensi, **HRD B** melakukan **Bypass Approval** pada tahap "Direktur".
4. Sistem saat ini menjalankan logika `updateStatus` yang memperbarui `hrd_approved_by`.
5. **Hasilnya:** Data **HRD A** terhapus (ditimpa) oleh **HRD B**. Riwayat visual hanya menunjukkan HRD B yang memproses dari awal hingga akhir.

## Dampak
- Hilangnya integritas data riwayat (Audit Trail).
- Kebingungan pada sisi pengguna/karyawan karena nama approver bisa berubah secara tiba-tiba di tengah proses.
- Kesulitan dalam pelaporan (Reporting) jika ingin melihat produktivitas per individu approver.

## Usulan Solusi

### Opsi 1: Penambahan Tabel Audit Log (Direkomendasikan)
Memisahkan data pengajuan dengan data riwayat persetujuan.
- Buat tabel `approval_logs` (fields: `request_id`, `request_type`, `approver_id`, `action`, `stage`, `comment`, `created_at`).
- Setiap klik tombol "Setujui" atau "Tolak" akan menambah baris baru di tabel ini, bukan menimpa kolom di tabel utama.

### Opsi 2: Logika "Prevent Overwrite" (Solusi Cepat)
Modifikasi `UpdateStatus` di Controller:
```php
// Contoh logika
if (!$leaveRequest->hrd_approved_by) {
    $updateData['hrd_approved_by'] = Auth::id();
    $updateData['hrd_approved_at'] = now();
}
```
*Catatan: Opsi ini memiliki kelemahan jika kita tetap ingin mencatat siapa yang melakukan bypass terakhir.*

## Langkah Kerja Selanjutnya
- [ ] Analisis dampak perubahan skema database pada komponen `ApprovalHistory.tsx`.
- [ ] Migrasi data persetujuan lama ke sistem log yang baru.
- [ ] Update controller untuk mendukung penulisan ke tabel log.
- [ ] Refactor komponen Frontend agar mengambil data dari relasi log, bukan kolom tunggal.

---
**Status:** *Pending (Backlog)*
**Priority:** *Medium*
