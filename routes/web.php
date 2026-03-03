<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Employee management — requires at minimum employee.view permission
    Route::resource('employees', App\Http\Controllers\EmployeeController::class);

    // Organization data
    Route::resource('departments', App\Http\Controllers\DepartmentController::class)->except(['create', 'show', 'edit']);
    Route::resource('positions', App\Http\Controllers\PositionController::class)->except(['create', 'show', 'edit']);

    // Leave requests
    Route::resource('leave-requests', App\Http\Controllers\LeaveRequestController::class);
    Route::post('leave-requests/{leaveRequest}/status', [App\Http\Controllers\LeaveRequestController::class, 'updateStatus'])->name('leave-requests.status');

    // Overtime requests
    Route::resource('overtime-requests', App\Http\Controllers\OvertimeRequestController::class);
    Route::post('overtime-requests/{overtimeRequest}/status', [App\Http\Controllers\OvertimeRequestController::class, 'updateStatus'])->name('overtime-requests.status');
});

require __DIR__.'/settings.php';
