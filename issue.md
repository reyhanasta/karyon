# Combobox Component: Mengganti Select dengan Searchable Combobox

## Latar Belakang

Saat ini, form-form di aplikasi menggunakan `<Select>` untuk memilih data seperti jabatan, departemen, karyawan, dll. Ketika jumlah data banyak, user harus scroll manual untuk mencari item yang tepat. Solusinya adalah membuat **FormCombobox** — sebuah wrapper component di atas shadcn Combobox primitives (`@base-ui/react`) yang menyediakan searchable dropdown.

### Komponen yang sudah ada:
- **`combobox.tsx`** (shadcn primitives) — Low-level building blocks dari `@base-ui/react`
- **`EmployeeCombobox`** — Custom combobox khusus karyawan, dibuat manual dengan Popover

## User Review Required

> [!IMPORTANT]
> **Strategi penggantian Select → Combobox:**
> Hanya Select yang datanya **dinamis dari server** (positions, departments, employees, roles, shifts, leave types) yang akan diganti. Select dengan opsi **statis/sedikit** (seperti `employee_status` yang hanya 4 opsi) tetap menggunakan `<Select>`.

> [!IMPORTANT]
> **EmployeeCombobox:** 
> Component `EmployeeCombobox` yang sudah ada akan di-refactor untuk menggunakan `FormCombobox` secara internal, sehingga tampilan dan behavior konsisten di seluruh aplikasi.

## Proposed Changes

### Component Layer

#### [NEW] [form-combobox.tsx](file:///c:/laragon/www/karyaone/resources/js/components/form-combobox.tsx)

Komponen wrapper high-level yang membungkus shadcn Combobox primitives. API sederhana dan drop-in replacement untuk `<Select>`:

```tsx
interface FormComboboxProps {
  options: { label: string; value: string }[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  id?: string
}
```

**Contoh penggunaan:**
```tsx
<FormCombobox
  options={positions.map(p => ({ label: p.name, value: p.id.toString() }))}
  value={data.position_id}
  onValueChange={(v) => setData('position_id', v)}
  placeholder="Pilih jabatan"
  searchPlaceholder="Cari jabatan..."
/>
```

**Fitur:**
- Searchable text input di dalam dropdown popup
- Menampilkan label item yang terpilih pada trigger button
- Check icon pada item yang aktif
- Placeholder style `text-muted-foreground` saat belum ada value
- Keyboard accessible
- Menggunakan `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty` dari `combobox.tsx`

---

#### [MODIFY] [employee-combobox.tsx](file:///c:/laragon/www/karyaone/resources/js/components/employee-combobox.tsx)

Refactor `EmployeeCombobox` agar menggunakan `FormCombobox` secara internal, sambil tetap mendukung rendering kustom (nama + posisi + departemen per item). 

**Opsi pendekatan:**
- Karena `EmployeeCombobox` menampilkan rich content per item (nama, jabatan, departemen), component ini akan tetap terpisah namun akan dibangun di atas Combobox primitives yang sama (`@base-ui/react`) agar konsisten secara visual. Ini lebih praktis daripada memaksa `FormCombobox` mendukung custom render.

---

### Page Layer — Employees

#### [MODIFY] [create.tsx](file:///c:/laragon/www/karyaone/resources/js/pages/employees/create.tsx)

| Field | Sebelum | Sesudah | Alasan |
|-------|---------|---------|--------|
| `position_id` | `<Select>` | `<FormCombobox>` | Data dinamis dari server, bisa banyak |
| `department_id` | `<Select>` | `<FormCombobox>` | Data dinamis dari server, bisa banyak |
| `employee_status` | `<Select>` | `<Select>` *(tetap)* | Hanya 4 opsi statis |
| `role` | `<Select>` | `<FormCombobox>` | Data dinamis dari server |

#### [MODIFY] [edit.tsx](file:///c:/laragon/www/karyaone/resources/js/pages/employees/edit.tsx)

