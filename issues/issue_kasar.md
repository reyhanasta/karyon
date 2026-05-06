# issue

Deskripsikan ulang issue ini secara rapi, jangan terlalu low level, jangan terlalu berat dan detail, cukup instruksikan secara highlevel. karna nanti penjelsannya ini akan di implementasikan oleh junior programmer atau AI dengan kredit yang sedikit, jelaskan juga dalam bahasa inggris.

## 1. Manajemen pengeluaran

- jadikan satu fitur baru yaitu manajemen pengeluaran dan pemasukan
- tambahkan fitur (tambah pemasukan dengan akun yang sesuai)
- Pada tabel manajemen, kolom akun beban dan akun kas tidak ada isi. mungkin bisa ditelaah ulang

## 2. Dashboard

- Button jurnal entry belum berfungsi
- terdapat loading issue pada bagian card persetujuan tertunda dan aktivitas terakhir

## 3. Nasabah

### Index

- Ganti title dari "Manajemen Anggota" -> "Manajemen Nasabah"
- Filter status sama sekali tidak berfungsi
- hilangkan field cabang, nomor telepon di tabel
- Export jadi format xlsx atau pdf

### Create

- Remove identity type input or make KTP as default

## 4. Simpanan

- Export jadi format xlsx atau pdf

## 5. Pinjaman

- Remove filter cabang, product,
- Add filter User/staff yang bertanggung jawab
- di table tambahkan progress angsuran (terbayar dan sisa angsuran)

## 6 Daily Collection

- pada halaman daily collection untuk collector, tambahkan pagination sebesar 21 item per halaman.
- Buatkan 1 halaman yang mengelola log aktivitas. yang pasti bisa melihat dan cetak dalam bentuk xls atau pdf, dan ada filter berdasarkan tanggal. halaman ini hanya bisa dilihat oleh admin.
