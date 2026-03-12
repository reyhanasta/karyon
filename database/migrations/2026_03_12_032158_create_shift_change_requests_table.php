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
        Schema::create('shift_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('target_id')->constrained('employees')->cascadeOnDelete();
            $table->date('request_date');
            $table->foreignId('requester_shift_id')->constrained('shifts')->cascadeOnDelete();
            $table->foreignId('target_shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->text('reason')->nullable();
            
            $table->enum('status', ['pending_target', 'pending_hrd', 'approved', 'rejected'])->default('pending_target');
            
            $table->foreignId('target_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('target_approved_at')->nullable();
            
            $table->foreignId('hrd_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('hrd_approved_at')->nullable();
            
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_change_requests');
    }
};
