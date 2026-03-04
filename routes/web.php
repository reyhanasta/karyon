<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Employee management
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
});

require __DIR__.'/settings.php';