Sama seperti `create.tsx`:
- `position_id` → `<FormCombobox>`
- `department_id` → `<FormCombobox>`
- `employee_status` → tetap `<Select>`
- `role` → `<FormCombobox>`

---

### Page Layer — Overtime Requests

#### [MODIFY] [edit.tsx](file:///c:/laragon/www/karyaone/resources/js/pages/overtime-requests/edit.tsx)

| Field | Sebelum | Sesudah |
|-------|---------|---------|
| `employee_id` | `<Select>` | `<FormCombobox>` |

---

### Page Layer — Leave Requests

#### [MODIFY] [create.tsx](file:///c:/laragon/www/karyaone/resources/js/pages/leave-requests/create.tsx)

| Field | Sebelum | Sesudah |
|-------|---------|---------|
| `leave_type_id` | `<Select>` | `<FormCombobox>` |

#### [MODIFY] [edit.tsx](file:///c:/laragon/www/karyaone/resources/js/pages/leave-requests/edit.tsx)

| Field | Sebelum | Sesudah |
|-------|---------|---------|
| `employee_id` | `<Select>` | `<FormCombobox>` |
| `leave_type_id` | `<Select>` | `<FormCombobox>` |

---

### Page Layer — Shift Change Requests

#### [MODIFY] [create.tsx](file:///c:/laragon/www/karyaone/resources/js/pages/shift-change-requests/create.tsx)

| Field | Sebelum | Sesudah |
|-------|---------|---------|
| `requester_shift_id` | `<Select>` | `<FormCombobox>` |

> [!NOTE]
> `target_id` dan `requester_id` di halaman ini sudah menggunakan `EmployeeCombobox`, jadi tidak perlu diubah.

---

## Ringkasan Perubahan

| File | Aksi | Detail |
|------|------|--------|
| `components/form-combobox.tsx` | **NEW** | Wrapper component di atas shadcn Combobox primitives |
| `components/employee-combobox.tsx` | **MODIFY** | Refactor ke Combobox primitives yang sama |
| `pages/employees/create.tsx` | **MODIFY** | 3 Select → FormCombobox |
| `pages/employees/edit.tsx` | **MODIFY** | 3 Select → FormCombobox |
| `pages/overtime-requests/edit.tsx` | **MODIFY** | 1 Select → FormCombobox |
| `pages/leave-requests/create.tsx` | **MODIFY** | 1 Select → FormCombobox |
| `pages/leave-requests/edit.tsx` | **MODIFY** | 2 Select → FormCombobox |
| `pages/shift-change-requests/create.tsx` | **MODIFY** | 1 Select → FormCombobox |

**Total: 1 file baru, 7 file dimodifikasi**

## Open Questions

> [!IMPORTANT]
> **Apakah `EmployeeCombobox` perlu diubah juga?** 
> Component ini sudah berfungsi baik dan memiliki rendering kustom (avatar initials, posisi, departemen). Opsinya:
> 1. **Biarkan apa adanya** — hanya rebuild internal menggunakan Combobox primitives yang sama untuk konsistensi visual
> 2. **Tidak diubah sama sekali** — fokus hanya pada `FormCombobox` baru dan penggantian Select
>
> Saya merekomendasikan opsi **2** (tidak diubah) agar scope tetap fokus. Bagaimana pendapat Anda?

## Verification Plan

### Automated Tests
- `npm run build` — memastikan tidak ada error TypeScript/kompilasi

### Manual Verification
- Buka halaman **Tambah Karyawan** (`/employees/create`) → verify field jabatan, departemen, peran sudah searchable
- Buka halaman **Edit Karyawan** (`/employees/{id}/edit`) → verify sama + pre-selected value muncul
- Buka halaman **Edit Lembur** → verify field karyawan searchable
- Buka halaman **Ajukan Cuti** → verify jenis cuti searchable
- Buka halaman **Edit Cuti** → verify karyawan + jenis cuti searchable
- Buka halaman **Ajukan Penggantian Shift** → verify shift searchable
- Screenshot browser untuk dokumentasi
