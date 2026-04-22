<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shift_change_requests', function (Blueprint $table) {
            $table->foreignId('manager_approved_by')
                  ->nullable()
                  ->after('hrd_approved_at')
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamp('manager_approved_at')
                  ->nullable()
                  ->after('manager_approved_by');
        });

        // Use a raw DB statement to update the enum (MySQL only)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE shift_change_requests MODIFY COLUMN status ENUM('pending_target', 'pending_hrd', 'pending_manager', 'approved', 'rejected') DEFAULT 'pending_target'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shift_change_requests', function (Blueprint $table) {
            $table->dropForeign(['manager_approved_by']);
            $table->dropColumn(['manager_approved_by', 'manager_approved_at']);
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE shift_change_requests MODIFY COLUMN status ENUM('pending_target', 'pending_hrd', 'approved', 'rejected') DEFAULT 'pending_target'");
        }
    }
};
