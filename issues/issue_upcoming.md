# Upcoming Features Roadmap: Karyon HRIS

Dokumen ini merinci rencana pengembangan fitur Presensi dan Payroll untuk aplikasi Karyon, yang akan mengintegrasikan modul Shift, Lembur, dan Cuti yang sudah ada.

---

## 1. Sistem Presensi Digital (Attendance System)

Fitur ini bertujuan untuk mencatat kehadiran aktual karyawan dan memvalidasinya terhadap jadwal shift yang telah ditetapkan.

### A. Struktur Data (Database)
- **Table `attendances`**:
    - `employee_id`: Relasi ke karyawan.
    - `date`: Tanggal kehadiran.
    - `check_in`: Timestamp waktu masuk.
    - `check_out`: Timestamp waktu pulang.
    - `check_in_latitude/longitude`: Koordinat lokasi saat masuk.
    - `check_out_latitude/longitude`: Koordinat lokasi saat pulang.
    - `check_in_photo`: Path foto selfie saat masuk (opsional).
    - `status`: Enum (`present`, `late`, `early_departure`, `absent`, `on_leave`).
    - `note`: Catatan tambahan dari karyawan.

### B. Alur Kerja (Workflow)
1. **Clock-in**: Karyawan melakukan absen melalui dashboard. Sistem mengambil koordinat GPS dan membandingkannya dengan koordinat kantor (Geofencing).
2. **Validasi Shift**: Sistem mencocokkan waktu `check_in` dengan `ShiftAssignment`. Jika lebih dari toleransi (misal 15 menit), status otomatis menjadi `late`.
3. **Clock-out**: Karyawan melakukan absen pulang. Sistem menghitung durasi jam kerja efektif.
4. **Auto-Absent**: Sistem menjalankan *scheduled job* setiap malam untuk menandai karyawan yang tidak ada data presensi dan tidak sedang cuti sebagai `absent`.

### C. Komponen UI/UX
- **Attendance Widget**: Tombol absen interaktif di Dashboard dengan jam real-time.
- **Maps Integration**: Preview lokasi absen pada detail presensi di sisi Admin.
- **Attendance History**: Kalender atau list riwayat kehadiran bagi karyawan.
- **Monthly Recap Table**: Tabel rekapitulasi bulanan bagi HR untuk keperluan payroll.

---

## 2. Sistem Penggajian (Payroll Management)

Fitur ini akan mengotomatisasi perhitungan gaji dengan menggabungkan gaji pokok, tunjangan, lembur, dan potongan.

### A. Struktur Data (Database)
- **Table `salary_configurations`**:
    - `employee_id`: Relasi ke karyawan.
    - `basic_salary`: Gaji pokok.
    - `transport_allowance`: Tunjangan transportasi.
    - `meal_allowance`: Tunjangan makan.
    - `other_allowances`: JSON atau tabel terpisah untuk tunjangan dinamis.
    - `bpjs_deduction`: Potongan BPJS.
- **Table `payrolls`**:
    - `month` & `year`: Periode gaji.
    - `status`: Enum (`draft`, `published`, `paid`).
    - `total_basic`, `total_overtime`, `total_allowance`, `total_deduction`, `net_salary`.
- **Table `payroll_details`**: Rincian per item (misal: "Lembur 10 jam", "Potongan Terlambat").

### B. Alur Kerja (Workflow)
1. **Setup Gaji**: HR mengonfigurasi gaji pokok dan tunjangan tetap untuk setiap karyawan.
2. **Generate Payroll**: Setiap akhir bulan, HR menekan tombol "Generate". Sistem akan:
    - Menghitung **Lembur** dari `OvertimeRequest` yang statusnya `approved` dan `is_display_export` aktif.
    - Menghitung **Potongan Cuti** (jika ada cuti di luar tanggungan) dari `LeaveRequest`.
    - Menghitung **Potongan Kehadiran** berdasarkan data `attendances` (misal: denda keterlambatan).
3. **Review & Publish**: HR memeriksa draf gaji, lalu mempublikasikannya agar bisa dilihat karyawan.
4. **Payment Tracking**: Menandai gaji sebagai `paid` setelah transfer bank dilakukan.

### C. Komponen UI/UX
- **Salary Configuration Page**: Form untuk mengatur gaji per karyawan atau per jabatan.
- **Payroll Generation Wizard**: Langkah demi langkah proses pembuatan gaji bulanan.
- **Digital Payslip (PDF)**: Template slip gaji profesional yang bisa diunduh karyawan.
- **Payroll Analytics**: Chart tren pengeluaran gaji perusahaan per bulan.

---

## Integrasi Antar Modul

| Sumber Data | Digunakan Oleh | Tujuan |
| :--- | :--- | :--- |
| **Shift Assignment** | Attendance | Validasi keterlambatan (late check-in) |
| **Attendance** | Payroll | Perhitungan potongan kehadiran & tunjangan makan |
| **Overtime Request** | Payroll | Perhitungan upah lembur otomatis |
| **Leave Request** | Payroll | Perhitungan pemotongan kuota atau gaji |
