# Integrasi Roles & Permissions

Dokumen ini menjelaskan pembagian peran (roles) dan hak akses (permissions) dalam sistem KaryaOne.

## Deskripsi Role & Permission

### 1. Super Admin
*   **Akses Penuh:** Memiliki kontrol total terhadap seluruh fitur di dalam sistem tanpa batasan.
*   **Manajemen Sistem:** Mengelola konfigurasi peran (roles), izin (permissions), dan pengaturan sistem global.
*   **Manajemen Data Master:** Memiliki hak untuk membuat, melihat, mengubah, dan menghapus data Karyawan, Departemen, Jabatan, dan Shift.
*   **Overriding:** Dapat melakukan tindakan apa pun yang tersedia dalam aplikasi.

### 2. HR Admin (HRD)
*   **Manajemen Karyawan:** Mengelola siklus hidup data karyawan (Tambah, Ubah, Lihat, Hapus).
*   **Struktur Organisasi:** Mengelola data Departemen dan Jabatan.
*   **Operasional Kepegawaian:** Mengelola jadwal shift dan tipe dokumen perusahaan.
*   **Approval HRD:** Bertanggung jawab melakukan verifikasi dan persetujuan pada tahap HRD untuk pengajuan Cuti, Lembur, dan Tukar Shift.
*   **Delegasi Pengajuan:** Memiliki kemampuan untuk membuat pengajuan (Cuti/Lembur/Shift) atas nama karyawan lain (`create.any`).

### 3. Manager
*   **Monitoring Tim:** Melihat data profil karyawan, departemen, dan jabatan untuk kebutuhan manajerial.
*   **Approval Manager:** Bertanggung jawab memberikan persetujuan pada tingkat manajer untuk pengajuan Cuti, Lembur, dan Tukar Shift.
*   **Manajemen Jadwal:** Memiliki akses untuk mengelola jadwal shift di bawah departemennya.
*   **Delegasi Pengajuan:** Dapat membuatkan pengajuan untuk anggota timnya jika diperlukan.
*   **Profil Mandiri:** Mengelola dan memperbarui informasi profil pribadi.

### 4. Karu (Kepala Ruangan)
*   **Pengawasan Operasional:** Melihat jadwal shift dan daftar pengajuan tukar shift di lingkup ruangannya.
*   **Approval Lini Pertama:** Bertindak sebagai pemberi persetujuan pertama (menggunakan izin level Manager) untuk pengajuan Cuti, Lembur, dan Tukar Shift staf di ruangannya.
*   **Pengajuan Mandiri:** Membuat, melihat, dan mengedit pengajuan Cuti, Lembur, dan Tukar Shift untuk diri sendiri.
*   **Dokumentasi:** Mengunggah dokumen pendukung untuk keperluan administrasi mandiri.

### 5. Director
*   **Oversight Eksekutif:** Melihat data karyawan, departemen, dan jabatan di seluruh perusahaan.
*   **Final Approval Cuti:** Memberikan persetujuan akhir khusus untuk pengajuan cuti yang memerlukan validasi tingkat direksi.
*   **Hak Akses Approval Luas:** Memiliki akses untuk menyetujui di tingkat Manager/HRD sebagai bentuk pengawasan (tergantung alur workflow).
*   **Pengajuan Mandiri:** Memiliki akses untuk membuat pengajuan cuti dan lembur pribadi.

### 6. Employee (Karyawan)
*   **Akses Mandiri:** Melihat jadwal shift kerja yang telah ditetapkan untuk dirinya sendiri.
*   **Siklus Pengajuan:** Membuat, melihat status, dan mengedit pengajuan Cuti, Lembur, serta Tukar Shift miliknya selama status masih pending.
*   **Manajemen Profil:** Memperbarui data profil pribadi agar tetap up-to-date.
*   **Unggah Dokumen:** Mengunggah bukti pendukung (misal: surat dokter) untuk pengajuan yang dilakukan.
*   **Tanpa Hak Approval:** Tidak memiliki otoritas untuk menyetujui pengajuan apa pun dalam sistem.
