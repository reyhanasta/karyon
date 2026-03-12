<?php

namespace App\Http\Controllers;

use App\Models\DocumentType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentTypeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $documentTypes = DocumentType::query()
            ->with('positions')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $positions = \App\Models\Position::orderBy('name')->get(['id', 'name']);

        return Inertia::render('document-types/index', [
            'documentTypes' => $documentTypes,
            'positions' => $positions,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:document_types,name',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'positions' => 'nullable|array',
            'positions.*.id' => 'required|exists:positions,id',
            'positions.*.is_required' => 'boolean',
        ]);

        $documentType = DocumentType::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (isset($validated['positions'])) {
            $syncData = [];
            foreach ($validated['positions'] as $position) {
                $syncData[$position['id']] = ['is_required' => $position['is_required'] ?? false];
            }
            $documentType->positions()->sync($syncData);
        }

        return back()->with('success', 'Jenis dokumen berhasil ditambahkan.');
    }

    public function update(Request $request, DocumentType $documentType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:document_types,name,' . $documentType->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'positions' => 'nullable|array',
            'positions.*.id' => 'required|exists:positions,id',
            'positions.*.is_required' => 'boolean',
        ]);

        $documentType->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (isset($validated['positions'])) {
            $syncData = [];
            foreach ($validated['positions'] as $position) {
                $syncData[$position['id']] = ['is_required' => $position['is_required'] ?? false];
            }
            $documentType->positions()->sync($syncData);
        } else {
            $documentType->positions()->sync([]);
        }

        return back()->with('success', 'Jenis dokumen berhasil diperbarui.');
    }

    public function destroy(DocumentType $documentType)
    {
        if ($documentType->employeeDocuments()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus jenis dokumen karena sedang digunakan oleh karyawan.');
        }

        $documentType->positions()->detach();
        $documentType->delete();

        return back()->with('success', 'Jenis dokumen berhasil dihapus.');
    }
}
