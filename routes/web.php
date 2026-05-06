<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDocumentController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OvertimeRequestController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ShiftChangeRequestController;
use App\Http\Controllers\ShiftController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/my-profile', [EmployeeController::class, 'myProfile'])->name('my-profile');
    Route::get('/my-profile/edit', [EmployeeController::class, 'editMyProfile'])->name('my-profile.edit');
    Route::put('/my-profile', [EmployeeController::class, 'updateMyProfile'])->name('my-profile.update');

    // Employee management
    Route::get('employees/export', [EmployeeController::class, 'export'])
        ->name('employees.export')
        ->middleware('permission:employee.view');
    Route::post('employees/import', [EmployeeController::class, 'import'])
        ->name('employees.import')
        ->middleware('permission:employee.create');
    Route::resource('employees', EmployeeController::class)
        ->middleware('permission:employee.view');

    // Employee Documents (nested under employees)
    Route::post('employees/{employee}/documents', [EmployeeDocumentController::class, 'store'])
        ->name('employee-documents.store');
    Route::get('employees/{employee}/documents/{document}/download', [EmployeeDocumentController::class, 'download'])
        ->name('employee-documents.download');
    Route::delete('employees/{employee}/documents/{document}', [EmployeeDocumentController::class, 'destroy'])
        ->name('employee-documents.destroy');

    // Organization data (managed by those who can view employees)
    Route::resource('departments', DepartmentController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');
    Route::resource('positions', PositionController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');

    // Leave requests
    Route::get('leave-requests/export/excel', [LeaveRequestController::class, 'exportExcel'])
        ->name('leave-requests.export.excel')
        ->middleware('permission:leave-request.view');
    Route::get('leave-requests/export/pdf', [LeaveRequestController::class, 'exportPdf'])
        ->name('leave-requests.export.pdf')
        ->middleware('permission:leave-request.view');
    Route::resource('leave-requests', LeaveRequestController::class)
        ->middleware('permission:leave-request.view');
    Route::post('leave-requests/{leaveRequest}/cancel', [LeaveRequestController::class, 'cancel'])
        ->name('leave-requests.cancel');
    Route::post('leave-requests/{leaveRequest}/status', [LeaveRequestController::class, 'updateStatus'])
        ->name('leave-requests.status')
        ->middleware('permission:leave-request.approve.hrd|leave-request.approve.manager|leave-request.approve.director');

    // Overtime requests
    Route::get('overtime-requests/export/excel', [OvertimeRequestController::class, 'exportExcel'])
        ->name('overtime-requests.export.excel')
        ->middleware('permission:overtime-request.view');
    Route::get('overtime-requests/export/pdf', [OvertimeRequestController::class, 'exportPdf'])
        ->name('overtime-requests.export.pdf')
        ->middleware('permission:overtime-request.view');
    Route::resource('overtime-requests', OvertimeRequestController::class)
        ->middleware('permission:overtime-request.view');
    Route::post('overtime-requests/{overtimeRequest}/cancel', [OvertimeRequestController::class, 'cancel'])
        ->name('overtime-requests.cancel');
    Route::post('overtime-requests/{overtimeRequest}/status', [OvertimeRequestController::class, 'updateStatus'])
        ->name('overtime-requests.status')
        ->middleware('permission:overtime-request.approve.hrd|overtime-request.approve.manager');
    Route::post('overtime-requests/{overtimeRequest}/toggle-export', [OvertimeRequestController::class, 'toggleExport'])
        ->name('overtime-requests.toggle-export')
        ->middleware('permission:overtime-request.approve.hrd');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Leave type management
    Route::resource('leave-types', LeaveTypeController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');

    // Document type management
    Route::resource('document-types', DocumentTypeController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');

    // Shift management
    Route::resource('shifts', ShiftController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:shift.view');

    // Shift Assignments
    // Route::post('shift-assignments/bulk', [App\Http\Controllers\ShiftAssignmentController::class, 'bulkStore'])
    //     ->name('shift-assignments.bulkStore')
    //     ->middleware('permission:shift.manage');
    // Route::resource('shift-assignments', App\Http\Controllers\ShiftAssignmentController::class)
    //     ->only(['index', 'store', 'destroy'])
    //     ->middleware('permission:shift.view');

    // Shift Change Requests
    Route::post('shift-change-requests/{shift_change_request}/approve-target', [ShiftChangeRequestController::class, 'approveTarget'])
        ->name('shift-change-requests.approve-target');
    Route::post('shift-change-requests/{shift_change_request}/approve-hrd', [ShiftChangeRequestController::class, 'approveHrd'])
        ->name('shift-change-requests.approve-hrd');
    Route::post('shift-change-requests/{shift_change_request}/approve-manager', [ShiftChangeRequestController::class, 'approveManager'])
        ->name('shift-change-requests.approve-manager');
    Route::post('shift-change-requests/{shift_change_request}/status', [ShiftChangeRequestController::class, 'updateStatus'])
        ->name('shift-change-requests.status')
        ->middleware('permission:shift-change-request.approve.hrd|shift-change-request.approve.manager');
    Route::post('shift-change-requests/{shift_change_request}/reject', [ShiftChangeRequestController::class, 'reject'])
        ->name('shift-change-requests.reject');
    Route::get('shift-change-requests/export/excel', [ShiftChangeRequestController::class, 'exportExcel'])
        ->name('shift-change-requests.export.excel')
        ->middleware('permission:shift-change-request.export');
    Route::get('shift-change-requests/export/pdf', [ShiftChangeRequestController::class, 'exportPdf'])
        ->name('shift-change-requests.export.pdf')
        ->middleware('permission:shift-change-request.export');
    Route::post('shift-change-requests/{shift_change_request}/cancel', [ShiftChangeRequestController::class, 'cancel'])
        ->name('shift-change-requests.cancel');
    Route::resource('shift-change-requests', ShiftChangeRequestController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update'])
        ->middleware('permission:shift-change-request.view');
});

require __DIR__.'/settings.php';
