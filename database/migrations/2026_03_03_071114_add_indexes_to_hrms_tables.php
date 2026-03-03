<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->index('full_name');
            $table->index('department');
            $table->index('position');
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->index('status');
            $table->index(['employee_id', 'status']); // composite for filtered employee queries
        });

        Schema::table('overtime_requests', function (Blueprint $table) {
            $table->index('status');
            $table->index('date');
            $table->index(['employee_id', 'status']); // composite for filtered employee queries
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['full_name']);
            $table->dropIndex(['department']);
            $table->dropIndex(['position']);
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['employee_id', 'status']);
        });

        Schema::table('overtime_requests', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['date']);
            $table->dropIndex(['employee_id', 'status']);
        });
    }
};
