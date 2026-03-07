<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Employee management
    Route::get('employees/export', [App\Http\Controllers\EmployeeController::class, 'export'])
        ->name('employees.export')
        ->middleware('permission:employee.view');
    Route::post('employees/import', [App\Http\Controllers\EmployeeController::class, 'import'])
        ->name('employees.import')
        ->middleware('permission:employee.create');
    Route::resource('employees', App\Http\Controllers\EmployeeController::class)
        ->middleware('permission:employee.view');

    // Organization data (managed by those who can view employees)
    Route::resource('departments', App\Http\Controllers\DepartmentController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');
    Route::resource('positions', App\Http\Controllers\PositionController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');

    // Leave requests
    Route::resource('leave-requests', App\Http\Controllers\LeaveRequestController::class)
        ->middleware('permission:leave.view');
    Route::post('leave-requests/{leaveRequest}/status', [App\Http\Controllers\LeaveRequestController::class, 'updateStatus'])
        ->name('leave-requests.status')
        ->middleware('permission:leave.approve');

    // Overtime requests
    Route::resource('overtime-requests', App\Http\Controllers\OvertimeRequestController::class)
        ->middleware('permission:overtime.view');
    Route::post('overtime-requests/{overtimeRequest}/status', [App\Http\Controllers\OvertimeRequestController::class, 'updateStatus'])
        ->name('overtime-requests.status')
        ->middleware('permission:overtime.approve');

    // Notifications
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Leave type management
    Route::resource('leave-types', App\Http\Controllers\LeaveTypeController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware('permission:employee.view');
});

require __DIR__.'/settings.php';
