<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeDocumentController extends Controller
{
    public function store(Request $request, Employee $employee)
    {
        // Authorization handled in routes/middleware or Policy. 
        // For simplicity, we assume HRD can upload for anyone, employee can only upload for themselves.
        if (!auth()->user()->can('employee.edit') && auth()->user()->id !== $employee->user_id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'document_type_id' => 'required|exists:document_types,id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB limit
            'notes' => 'nullable|string',
        ]);

        // Check for existing document of this type
        $existingDoc = $employee->documents()->where('document_type_id', $validated['document_type_id'])->first();
        if ($existingDoc) {
            return back()->with('error', 'Karyawan sudah memiliki dokumen untuk tipe ini. Harap hapus yang lama terlebih dahulu.');
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        // Create unique path: private/employee-documents/{employee_id}/{random_string}_{filename}
        $path = $file->storeAs(
            "private/employee-documents/{$employee->id}",
            Str::random(10) . '_' . Str::slug(pathinfo($fileName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension()
        );

        $employee->documents()->create([
            'document_type_id' => $validated['document_type_id'],
            'file_name' => $fileName,
            'file_path' => $path,
            'uploaded_by' => auth()->id(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Dokumen berhasil diunggah.');
    }

    public function download(Employee $employee, EmployeeDocument $document)
    {
        // Must belong to this employee
        if ($document->employee_id !== $employee->id) {
            abort(404);
        }

        // Authorization
        if (!auth()->user()->can('employee.view') && auth()->user()->id !== $employee->user_id) {
            abort(403, 'Unauthorized action.');
        }

        if (!Storage::exists($document->file_path)) {
            return back()->with('error', 'File fisik tidak ditemukan di server.');
        }

        return Storage::download($document->file_path, $document->file_name);
    }

    public function destroy(Employee $employee, EmployeeDocument $document)
    {
        // Must belong to this employee
        if ($document->employee_id !== $employee->id) {
            abort(404);
        }

        // Authorization
        if (!auth()->user()->can('employee.edit') && auth()->user()->id !== $employee->user_id) {
            abort(403, 'Unauthorized action.');
        }

        // Delete phyiscal file if exists
        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }
}
