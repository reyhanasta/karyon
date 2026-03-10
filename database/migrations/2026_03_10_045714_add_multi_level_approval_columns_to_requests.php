<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add to leave_requests
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->foreignId('hrd_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('hrd_approved_at')->nullable();
            
            $table->foreignId('manager_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('manager_approved_at')->nullable();
            
            $table->foreignId('director_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('director_approved_at')->nullable();
        });

        // Add to overtime_requests
        Schema::table('overtime_requests', function (Blueprint $table) {
            $table->foreignId('hrd_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('hrd_approved_at')->nullable();
            
            $table->foreignId('manager_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('manager_approved_at')->nullable();
            
            $table->foreignId('director_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('director_approved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropForeign(['hrd_approved_by']);
            $table->dropColumn(['hrd_approved_by', 'hrd_approved_at']);
            
            $table->dropForeign(['manager_approved_by']);
            $table->dropColumn(['manager_approved_by', 'manager_approved_at']);
            
            $table->dropForeign(['director_approved_by']);
            $table->dropColumn(['director_approved_by', 'director_approved_at']);
        });

        Schema::table('overtime_requests', function (Blueprint $table) {
            $table->dropForeign(['hrd_approved_by']);
            $table->dropColumn(['hrd_approved_by', 'hrd_approved_at']);
            
            $table->dropForeign(['manager_approved_by']);
            $table->dropColumn(['manager_approved_by', 'manager_approved_at']);
            
            $table->dropForeign(['director_approved_by']);
            $table->dropColumn(['director_approved_by', 'director_approved_at']);
        });
    }
};
