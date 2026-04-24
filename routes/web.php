<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/my-profile', [App\Http\Controllers\EmployeeController::class, 'myProfile'])->name('my-profile');
    Route::get('/my-profile/edit', [App\Http\Controllers\EmployeeController::class, 'editMyProfile'])->name('my-profile.edit');
    Route::put('/my-profile', [App\Http\Controllers\EmployeeController::class, 'updateMyProfile'])->name('my-profile.update');

    // Employee management
    Route::get('employees/export', [App\Http\Controllers\EmployeeController::class, 'export'])
        ->name('employees.export')
        ->middleware('permission:employee.view');
    Route::post('employees/import', [App\Http\Controllers\EmployeeController::class, 'import'])
        ->name('employees.import')
        ->middleware('permission:employee.create');
    Route::resource('employees', App\Http\Controllers\EmployeeController::class)
        ->middleware('permission:employee.view');
        
    // Employee Documents (nested under employees)
    Route::post('employees/{employee}/documents', [App\Http\Controllers\EmployeeDocumentController::class, 'store'])
        ->name('employee-documents.store');
    Route::get('employees/{employee}/documents/{document}/download', [App\Http\Controllers\EmployeeDocumentController::class, 'download'])
        ->name('employee-documents.download');
    Route::delete('employees/{employee}/documents/{document}', [App\Http\Controllers\EmployeeDocumentController::class, 'destroy'])
        ->name('employee-documents.destroy');

    // Organization data (managed by those who can view employees)
    Route::resource('departments', App\Http\Controllers\DepartmentController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');
    Route::resource('positions', App\Http\Controllers\PositionController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');

    // Leave requests
    Route::get('leave-requests/export', [App\Http\Controllers\LeaveRequestController::class, 'export'])
        ->name('leave-requests.export')
        ->middleware('permission:leave.view');
    Route::resource('leave-requests', App\Http\Controllers\LeaveRequestController::class)
        ->middleware('permission:leave.view');
    Route::post('leave-requests/{leaveRequest}/status', [App\Http\Controllers\LeaveRequestController::class, 'updateStatus'])
        ->name('leave-requests.status')
        ->middleware('permission:leave.approve.hrd|leave.approve.manager|leave.approve.director');

    // Overtime requests
    Route::get('overtime-requests/export', [App\Http\Controllers\OvertimeRequestController::class, 'export'])
        ->name('overtime-requests.export')
        ->middleware('permission:overtime.view');
    Route::resource('overtime-requests', App\Http\Controllers\OvertimeRequestController::class)
        ->middleware('permission:overtime.view');
    Route::post('overtime-requests/{overtimeRequest}/status', [App\Http\Controllers\OvertimeRequestController::class, 'updateStatus'])
        ->name('overtime-requests.status')
        ->middleware('permission:overtime.approve.hrd|overtime.approve.manager');

    // Notifications
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Leave type management
    Route::resource('leave-types', App\Http\Controllers\LeaveTypeController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');

    // Document type management
    Route::resource('document-types', App\Http\Controllers\DocumentTypeController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');

    // Shift management
    Route::resource('shifts', App\Http\Controllers\ShiftController::class)
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
    Route::post('shift-change-requests/{shift_change_request}/approve-target', [App\Http\Controllers\ShiftChangeRequestController::class, 'approveTarget'])
        ->name('shift-change-requests.approve-target');
    Route::post('shift-change-requests/{shift_change_request}/approve-hrd', [App\Http\Controllers\ShiftChangeRequestController::class, 'approveHrd'])
        ->name('shift-change-requests.approve-hrd');
    Route::post('shift-change-requests/{shift_change_request}/approve-manager', [App\Http\Controllers\ShiftChangeRequestController::class, 'approveManager'])
        ->name('shift-change-requests.approve-manager');
    Route::post('shift-change-requests/{shift_change_request}/reject', [App\Http\Controllers\ShiftChangeRequestController::class, 'reject'])
        ->name('shift-change-requests.reject');
    Route::resource('shift-change-requests', App\Http\Controllers\ShiftChangeRequestController::class)
        ->only(['index', 'create', 'store', 'show'])
        ->middleware('permission:shift-change.view');
});

require __DIR__.'/settings.php';
